// commands/analyzeDB.js
import { MongoClient } from "mongodb";
import commandConfig from "../config/command.js";
import formatText from "./helpers/formatText.js";

/** Logger with color */
function log(msg, color = "white") {
    console.log(formatText(msg, { color }));
}

/** Connect to MongoDB */
async function connectToMongo(dbURI, dbName) {
    try {
        const client = new MongoClient(dbURI);
        await client.connect();
        const db = client.db(dbName);
        log(`✅ Connected to MongoDB database: ${dbName}`, "green");
        return { client, db };
    } catch (err) {
        log(`❌ MongoDB connection failed: ${err.message}`, "red");
        process.exit(1);
    }
}

/** Analyze the database */
async function analyzeDatabase({ dbURI, dbName }) {
    const { client, db } = await connectToMongo(dbURI, dbName);

    try {
        log("🔍 Analyzing database...", "cyan");

        const collections = await db.listCollections().toArray();
        if (collections.length === 0) {
            log("⚠️ No collections found in this database.", "yellow");
            return;
        }

        let totalDocs = 0;
        const results = [];

        for (const c of collections) {
            const collection = db.collection(c.name);
            const count = await collection.estimatedDocumentCount();
            results.push({ name: c.name, count });
            totalDocs += count;
        }

        // Fetch database stats
        const stats = await db.command({ dbStats: 1 });

        log(`\n📊 Database Summary for: ${db.databaseName}`, "cyan");
        log("────────────────────────────────────────────", "dim");
        log(`🗂️  Total Collections : ${collections.length}`, "green");
        log(`📄 Total Documents    : ${totalDocs}`, "green");
        log(`💾 Data Size          : ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`, "green");
        log(`📁 Storage Size       : ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`, "green");
        log(`🔢 Indexes Total Size : ${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`, "green");

        log("\n📦 Collection Details:", "cyan");
        for (const { name, count } of results) {
            log(`  • ${name.padEnd(25)} → ${count} documents`, "dim");
        }

        log("\n✅ Database analysis completed successfully!", "green");
    } catch (err) {
        log(`❌ Failed to analyze database: ${err.message}`, "red");
    } finally {
        await client.close();
        log("🔒 MongoDB connection closed\n", "dim");
    }
}

/**
 * Entry point for analyzeDB command
 * Usage example:
 *   node command analyzeDB
 *   node command analyzeDB --dbURI="mongodb://127.0.0.1:27017" --db=test
 */
export default async function analyzeDB({ command, sub = [], flags = {} }) {
    const config = commandConfig?.[command] || {};

    // Flags take priority
    const dbName = flags.db || config.dbName;
    const dbURI = flags.dbURI || config.dbURI || process.env.MONGO_URI;

    // Validation
    if (!dbName) {
        log("❌ Missing required option: --db or dbName in config", "red");
        process.exit(1);
    }
    if (!dbURI) {
        log("❌ Missing required option: --dbURI, config.dbURI, or MONGO_URI in env", "red");
        process.exit(1);
    }

    await analyzeDatabase({ dbURI, dbName });
}
