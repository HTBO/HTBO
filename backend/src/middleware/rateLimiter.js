const { MongoClient } = require('mongodb');

class RateLimiter {
  constructor() {
    this.collection = null;
    // Convert environment variables to numbers
    this.windowMs = parseInt(process.env.XRL_WINDOW_MS, 10) || 900000; // 15min default
    this.maxRequests = parseInt(process.env.XRL_MAX_REQUESTS, 10) || 100;
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

      const ip = req.clientIP || req.ip.replace('::ffff:', '');
      const now = Date.now();
      const windowStart = Math.floor(now / this.windowMs) * this.windowMs;
      const windowEnd = windowStart + this.windowMs;

      try {
        let retries = 0;
        const MAX_RETRIES = 3;

        while (retries < MAX_RETRIES) {
          try {
            const result = await this.collection.findOneAndUpdate(
              { _id: `${ip}_${windowStart}` },
              {
                $setOnInsert: {
                  ip,
                  windowStart,
                  windowEnd: Number(windowEnd) // Force numeric type
                },
                $inc: { count: 1 }
              },
              {
                upsert: true,
                returnDocument: 'after',
                projection: { _id: 0, count: 1 } // Optimize response
              }
            );

            const count = result.value ? result.value.count : 1;

            // Debug: Check MongoDB directly
            const dbDoc = await this.collection.findOne({ _id: `${ip}_${windowStart}` });
            console.log('Actual DB Count:', dbDoc?.count);

            res.set({
              'X-RateLimit-Limit': this.maxRequests,
              'X-RateLimit-Remaining': Math.max(this.maxRequests - dbDoc?.count, 0),
              'X-RateLimit-Reset': Math.floor(windowEnd / 1000)
            });

            if (count > this.maxRequests) {
              return res.status(429).json({
                message: `Retry in ${this.formatDuration(Math.ceil((windowEnd - now) / 1000))}`
              });
            }
            return next();
          }
          catch (err) {
            if (err.code === 11000 && retries < MAX_RETRIES) {
              retries++;
              await new Promise(resolve => setTimeout(resolve, 50 * retries));
              continue;
            }
            throw err;
          }
        }
          
      } catch (err) {
          console.error('Final rate limiter error:', err);
          next();
        }
      };
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