const { MongoClient } = require('mongodb');

class RateLimiter {
  constructor() {
    this.collection = null;
    this.windowMs = 15 * 60 * 1000; // 15 minutes
    this.maxRequests = 100;
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
      if (!this.collection) return next(); // Fail open if DB not ready
      
      const ip = req.clientIP;
      const now = Date.now();
      
      try {
        const entry = await this.collection.findOneAndUpdate(
          { _id: ip },
          {
            $setOnInsert: { _id: ip, createdAt: now },
            $inc: { count: 1 },
            $set: { updatedAt: now }
          },
          { upsert: true, returnDocument: 'after' }
        );
        
        const count = entry.count;
        
        res.set({
          'X-RateLimit-Limit': this.maxRequests,
          'X-RateLimit-Remaining': Math.max(this.maxRequests - count, 0),
          'X-RateLimit-Reset': Math.floor((now + this.windowMs) / 1000)
        });

        if (count > this.maxRequests) {
          return res.status(429).json({
            message: `Too many requests, please try again after ${Math.ceil(
              (this.windowMs - (now - entry.value.createdAt)) / 1000
            )} seconds`
          });
        }
        
        next();
      } catch (err) {
        console.error('Rate limiter error:', err);
        next(); // Fail open on error
      }
    };
  }
}

module.exports = new RateLimiter().middleware();