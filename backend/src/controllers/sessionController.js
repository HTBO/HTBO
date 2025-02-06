const mongoose = require('mongoose');
const Session = require('../models/Session')
const User = require('../models/User');


const createSession = async (req, res) => {
    try {
        const { hostId, gameId, scheduledAt, participants } = req.body;

        // const existingSession = await Session.findOne({ hostId });
        // if (existingSession) {
        //     return res.status(400).json({ error: "Host already has a session" });
        // }

        const newSession = await Session.create({
            hostId,
            gameId,
            scheduledAt,
            participants
        });

        const participantIds = participants.map(p => p.user);

        if (participantIds.length > 0) {
            await User.updateMany(
                { _id: { $in: participantIds } },
                {
                    $addToSet: {
                        sessions: {
                            sessionId: newSession._id,
                            status: "pending"
                        }
                    }
                }
            );
        }
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
//     "gameId": "67a20b9d334cbdd7c560a091",
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
        console.log(req.params.id);
        
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        
        res.status(200).json(session);
    } catch (error) {
        console.error(error.message);
        console.log('asdasd ');
        
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid session ID format' });
        }
        
        res.status(500).json({ error: 'Server error' });
    }
}

const updateSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id)
        if(!session)
            return res.status(404).json({error: 'Session not found'});
        if(req.body.addParticipant){
            const {user, status} = req.body.addParticipant;
            if(!mongoose.Types.ObjectId.isValid(user))
                return res.status(400).json({ error: 'Invalid game ID'});

            switch (status) {
                case "add":
                    session.addParticipant(user);
                    await User.updateMany(
                        { _id: user },
                        {
                            $addToSet: {
                                sessions: {
                                    sessionId: session._id,
                                    status: "pending"
                                }
                            }
                        }
                    );
                    
                    break;
                case "remove":

                    break;
                default:
                    break;
            }
        } else {
            const updates = Object.keys(req.body);
            const allowedUpdates = ['user', 'status'];
            const isValidOperation = updates.every(update => 
                allowedUpdates.includes(update)
            );

            if (!isValidOperation) {
                return res.status(400).json({ error: 'Invalid updates!' });
            }
            updates.forEach(update => session[update] = req.body[update]);
            await session.save();
        }
    } catch (error) {
        console.error(error.message);
        
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid user ID format' });
        }
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ error: `${field} already exists` });
        }

        res.status(500).json({ error: 'Server error' });
    }
}


module.exports = {
    createSession,
    getAllSessions,
    getSessionById,
    updateSession
}