import { MongoClient, type MongoClientOptions } from "mongodb";
import { configureMongoDns } from "@/lib/mongodb-dns";
import { getMongoUri } from "@/lib/mongodb-uri";

const options: MongoClientOptions = {
  serverSelectionTimeoutMS: 15_000,
};

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function createClientPromise(): Promise<MongoClient> {
  configureMongoDns();
  const uri = getMongoUri();
  const client = new MongoClient(uri, options);
  return client.connect();
}

export function getMongoClient(): Promise<MongoClient> {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClientPromise().catch((err) => {
      global._mongoClientPromise = undefined;
      throw err;
    });
  }
  return global._mongoClientPromise;
}

/** Lazy promise for @auth/mongodb-adapter (defers connect until first use). */
const clientPromise: Promise<MongoClient> = {
  then(onFulfilled, onRejected) {
    return getMongoClient().then(onFulfilled, onRejected);
  },
  catch(onRejected) {
    return getMongoClient().catch(onRejected);
  },
  finally(onFinally) {
    return getMongoClient().finally(onFinally);
  },
} as Promise<MongoClient>;

export default clientPromise;

export async function getDb() {
  const connected = await getMongoClient();
  return connected.db();
}
