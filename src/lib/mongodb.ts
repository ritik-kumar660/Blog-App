import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: { conn: mongoose.Mongoose | null; promise: Promise<mongoose.Mongoose> | null } | undefined;
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Re-assign for better TS inference in async context
const mongoCached = cached;

async function connectToDatabase() {
  if (mongoCached.conn) {
    return mongoCached.conn;
  }

  if (!mongoCached.promise) {
    const opts = {
      bufferCommands: false,
    };

    mongoCached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongoose) => {
      return mongoose;
    });
  }
  
  try {
    mongoCached.conn = await mongoCached.promise;
  } catch (e) {
    mongoCached.promise = null;
    throw e;
  }

  return mongoCached.conn;
}

export default connectToDatabase;
