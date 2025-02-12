const mongoose = require('mongoose');
const Session = require('../models/Session')
const User = require('../models/User');
const Group = require('../models/Group');


const createSession = async (req, res) => {
    try {
        const { hostId, gameId, scheduledAt, description, participants: reqParticipants, groups} = req.body;


        if (!mongoose.Types.ObjectId.isValid(hostId)) {
            return res.status(400).json({ error: "Invalid host ID" });
        }

        const host = await User.findById(hostId);
        if (!host) {
            return res.status(404).json({ error: "Host not found" });
        }

        // const invitedGroups = await Group.findOne({groupId})

        const existingSession = await Session.findOne({ hostId });
        if (existingSession) {
            return res.status(400).json({ error: "Host already has a session" });
        }

        const participants = reqParticipants.map(p => ({
            user: p.user,
            status: 'pending'
        }));

        for (const p of participants) {
            if (!mongoose.Types.ObjectId.isValid(p.user)) {
                return res.status(400).json({ error: `Invalid participant ID: ${p.user}` });
            }
            if (p.user.toString() === hostId.toString()) {
                return res.status(400).json({ error: "Host cannot be a participant" });
            }
            const userExists = await User.exists({ _id: p.user });
            if (!userExists) {
                return res.status(404).json({ error: `User not found: ${p.user}` });
            }
        }

        // console.log("fine");
        const newSession = await Session.create({
            hostId,
            gameId,
            scheduledAt,
            description,
            participants
        });

        const bulkOps = participants.map(p => ({
            updateOne: {
                filter: { _id: p.user },
                update: {
                    $addToSet: {
                        sessions: { sessionId: newSession._id, status: p.status }
                    }
                }
            }
        }));
        bulkOps.push({
            updateOne: {
                filter: { _id: hostId },
                update: {
                    $addToSet: {
                        sessions: { sessionId: newSession._id, status: 'host' }
                    }
                }
            }
        });
        await User.bulkWrite(bulkOps);

        res.status(201).json(newSession);

    } catch (error) {
        console.error('Error during session creation:', error.message);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ errors: messages });
        }

        res.status(500).json({ error: 'Server error' });
    }
};
// POST http://localhost:3000/api/sessions
// {
//     "hostId": "67a10f25d8074d134344b672",
//     "gameId": "67a9de322127c4b4fa1c9a7f",
//     "scheduledAt": "2025-02-04T12:44:13.298+00:00",
//     "participants": [
//     {
//       "user": "67a0bd1948ecd7e2acb87884",
//       "status": "pending"
//     }
//   ]
// }

const getAllSessions = async (req, res) => {
    try {
        const session = await Session.find();
        res.status(200).json(session);
    } catch (error) {
        console.error('Error during listing games:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
}
// GET http://localhost:3000/api/sessions

const getSessionById = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        // console.log(req.params.id);

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        res.status(200).json(session);
    } catch (error) {
        console.error(error.message);

        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid session ID format' });
        }

        res.status(500).json({ error: 'Server error' });
    }
}
// GET http://localhost:3000/api/sessions/67a9e1d3e6e31fe30522aa5a

const updateSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id)       
        if (!session) return res.status(404).json({ error: 'Session not found' });

        if (req.body.addParticipant) {
            // PATCH http://localhost:3000/api/sessions/67aa2037f277f77702c9e22b
            // {
            //     "addParticipant": {
            //       "user": "67a33d47a02aabac387293c3"
            //     }
            // }
            const { user } = req.body.addParticipant;
            if (!mongoose.Types.ObjectId.isValid(user)) 
                return res.status(400).json({ error: 'Invalid user ID' });
            if (user.toString() === session.hostId.toString()) 
                return res.status(400).json({ error: 'Host cannot be a participant' });
            if (session.participants.some(p => p.user.toString() === user.toString())) 
                return res.status(400).json({ error: 'User already a participant' });
            session.participants.push({ user, status: 'pending' });
            await session.save();

            await User.updateOne(
                { _id: user },
                { $addToSet: { sessions: { sessionId: session._id, status: 'pending' } } }
            );
            return res.json(session);
            
        } else if(req.body.removeParticipant){
            // PATCH http://localhost:3000/api/sessions/67aa2037f277f77702c9e22b
            // {
            //     "removeParticipant": {
            //       "user": "67a33d47a02aabac387293c3"
            //     }
            // }
            const session = await Session.findById(req.params.id)
            const { user } = req.body.removeParticipant;
            if (!mongoose.Types.ObjectId.isValid(user)) 
                return res.status(400).json({ error: 'Invalid user ID' });
            if (!session.participants.some(p => p.user.toString() === user.toString())) 
                return res.status(400).json({ error: 'User not a participant' });
            session.participants.splice({user: user}, 1);
            await session.save();
            await User.updateOne({_id: user}, {$pull: {sessions: {sessionId: session._id}}})
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
        const session = await Session.findByIdAndDelete(req.params.id);

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

        res.status(200).json({ message: 'Session deleted successfully' });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting session',
            error: error.message
        });
    }
};
// DELETE http://localhost:3000/api/sessions/67a9e0874d2e24d71f7ee48f

module.exports = {
    createSession,
    getAllSessions,
    getSessionById,
    updateSession,
    deleteSession
}