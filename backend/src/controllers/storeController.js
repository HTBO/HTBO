// const mongoose = require('mongoose');
const Store = require('../models/Store');

const createStore = async (req, res) => {
    try {
        const { name, logoUrl, website } = req.body;

        const existingStore = await Store.findOne({ name });
        if (existingStore) {
            return res.status(400).json({ error: "The store's name is already taken" });
        }

        const newStore = await Store.create({
            name,
            logoUrl,
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

const getAllStores = async(req, res) => {
    try {
        const stores = await Store.find();
        res.status(200).json(stores);
    } catch (error) {
        console.error('Error during listing games:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
}

const deleteStore = async (req, res) => {
    try {
        const store = await Store.findByIdAndDelete(req.params.id);
        console.log(req.params.id);
        
        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }
        
        res.status(200).json({ message: 'Store deleted successfully' });
    } catch (error) {
        console.error(error.message);
        
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid store ID format' });
        }
        
        res.status(500).json({ error: 'Server error' });
    }
};


module.exports = {
    createStore,
    getAllStores,
    deleteStore
}