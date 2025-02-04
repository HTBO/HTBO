const mongoose = require('mongoose');
const Game = require('../models/Game');

const createGame = async (req, res) => {
    try {
        const { name, description, publisher, releaseYear, stores } = req.body;

        const existingGame = await Game.findOne({ name });
        if (existingGame) {
            return res.status(400).json({ error: "The game's name is already taken" });
        }

        const newGame = await Game.create({
            name,
            description,
            publisher,
            releaseYear,
            stores: stores.map(store => ({
                storeId: new mongoose.Types.ObjectId(store.storeId),
                link: store.link
            }))
        });

        res.status(201).json(newGame);

    } catch (error) {
        console.error('Error during creation:', error.message);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ errors: messages });
        }
        
        res.status(500).json({ error: 'Server error' });
    }
};

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
            .populate('stores.storeId', 'name');

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