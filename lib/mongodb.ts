import mongoose from 'mongoose';
import dns from 'dns';

// Ensure DNS uses reliable public DNS resolvers (Google / Cloudflare) to resolve Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Ignore in restricted environments
}

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
  lastError: string | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = {
    conn: null,
    promise: null,
    lastError: null,
  };
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  if (!MONGODB_URI) {
    console.warn('⚠️ MONGODB_URI environment variable is missing.');
    return null;
  }

  // If already connected and ready, return existing connection
  if (cached!.conn && mongoose.connection.readyState === 1) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 12000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    };

    cached!.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((m) => {
        console.log('✅ Successfully connected to MongoDB Atlas (HavItAll)');
        cached!.conn = m;
        cached!.lastError = null;
        return m;
      })
      .catch((err) => {
        console.error('❌ MongoDB Connection Error:', err.message);
        cached!.conn = null;
        cached!.promise = null;
        cached!.lastError = err.message;
        return null;
      });
  }

  try {
    const result = await cached!.promise;
    return result;
  } catch (e: unknown) {
    const err = e as Error;
    cached!.promise = null;
    cached!.lastError = err.message;
    return null;
  }
}

export default connectToDatabase;
