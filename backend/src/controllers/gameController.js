const mongoose = require('mongoose');
const Game = require('../models/Game');
const { db } = require('../config/firebase');
const admin = require('firebase-admin');


const createGame = async (req, res) => {
    try {
        const { name, description, publisher, releaseYear, stores } = req.body;

        // Generate MongoDB ID upfront as string
        const mongoIdString = new mongoose.Types.ObjectId().toString();

        // Check for duplicates in both databases
        const [existingMongoGame, firestoreQuery] = await Promise.all([
            Game.findOne({ name }),
            db.collection('games').where('name', '==', name).limit(1).get()
        ]);

        if (existingMongoGame || !firestoreQuery.empty) {
            return res.status(400).json({ 
                error: "The game's name is already taken",
                existsIn: {
                    mongoDB: !!existingMongoGame,
                    firestore: !firestoreQuery.empty
                }
            });
        }

        // Convert store IDs and validate
        const firestoreStoreIds = await Promise.all(
            stores.map(async (store) => {
                const snapshot = await db.collection('stores')
                    .where('mongoId', '==', store.storeId.toString()) // Ensure string comparison
                    .limit(1)
                    .get();

                if (snapshot.empty) {
                    throw new Error(`Store ${store.storeId} not found in Firestore`);
                }
                return snapshot.docs[0].id;
            })
        );

        // Create Firestore document with string IDs
        gameRef = db.collection('games').doc();
        await gameRef.set({
            name,
            description,
            publisher,
            releaseYear: admin.firestore.Timestamp.fromDate(new Date(releaseYear, 0)),
            stores: firestoreStoreIds.map((firestoreId, index) => ({
                storeId: firestoreId,
                link: stores[index].link
            })),
            mongoId: mongoIdString, // Store as string
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Create MongoDB document using the same ID
        const newGame = await Game.create({
            _id: mongoIdString, // Use the pre-generated string ID
            name,
            description,
            publisher,
            releaseYear,
            firebaseId: gameRef.id,
            stores: stores.map(store => ({
                storeId: new mongoose.Types.ObjectId(store.storeId),
                link: store.link
            }))
        });

        res.status(201).json({
            mongoId: newGame._id,
            firebaseId: gameRef.id,
            document: newGame
        });

    } catch (error) {
        console.error('Error:', error.message);

        // Cleanup Firestore document if MongoDB creation failed
        if (error.name === 'ValidationError' || error.message.includes('not found in Firestore')) {
            await gameRef?.delete().catch(console.error);
        }

        // Error responses
        if (error.message.includes('not found in Firestore')) {
            return res.status(404).json({
                error: 'Linked store missing in Firestore',
                solution: 'POST /api/stores/sync-stores to synchronize databases'
            });
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ errors: messages });
        }

        res.status(500).json({ error: 'Server error' });
    }
};

// POST http://localhost:5000/api/games
// {
//     "name": "CS2",
//     "description": "Klasszikus lövöldözős játék",
//     "publisher": "Valve",
//     "releaseYear": 2022,
//     "stores": [{
//       "storeId": "67a0e6f79df8e495ea176e47",
//       "link": "https://store.steampowered.com/app/730/CounterStrike_2/"
//         }]
//     }

const getGameById = async (req, res) => {
    try {
        const game = await Game.findById(req.params.id)
            .populate('stores.storeId', 'name address');

        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }

        res.status(200).json(game);

    } catch (error) {
        console.error('Error:', error.message);

        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid game ID' });
        }

        res.status(500).json({ error: 'Server error' });
    }
};

const getAllGames = async (req, res) => {
    try {

        const { name, sortBy } = req.query;
        // console.log(name);
        const filter = {};
        const sortOptions = {};

        if (name) {
            filter.name = { $regex: name, $options: 'i' };
        }

        if (sortBy) {
            const sortFields = sortBy.split(',').join(' ');
            sortOptions = sortFields;
        }

        const games = await Game.find(filter)
            .sort(sortOptions)
            .populate(['stores.storeId', 'name']);

        res.status(200).json(games);

    } catch (error) {
        console.error('Error during listing games:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
};

const updateGame = async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['name', 'description', "publisher", "releaseYear", 'stores'];
        const isValidOperation = updates.every(update =>
            allowedUpdates.includes(update)
        );

        if (!isValidOperation) {
            return res.status(400).json({ error: 'Invalid modification parameters' });
        }

        const game = await Game.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('stores.storeId');

        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }

        res.status(200).json(game);

    } catch (error) {
        console.error('Error during update:', error.message);

        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid game ID' });
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ errors: messages });
        }

        if (error.code === 11000) {
            return res.status(400).json({ error: "The game's name is already taken" });
        }

        res.status(500).json({ error: 'Server error' });
    }
};

const deleteGame = async (req, res) => {
    try {
        const game = await Game.findByIdAndDelete(req.params.id);

        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }

        res.status(200).json({ message: 'Game has been deleted' });

    } catch (error) {
        console.error('Error during deletion:', error.message);

        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid game ID' });
        }

        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    createGame,
    getGameById,
    getAllGames,
    updateGame,
    deleteGame
};