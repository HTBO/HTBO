// const mongoose = require('mongoose');
const Store = require('../models/Store');

const createStore = async (req, res) => {
    try {
        const { name, address, website } = req.body;

        const existingStore = await Store.findOne({ name });
        if (existingStore) {
            return res.status(400).json({ error: "The store's name is already taken" });
        }

        const newStore = await Store.create({
            name,
            address,
            website
        });

        res.status(201).json(newStore);

    } catch (error) {
        console.error('Error during creation:', error.message);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ errors: messages });
        }
        
        res.status(500).json({ error: 'Server error' });
    }
}

module.exports = {
    createStore
}