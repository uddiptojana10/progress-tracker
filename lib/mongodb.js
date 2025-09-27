
import { MongoClient } from "mongodb";
let cached = global._mongo;
if (!cached) cached = global._mongo = { conn: null, promise: null };
export async function connectToDatabase() {
  if (cached.conn) return cached.conn;
  const uri = process.env.MONGODB_URI;
  if (!uri) return { fallback: true };
  if (!cached.promise) {
    const client = new MongoClient(uri);
    cached.promise = client.connect().then(client => ({ client, db: client.db() }));
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
