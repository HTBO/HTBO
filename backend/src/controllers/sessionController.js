const mongoose = require('mongoose');
const Session = require('../models/Session');
const User = require('../models/User');
const Group = require('../models/Group');

const createSession = async (req, res) => {
    let mongoSession = null;
    const sessionId = new mongoose.Types.ObjectId().toString();

    try {
        const { hostId, gameId, scheduledAt, description, participants: reqParticipants } = req.body;

        // 1. Validate host in MongoDB
        const mongoHost = await User.findById(hostId);
        if (!mongoHost) {
            return res.status(404).json({ error: "Host not found" });
        }

        // 2. Check existing sessions in MongoDB
        const existingMongoSession = await Session.findOne({ hostId });
        if (existingMongoSession) {
            return res.status(400).json({ error: "Host already has a session" });
        }

        // 3. Process participants with MongoDB validation
        const userIds = new Set();
        for (const p of reqParticipants) {
            if (p.user) {
                const mongoUser = await User.findById(p.user);
                if (!mongoUser) {
                    return res.status(404).json({ error: `User not found: ${p.user}` });
                }
                userIds.add(p.user);
            } else if (p.group) {
                const mongoGroup = await Group.findById(p.group);
                if (!mongoGroup) {
                    return res.status(404).json({ error: `Group not found: ${p.group}` });
                }
                mongoGroup.members.forEach(member => userIds.add(member.memberId.toString()));
                userIds.add(mongoGroup.ownerId.toString());
            } else {
                return res.status(400).json({ error: "Each participant must specify either a user or a group" });
            }
        }

        userIds.delete(hostId);

        // 4. Create MongoDB session document
        mongoSession = await Session.create({
            _id: sessionId,
            hostId,
            gameId,
            scheduledAt,
            description,
            participants: Array.from(userIds).map(userId => ({
                user: userId,
                status: 'pending'
            }))
        });

        // 5. Update users in MongoDB
        const bulkOps = Array.from(userIds).map(userId => ({
            updateOne: {
                filter: { _id: userId },
                update: {
                    $addToSet: {
                        sessions: {
                            sessionId: mongoSession._id,
                            status: 'pending'
                        }
                    }
                }
            }
        }));

        await User.bulkWrite(bulkOps);

        res.status(201).json({ mongoSession });

    } catch (error) {
        console.error('Error during session creation:', error);

        // Cleanup MongoDB if error occurs
        if (mongoSession) {
            await Session.deleteOne({ _id: mongoSession._id });
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ errors: messages });
        }

        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

const getAllSessions = async (req, res) => {
    try {
        const session = await Session.find();
        res.status(200).json(session);
    } catch (error) {
        console.error('Error during listing games:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
}

const getSessionById = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        if (!session) return res.status(404).json({ error: 'Session not found' });
        res.status(200).json(session);
    } catch (error) {
        console.error(error.message);
        if (error.name === 'CastError') return res.status(400).json({ error: 'Invalid session ID format' });
        res.status(500).json({ error: 'Server error' });
    }
}

const updateSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        if (!session) return res.status(404).json({ error: 'Session not found' });
        const userIds = new Set();
        const bulkOps = [];
        if (req.body.addParticipant) {
            const addParticipants = Array.isArray(req.body.addParticipant) ? req.body.addParticipant : [req.body.addParticipant];
            const newParticipants = [];
            for (const entry of addParticipants) {
                if (entry.user && entry.group) return res.status(400).json({ error: "Cannot specify both user and group in one entry" });
                if (entry.user) {
                    if (!mongoose.Types.ObjectId.isValid(entry.user)) 
                        return res.status(400).json({ error: `Invalid user ID: ${entry.user}` });
                    userIds.add(entry.user.toString());
                } else if (entry.group) {
                    if (!mongoose.Types.ObjectId.isValid(entry.group))
                        return res.status(400).json({ error: `Invalid group ID: ${entry.group}` });
                    const group = await Group.findById(entry.group);
                    if (!group)
                        return res.status(404).json({ error: `Group not found: ${entry.group}` });
                    group.members.forEach(member => {
                        userIds.add(member.memberId.toString());
                    });
                } else {
                    return res.status(400).json({ error: "Each entry must specify either user or group" });
                }
            }

            const existingParticipants = new Set(session.participants.map(p => p.user.toString()));
            const filteredUserIds = Array.from(userIds).filter(userId =>
                userId !== session.hostId.toString() &&
                !existingParticipants.has(userId)
            );

            for (const userId of filteredUserIds) {
                if (!mongoose.Types.ObjectId.isValid(userId))
                    return res.status(400).json({ error: `Invalid participant ID: ${userId}` });

                const userExists = await User.exists({ _id: userId });
                if (!userExists)
                    return res.status(404).json({ error: `User not found: ${userId}` });

                newParticipants.push({ user: userId, status: 'pending' });
                bulkOps.push({
                    updateOne: {
                        filter: { _id: userId },
                        update: {
                            $addToSet: {
                                sessions: { sessionId: session._id, status: 'pending' }
                            }
                        }
                    }
                });
            }

            if (newParticipants.length === 0)
                return res.status(400).json({ error: 'No valid users to add' });

            session.participants.push(...newParticipants);
            await session.save();

            if (bulkOps.length > 0) 
                await User.bulkWrite(bulkOps);

            return res.json(session);
        }
         else if (req.body.removeParticipant) {
        const removeParticipants = Array.isArray(req.body.removeParticipant) 
            ? req.body.removeParticipant 
            : [req.body.removeParticipant];

        for (const entry of removeParticipants) {
            if (entry.user && entry.group) 
                return res.status(400).json({ error: "Cannot specify both user and group in one entry" });

            if (entry.user) {
                if (!mongoose.Types.ObjectId.isValid(entry.user)) {
                    return res.status(400).json({ error: `Invalid user ID: ${entry.user}` });
                }
                userIds.add(entry.user.toString());
            } else if (entry.group) {
                if (!mongoose.Types.ObjectId.isValid(entry.group)) 
                    return res.status(400).json({ error: `Invalid group ID: ${entry.group}` });
                const group = await Group.findById(entry.group);
                if (!group) 
                    return res.status(404).json({ error: `Group not found: ${entry.group}` });
                group.members.forEach(member => {
                    userIds.add(member.memberId.toString());
                });
            } else {
                return res.status(400).json({ error: "Each entry must specify either user or group" });
            }
        }

        userIds.delete(session.hostId.toString());

        const participantsToRemove = Array.from(userIds).filter(userId => 
            session.participants.some(p => p.user.toString() === userId)
        );

        if (participantsToRemove.length === 0) 
            return res.status(400).json({ error: 'No valid participants to remove' });

        session.participants = session.participants.filter(p => 
            !participantsToRemove.includes(p.user.toString())
        );

        participantsToRemove.forEach(userId => {
            bulkOps.push({
                updateOne: {
                    filter: { _id: userId },
                    update: {
                        $pull: { sessions: { sessionId: session._id } }
                    }
                }
            });
        });

        await session.save();

        if (bulkOps.length > 0)
            await User.bulkWrite(bulkOps);

        return res.json(session);
        
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

const deleteSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);

        if (!session) return res.status(404).json({ message: 'Session not found' });

        const userIds = [
            session.hostId,
            ...session.participants.map(p => p.user)
        ].filter((value, index, self) =>
            self.findIndex(e => e.equals(value)) === index);

        await User.updateMany(
            { _id: { $in: userIds } },
            { $pull: { sessions: { sessionId: session._id } } }
        );

        await Session.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Session deleted successfully' });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting session',
            error: error.message
        });
    }
};

module.exports = {
    createSession,
    getAllSessions,
    getSessionById,
    updateSession,
    deleteSession
}