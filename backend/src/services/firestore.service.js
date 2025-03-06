const { db, admin } = require('../config/firebase');

class FirestoreService {
    constructor(collectionName) {
        this.collection = db.collection(collectionName);
    }

    async documentExists(id) {
        const doc = await this.collection.doc(id).get();
        return doc.exists;
    }

    async createDocument(data) {
        const docRef = this.collection.doc();
        await docRef.set({
            ...data,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return docRef;
    }
}

module.exports = FirestoreService;