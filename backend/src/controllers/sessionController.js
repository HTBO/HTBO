const mongoose = require('mongoose');
const Session = require('../models/Session')


const createSession = async (req, res) => {
    try {
        const { hostId, gameId, scheduledAt, participants} = req.body;
        const participantsArray = Array.isArray(participants) ? participants : [];

        if (!Array.isArray(participants)) {
            return res.status(400).json({ error: "Participants must be an array" });
        }
        const existingSession = await Session.findOne({ hostId });
        if (existingSession) {
            return res.status(400).json({ error: "Host already exists" });
        }

        console.log(participants);
        

        const newSession = await Session.create({
            hostId,
            gameId,
            scheduledAt,
            participants: participantsArray.map(participant => ({
                username: participant.username
            }))
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

// Hibás kérés
// {
//     "hostId": "67a0bd1948ecd7e2acb87884",
//     "gameId": "67a20b9d334cbdd7c560a091",
//     "scheduledAt": "2025-02-04T12:44:13.298+00:00",
//     "participants": {
//       "username": "67a10f25d8074d134344b672"
//     }
//   }

module.exports = {
    createSession
}