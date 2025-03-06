const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config({ path: '../../.env' });

const firebaseConfig = {
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  }),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
};

try {
  admin.initializeApp(firebaseConfig);
  console.log('\x1b[36mFirebase Admin initialized successfully\x1b[0m');
} catch (error) {
  console.error('\x1b[31mFirebase initialization error:', error);
  process.exit(1);
}

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

module.exports = { admin, db };