import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI || "";
const DB_NAME = "kryso_db";

interface GlobalWithMongo {
  _mongoClientPromise?: Promise<MongoClient>;
}

const globalWithMongo = globalThis as unknown as GlobalWithMongo;

let clientPromise: Promise<MongoClient> | null = null;

export function getMongoClientPromise(): Promise<MongoClient> | null {
  if (!uri) {
    return null;
  }

  if (process.env.NODE_ENV === "development") {
    if (!globalWithMongo._mongoClientPromise) {
      const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 7000,
      });
      globalWithMongo._mongoClientPromise = client.connect().catch((err) => {
        globalWithMongo._mongoClientPromise = undefined;
        throw err;
      });
    }
    return globalWithMongo._mongoClientPromise;
  } else {
    if (!clientPromise) {
      const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 7000,
      });
      clientPromise = client.connect().catch((err) => {
        clientPromise = null;
        throw err;
      });
    }
    return clientPromise;
  }
}

export async function getDb(databaseName = DB_NAME): Promise<Db | null> {
  const promise = getMongoClientPromise();
  if (!promise) return null;
  try {
    const client = await promise;
    return client.db(databaseName);
  } catch (err) {
    const message = (err as Error).message;
    if (message.includes("SSL alert number 80") || message.includes("tlsv1 alert internal error")) {
      console.warn("MongoDB connection warning: Atlas TLS handshake failed (SSL alert 80). Your current IP is likely not whitelisted in MongoDB Atlas Network Access, or the cluster is paused.");
    } else {
      console.warn("MongoDB connection warning:", message);
    }
    return null;
  }
}

export async function checkMongoConnection(): Promise<{
  connected: boolean;
  database: string;
  error?: string;
  collections?: string[];
}> {
  if (!uri) {
    return {
      connected: false,
      database: DB_NAME,
      error: "MONGODB_URI is not set in environment variables.",
    };
  }

  try {
    const promise = getMongoClientPromise();
    if (!promise) {
      return {
        connected: false,
        database: DB_NAME,
        error: "Unable to create MongoDB client.",
      };
    }
    const client = await promise;
    const db = client.db(DB_NAME);
    const collections = await db.listCollections().toArray();
    return {
      connected: true,
      database: DB_NAME,
      collections: collections.map((c) => c.name),
    };
  } catch (err) {
    const errorMsg = (err as Error).message;
    return {
      connected: false,
      database: DB_NAME,
      error: errorMsg.includes("SSL alert number 80")
        ? "MongoDB Atlas IP access restricted: Whitelist 0.0.0.0/0 or your current IP in Atlas > Network Access."
        : errorMsg,
    };
  }
}
