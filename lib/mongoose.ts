import mongoose from "mongoose";
import { configureMongoDns } from "@/lib/mongodb-dns";
import { getMongoUri } from "@/lib/mongodb-uri";

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
}

const cached = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cached;

export async function connectMongoose() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    configureMongoDns();
    cached.promise = mongoose.connect(getMongoUri()).catch((err) => {
      cached.promise = null;
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
