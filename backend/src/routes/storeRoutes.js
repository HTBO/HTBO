const express = require('express');
const router = express.Router();
const Store = require('../models/Store');
const { db } = require('../config/firebase');
const admin = require('firebase-admin');
const storeController = require('../controllers/storeController');

router.post('/sync-stores', async (req, res) => {
    try {
        const mongoStores = await Store.find();
        const batch = db.batch();
        
        mongoStores.forEach(store => {
            const storeRef = db.collection('stores').doc(store._id.toString());
            batch.set(storeRef, {
                name: store.name,
                location: store.location,
                mongoId: store._id.toString(),
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
        });

        await batch.commit();
        res.json({ synced: mongoStores.length });

    } catch (error) {
        console.error('Sync failed:', error);
        res.status(500).json({ error: 'Store synchronization failed' });
    }
});
router.post('/', storeController.createStore);
router.get('/', storeController.getAllStores);
// router.get('/:id', gameController.getGameById);
// router.patch('/:id', gameController.updateGame);
router.delete('/:id', storeController.deleteStore);

module.exports = router;