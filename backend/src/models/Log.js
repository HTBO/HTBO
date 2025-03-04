const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: '../.env' });


const LOGS_URI = process.env.LOGS_MONGODB_URI;
if (!LOGS_URI) {
  console.error('No logs database URL defined. Please set the LOGS_MONGODB_URI environment variable');
}
const logDB = mongoose.createConnection(LOGS_URI);

const logSchema = new mongoose.Schema({
    ip: { type: String, required: true },
    endpoint: { type: String, required: true },
    method: { type: String, required: true },
    timestampString: { 
      type: String,
      default: () => {
        const now = new Date();
        const datePart = now.toLocaleDateString('en-CA', {
          timeZone: 'Europe/Budapest',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
  
        const timePart = now.toLocaleTimeString('en-GB', {
          timeZone: 'Europe/Budapest',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
  
        return `${datePart}|${timePart}`;
      }
    },
    timestamp: { type: Date, default: Date.now }
  }, { versionKey: false });

const Log = logDB.model('Log', logSchema);

module.exports = Log;