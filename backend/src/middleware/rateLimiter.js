const { MongoClient } = require('mongodb');

class RateLimiter {
  constructor() {
    this.collection = null;
    this.windowMs = parseInt(process.env.XRL_WINDOW_MS, 10);
    this.maxRequests = parseInt(process.env.XRL_MAX_REQUESTS, 10);
    this.initialize().catch(console.error);
  }

  async initialize() {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    this.collection = client.db().collection('rateLimits');
    try {
      await this.collection.createIndex(
        { windowEnd: 1 },
        { expireAfterSeconds: 0, name: 'rateLimitTTL' }
      );
    } catch (err) {
      if (err.code !== 85) console.error('Index error:', err);
    }
  }

  middleware() {
    return async (req, res, next) => {
      if (!this.collection) return next();
      if (req.clientIP == "127.0.0.1") return next();
      if (req.originalUrl.includes('favicon.ico')) return next();
      const ip = req.clientIP || this.normalizeIp(req.ip);
      const now = Date.now();
      const windowStart = Math.floor(now / this.windowMs) * this.windowMs;
      const windowEnd = windowStart + this.windowMs;
  
      try {
        await this.collection.updateOne(
          { _id: `${ip}_${windowStart}` },
          {
            $setOnInsert: {
              ip: ip,
              windowStart: windowStart,
              windowEnd: windowEnd
            },
            $inc: { count: 1 }
          },
          { upsert: true }
        );

        const entry = await this.collection.findOne({ 
          _id: `${ip}_${windowStart}` 
        });
        
        const count = entry?.count || 1;
  
        res.set({
          'X-RateLimit-Limit': this.maxRequests,
          'X-RateLimit-Remaining': Math.max(this.maxRequests - count, 0),
          'X-RateLimit-Reset': Math.floor(windowEnd / 1000)
        });
  
        if (count > this.maxRequests) {
          const remainingTime = Math.ceil((windowEnd - now) / 1000);
          return res.status(429).json({
            message: `Too many requests. Please try again in ${this.formatDuration(remainingTime)}`
          });
        }
        next();
      } catch (err) {
        console.error('Rate limiter error:', err);
        next();
      }
    };
  }
  normalizeIp(ip) {
    if (ip.startsWith('::ffff:')) {
      return ip.slice(7);
    }
    if (ip === '::1') {
      return '127.0.0.1';
    }
    return ip;
  }

  formatDuration(seconds) {
    if (seconds <= 0) return 'a short while';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return [
      hours > 0 && `${hours}h`,
      minutes > 0 && `${minutes}m`,
      remainingSeconds > 0 && `${remainingSeconds}s`
    ].filter(Boolean).join(' ') || 'a few seconds';
  }
}

module.exports = new RateLimiter().middleware();