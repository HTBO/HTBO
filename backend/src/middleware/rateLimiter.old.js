const { MongoClient } = require('mongodb');

class RateLimiter {
  constructor() {
    this.collection = null;
    this.windowMs = 15 * 60 * 1000; // 15 minutes
    this.maxRequests = 10;
    this.initialize();
  }

  async initialize() {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    this.collection = client.db().collection('rateLimits');
    
    // Create TTL index if not exists
    try {
      await this.collection.createIndex(
        { createdAt: 1 },
        { expireAfterSeconds: 900 } // 15 minutes
      );
    } catch (err) {
      console.log('TTL index already exists');
    }
  }

  middleware() {
    return async (req, res, next) => {
      if (!this.collection) return next();
  
      const ip = req.clientIP;
      const now = Date.now();
      
      try {
        const entry = await this.collection.findOneAndUpdate(
          { _id: ip },
          {
            $setOnInsert: { 
              _id: ip, 
              createdAt: now,
              count: 0 // Initialize count
            },
            $inc: { count: 1 },
            $set: { updatedAt: now }
          },
          { 
            upsert: true,
            returnDocument: 'after' // Correct option for modern drivers
          }
        );
        
        // Directly access the document properties
        const count = entry.count;
        const createdAt = entry.createdAt || now; // Fallback to current time
        
        res.set({
          'X-RateLimit-Limit': this.maxRequests,
          'X-RateLimit-Remaining': Math.max(this.maxRequests - count, 0),
          'X-RateLimit-Reset': Math.floor((now + this.windowMs) / 1000)
        });
  
        if (count > this.maxRequests) {
          const createdAt = entry.createdAt || now;
          const remainingTime = Math.ceil(
            (this.windowMs - (now - createdAt)) / 1000
          );
          
          return res.status(429).json({
            message: `Too many requests, try again in ${remainingTime} seconds`
          });
        }
        
        next();
      } catch (err) {
        console.error('Rate limiter error:', err);
        next();
      }
    };
  }}

module.exports = new RateLimiter().middleware();