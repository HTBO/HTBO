const redis = require('redis');
const client = redis.createClient({
  url: process.env.REDIS_URI || 'redis://localhost:6379'
});

client.connect().catch(console.error);
client.on('error', (err) => console.error('Redis Client Error:', err));

module.exports = client;