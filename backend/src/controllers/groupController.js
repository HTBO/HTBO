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
            if (!mongoose.Types.ObjectId.isValid(m.memberId))
                return res.status(400).json({ error: `Invalid member ID: ${m.memberId}` });
            if (m.memberId.toString() === ownerId.toString()) 
                return res.status(400).json({ error: "Owner cannot be a member" });
            const userExists = await User.exists({ _id: m.memberId });
            if (!userExists)
                return res.status(404).json({ error: `User not found: ${m.user}` });
        }
        
        const newGroup = await Group.create({
            ownerId,
            name,
            description,
            members: members.map(member => ({
                memberId: new mongoose.Types.ObjectId(member.memberId),
                groupStatus: "pending"
            }))
        });
        const bulkOps = members.map(m => ({
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(m.memberId) },
                update: {
                    $addToSet: {
                        groups: { groupId: newGroup._id, groupStatus: "pending" }
                    }
                }
            }
        }));
        bulkOps.push({
            updateOne: {
                filter: { _id: ownerId },
                update: {
                    $addToSet: {
                        groups: { groupId: newGroup._id, groupStatus: 'owner' }
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
        console.error('Error during listing groups:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
};

const getGroupById = async(req, res)=> {
    try {
        const group = await Group.findById(req.params.id);
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
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ error: 'Group not found' });

        if (req.body.addMember) {
            const addRequests = Array.isArray(req.body.addMember) ? req.body.addMember : [req.body.addMember];

            const membersToAdd = [];
            const bulkOps = [];
            const seenIds = new Set();

            for (const { memberId } of addRequests) {
                if (!mongoose.Types.ObjectId.isValid(memberId)) 
                    return res.status(400).json({ error: `Invalid member ID: ${memberId}` });

                const memberStr = memberId.toString();
                if (seenIds.has(memberStr)) 
                    continue;
                seenIds.add(memberStr);
                if (memberStr === group.ownerId.toString())
                    return res.status(400).json({ error: 'Owner cannot be a member' });

                // Check existing members
                if (group.members.some(m => m.memberId.toString() === memberStr)) 
                    continue;

                // Verify user exists
                const userExists = await User.exists({ _id: memberId });
                if (!userExists) 
                    return res.status(404).json({ error: `User not found: ${memberId}` });

                membersToAdd.push({ memberId, status: 'pending' });
                bulkOps.push({
                    updateOne: {
                        filter: { _id: memberId },
                        update: {
                            $addToSet: {
                                groups: { groupId: group._id, status: 'pending' }
                            }
                        }
                    }
                });
            }

            if (membersToAdd.length === 0) 
                return res.status(400).json({ error: 'No valid members to add' });

            group.members.push(...membersToAdd);
            await group.save();

            if (bulkOps.length > 0)
                await User.bulkWrite(bulkOps);

            return res.json(group);

        } else if (req.body.removeMember) {
            const removeRequests = Array.isArray(req.body.removeMember) ? req.body.removeMember : [req.body.removeMember];

            const membersToRemove = [];
            const bulkOps = [];
            const seenIds = new Set();

            for (const { memberId } of removeRequests) {
                if (!mongoose.Types.ObjectId.isValid(memberId)) 
                    return res.status(400).json({ error: `Invalid member ID: ${memberId}` });

                const memberStr = memberId.toString();

                if (seenIds.has(memberStr)) 
                    continue;
                seenIds.add(memberStr);

                if (!group.members.some(m => m.memberId.toString() === memberStr))
                    continue;

                membersToRemove.push(memberStr);
                bulkOps.push({
                    updateOne: {
                        filter: { _id: memberId },
                        update: {
                            $pull: { groups: { groupId: group._id } }
                        }
                    }
                });
            }

            if (membersToRemove.length === 0) 
                return res.status(400).json({ error: 'No valid members to remove' });

            group.members = group.members.filter(m => 
                !membersToRemove.includes(m.memberId.toString())
            );
            await group.save();

            if (bulkOps.length > 0) 
                await User.bulkWrite(bulkOps);

            return res.json(group);


        } else {
            const allowedUpdates = ['name', 'description'];
            const updates = Object.keys(req.body).filter(update => 
                allowedUpdates.includes(update)
            );
            
            updates.forEach(update => group[update] = req.body[update]);
            await group.save();
            return res.json(group);
        }

    } catch (error) {
        console.error(error.message);
        if (error.name === 'CastError') 
            return res.status(400).json({ error: 'Invalid ID format' });
        if (error.name === 'ValidationError') 
            return res.status(400).json({ error: error.message });
        res.status(500).json({ error: 'Server error' });
    }
};


const deleteGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);

        if (!group) return res.status(404).json({ message: 'Group not found' });

        const userIds = [
            group.ownerId,
            ...group.members.map(p => p.memberId)
        ].filter((value, index, self) =>
            self.findIndex(e => e.equals(value)) === index);

        await User.updateMany(
            { _id: { $in: userIds } },
            { $pull: { groups: { groupId: group._id } } }
        );
        await Group.findByIdAndDelete(req.params.id);
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