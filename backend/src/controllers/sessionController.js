const mongoose = require('mongoose');
const Session = require('../models/Session')


const createSession = async (req, res) => {
    try {
        const { hostId, gameId, scheduledAt, participants} = req.body;
        const existingSession = await Session.findOne({ hostId });
        if (existingSession) {
            return res.status(400).json({ error: "Host already exists" });
        }

        console.log(participants);
        

        const newSession = await Session.create({
            hostId,
            gameId,
            scheduledAt,
            participants
        });

        res.status(201).json(newSession);

    } catch (error) {
        console.error('Error during creation:', error.message);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ errors: messages });
        }
        
        res.status(500).json({ error: 'Server error' });
    }
};

// {
//     "hostId": "67a0bd1948ecd7e2acb87884",
//     "gameId": "67a20b9d334cbdd7c560a091",
//     "scheduledAt": "2025-02-04T12:44:13.298+00:00",
//     "participants": {
//       "userId": "67a10f25d8074d134344b672",
//       "status": "pending"
//     }
//   }

const getAllSessions = async(req, res) => {
    try {
        const session = await Session.find();
        res.status(200).json(session);
    } catch (error) {
        console.error('Error during listing games:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
}


module.exports = {
    createSession,
    getAllSessions
}