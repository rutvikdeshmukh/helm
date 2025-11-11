import express from 'express';
import 'dotenv/config';
import { createClient } from 'redis';

const app = express();

// ✅ Create Redis client using environment variable
const redisClient = createClient({
  url: process.env.REDIS_URL, // e.g. redis://:password@host:6379/0
});

// ✅ Handle Redis connection
redisClient.on('connect', () => {
  console.log('✅ Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

// ✅ Connect Redis before starting server
await redisClient.connect();

// ✅ Root route to check envs
app.get('/', (req, res) => {
  res.json({
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USER: process.env.DB_USER,
    DB_PASS: process.env.DB_PASS,
    DB_NAME: process.env.DB_NAME,
    DB_DIALECT: process.env.DB_DIALECT,
    OIDC_ISSUER_URL: process.env.OIDC_ISSUER_URL,
    WORKSPACE_URL: process.env.WORKSPACE_URL,
    REDIS_URL: process.env.REDIS_URL,
    REDIS_TTL_SECONDS: process.env.REDIS_TTL_SECONDS,
    SERVER_PORT: process.env.SERVER_PORT,
  });
});

// ✅ API: Set timestamp in Redis
app.get('/set-timestamp', async (req, res) => {
  try {
    const currentTimestamp = new Date().toISOString();
    await redisClient.set('timestamp', currentTimestamp, {
      EX: parseInt(process.env.REDIS_TTL_SECONDS) || 3600, // expire in seconds
    });
    res.json({
      message: '✅ Timestamp saved in Redis',
      value: currentTimestamp,
    });
  } catch (error) {
    console.error('Error saving timestamp:', error);
    res.status(500).json({ error: 'Failed to save timestamp' });
  }
});

// ✅ API: Get timestamp from Redis
app.get('/get-timestamp', async (req, res) => {
  try {
    const timestamp = await redisClient.get('timestamp');
    if (!timestamp) {
      return res.status(404).json({ message: '⛔ No timestamp found' });
    }
    res.json({ message: '✅ Timestamp retrieved', value: timestamp });
  } catch (error) {
    console.error('Error retrieving timestamp:', error);
    res.status(500).json({ error: 'Failed to retrieve timestamp' });
  }
});

app.listen(process.env.SERVER_PORT, () => {
  console.log(`🚀 Server running on port ${process.env.SERVER_PORT}`);
});