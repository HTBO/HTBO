const mongoose = require('mongoose');
const Group = require('../models/Group');
const User = require('../models/User');

const createGroup = async (req, res) => {
    try {
        const { ownerId, name, description, members } = req.body;
        const existingGroup = await Group.findOne({ name });
        if (existingGroup) return res.status(400).json({ error: "The group's name is already taken" });
        if (!mongoose.Types.ObjectId.isValid(ownerId)) return res.status(400).json({ error: "Invalid owner ID" });
        const owner = await User.findById(ownerId);
        if (!owner) return res.status(404).json({ error: "Owner not found" });
        for (const m of members) {
            if (!mongoose.Types.ObjectId.isValid(m.memberId)) {
                return res.status(400).json({ error: `Invalid member ID: ${m.memberId}` });
            }
            if (m.memberId.toString() === ownerId.toString()) {
                return res.status(400).json({ error: "Owner cannot be a member" });
            }
            const userExists = await User.exists({ _id: m.memberId });
            if (!userExists) {
                return res.status(404).json({ error: `User not found: ${m.user}` });
            }
        }
        // console.log(ownerId, name, description, members[0]);
        
        const newGroup = await Group.create({
            ownerId,
            name,
            description,
            members: members.map(member => ({
                memberId: new mongoose.Types.ObjectId(member.memberId),
                status: "pending"
            }))
        });
        const bulkOps = members.map(m => ({
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(m.memberId) },
                update: {
                    $addToSet: {
                        groups: { groupId: newGroup._id, status: "pending" }
                    }
                }
            }
        }));
        bulkOps.push({
            updateOne: {
                filter: { _id: ownerId },
                update: {
                    $addToSet: {
                        groups: { groupId: newGroup._id, status: 'owner' }
                    }
                }
            }
        });
        await User.bulkWrite(bulkOps);
        res.status(201).json(newGroup);
    } catch (error) {
        console.error('Error during creation:', error.message);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ errors: messages });
        }
        res.status(500).json({ error: 'Server error' });
    }
};

const getAllGroups = async (req, res) => {
    try {
        const group = await Group.find();
        res.status(200).json(group);
    } catch (error) {
        console.error('Error during listing games:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
};

const getGroupById = async(req, res)=> {
    try {
        const group = await Group.findById(req.params.id);
        // console.log(req.params.id);
        if (!group) return res.status(404).json({ error: 'Group not found' });
        res.status(200).json(group);
    } catch (error) {
        console.error(error.message);
        if (error.name === 'CastError') return res.status(400).json({ error: 'Invalid session ID format' });
        res.status(500).json({ error: 'Server error' });
    }
}

const updateGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id)       
        if (!group) return res.status(404).json({ error: 'Group not found' });

        if (req.body.addMember) {
            // PATCH http://localhost:3000/api/groups/67ab5377604d72b1bf4c6f49
            // {
            //     "addMember": {
            //       "memberId": "67a33d47a02aabac387293c3"
            //     }
            // }
            const { memberId } = req.body.addMember;
            if (!mongoose.Types.ObjectId.isValid(memberId)) 
                return res.status(400).json({ error: 'Invalid user ID' });
            if (memberId.toString() === group.ownerId.toString()) 
                return res.status(400).json({ error: 'Owner cannot be a member' });
            if (group.members.some(m => m.memberId.toString() === memberId.toString())) 
                return res.status(400).json({ error: 'User already a member' });
            group.members.push({ memberId, status: 'pending' });
            await group.save();

            await User.updateOne(
                { _id: memberId },
                { $addToSet: { groups: { groupId: group._id, status: 'pending' } } }
            );
            // console.log(group._id);
            
            return res.json(group);
            
        } else if(req.body.removeMember){
            // PATCH http://localhost:3000/api/groups/67ab5377604d72b1bf4c6f49
            // {
            //     "removeMember": {
            //       "memberId": "67a33d47a02aabac387293c3"
            //     }
            // }
            const group = await Group.findById(req.params.id)
            const { memberId } = req.body.removeMember;
            if (!mongoose.Types.ObjectId.isValid(memberId)) 
                return res.status(400).json({ error: 'Invalid member ID' });
            if (!group.members.some(p => p.memberId.toString() === memberId.toString())) 
                return res.status(400).json({ error: 'User not a member' });
            group.members.splice({memberId: memberId}, 1);
            await group.save();
            await User.updateOne({_id: memberId}, {$pull: {groups: {groupId: group._id}}})
            return res.json(group);
        } else {
            const allowedUpdates = ['gameId', 'scheduledAt', 'description'];
            const updates = Object.keys(req.body).filter(update => allowedUpdates.includes(update));
            updates.forEach(update => session[update] = req.body[update]);
            await session.save();
            return res.json(session);
        }
    } catch (error) {
        console.error(error.message);
        if (error.name === 'CastError') 
            return res.status(400).json({ error: 'Invalid user ID format' });
        if (error.name === 'ValidationError') 
            return res.status(400).json({ error: error.message });
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ error: `${field} already exists` });
        }

        res.status(500).json({ error: 'Server error' });
    }
}


const deleteGroup = async (req, res) => {
    try {
        const group = await Group.findByIdAndDelete(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });
        const userIds = [
            group.ownerId,
            ...group.members.map(p => p.user)
        ].filter((value, index, self) =>
            self.findIndex(e => e.equals(value)) === index);
        await User.updateMany(
            { _id: { $in: userIds } },
            { $pull: { groups: { groupId: group._id } } }
        );
        res.status(200).json({ message: 'Group deleted successfully' });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting group',
            error: error.message
        });
    }
};



module.exports = {
    createGroup,
    getAllGroups,
    getGroupById,
    updateGroup,
    deleteGroup
}