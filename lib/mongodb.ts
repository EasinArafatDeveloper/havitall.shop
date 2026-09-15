import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
  lastAttempt: number;
  failedCooldown: boolean;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { 
    conn: null, 
    promise: null, 
    lastAttempt: 0, 
    failedCooldown: false 
  };
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  if (!MONGODB_URI) {
    return null;
  }

  // If already successfully connected, return active connection
  if (cached!.conn && mongoose.connection.readyState === 1) {
    return cached!.conn;
  }

  // If a connection attempt failed recently (within 45 seconds), avoid freezing server with repeated DNS timeouts
  const now = Date.now();
  if (cached!.failedCooldown && now - cached!.lastAttempt < 45000) {
    return null;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500,
    };

    cached!.lastAttempt = now;
    cached!.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((m) => {
        console.log('✅ Successfully connected to MongoDB Atlas (HavItAll)');
        cached!.failedCooldown = false;
        cached!.conn = m;
        return m;
      })
      .catch((err) => {
        console.warn('⚠️ MongoDB Atlas unavailable (Fast fallback to Memory Store active):', err.message);
        cached!.failedCooldown = true;
        cached!.conn = null;
        cached!.promise = null;
        return null;
      });
  }

  try {
    const result = await cached!.promise;
    return result;
  } catch (e) {
    cached!.failedCooldown = true;
    cached!.promise = null;
    return null;
  }
}

export default connectToDatabase;
