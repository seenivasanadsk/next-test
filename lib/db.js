// lib\db.js
import { MongoClient } from "mongodb";

let client;
let clientPromise;

export const getDb = async (dbNameOverride) => {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB;

    if (!uri) throw new Error("Please define the MONGODB_URI environment variable");
    if (!dbName) throw new Error("Please define the MONGODB_DB environment variable");

    if (!client) {
        client = new MongoClient(uri);
        clientPromise = client.connect();
    }

    const clientInstance = await clientPromise;
    return clientInstance.db(dbNameOverride || dbName);
};
