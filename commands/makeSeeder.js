// commands/makeSeeding.js
import fs from "fs";
import path from "path";
import { MongoClient } from "mongodb";
import { pathToFileURL } from "url";
import commandConfig from "../config/command.js";
import formatText from "./helpers/formatText.js";

function log(msg, color = "white") {
    console.log(formatText(msg, { color }));
}

// ✅ MongoDB connect (no deprecated options)
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

/**
 * ✅ Ensure critical indexes
 * In `fresh` mode, drop old indexes first to avoid TTL conflicts.
 */
async function ensureIndexes(db, otpExpiryMinutes = 5, mode = "seed") {
    log("Ensuring required indexes...", "cyan");

    try {
        if (mode === "fresh") {
            const collections = await db.collections();
            for (const c of collections) {
                const idx = await c.indexes();
                for (const i of idx) {
                    if (i.name !== "_id_") {
                        await c.dropIndex(i.name).catch(() => { });
                    }
                }
            }
            log("🧹 Dropped all custom indexes before recreating", "dim");
        }

        // Sessions TTL index
        await db.collection("sessions").createIndex(
            { expiresAt: 1 },
            { expireAfterSeconds: 0 }
        );

        // passwordResets TTL index
        const expireAfterSeconds = parseInt(otpExpiryMinutes, 10) * 60;
        await db.collection("passwordResets").createIndex(
            { expiresAt: 1 },
            { expireAfterSeconds }
        );

        log("✅ Indexes ensured successfully", "green");
    } catch (err) {
        log(`⚠️ Failed to ensure indexes: ${err.message}`, "yellow");
    }
}

/**
 * ✅ List seed files (no DB connection)
 */
async function listSeedFiles(seedDir) {
    if (!fs.existsSync(seedDir)) {
        log(`❌ Seed folder not found: ${seedDir}`, "red");
        return;
    }

    const files = fs.readdirSync(seedDir).filter((f) => f.endsWith(".js"));
    if (files.length === 0) {
        log("⚠️ No seed files found.", "yellow");
        return;
    }

    log(`📦 Found ${files.length} seed file(s) in ${seedDir}:`, "cyan");
    for (const file of files) {
        try {
            const fileUrl = pathToFileURL(path.join(seedDir, file)).href;
            const { default: data } = await import(fileUrl);
            const count = Array.isArray(data) ? data.length : 0;
            log(`  • ${file.replace(".js", "")} → ${count} record(s)`, "dim");
        } catch (err) {
            log(`  • ${file.replace(".js", "")} → failed (${err.message})`, "yellow");
        }
    }
}

/**
 * ✅ Core seeding process
 */
async function runSeeding({ seedDir, mode, dbURI, dbName, otpExpiryMinutes }) {
    const { client, db } = await connectToMongo(dbURI, dbName);

    try {
        if (!fs.existsSync(seedDir)) {
            log(`❌ Seed folder not found: ${seedDir}`, "red");
            process.exit(1);
        }

        const files = fs.readdirSync(seedDir).filter((f) => f.endsWith(".js"));
        if (files.length === 0) {
            log("⚠️ No seed files found.", "yellow");
            return;
        }

        const currentDbName = db.databaseName;
        log(`🚀 Starting seeding in "${mode}" mode...`, "cyan");
        log(`🗄️  Target database: ${currentDbName}`, "yellow");

        for (const file of files) {
            const collectionName = path.basename(file, path.extname(file));
            const fileUrl = pathToFileURL(path.join(seedDir, file)).href;

            try {
                const { default: seedData } = await import(fileUrl);
                if (!Array.isArray(seedData) || seedData.length === 0) {
                    log(`⚠️ Skipping ${collectionName}: invalid or empty data`, "yellow");
                    continue;
                }

                const collection = db.collection(collectionName);
                const existingCount = await collection.countDocuments();

                if (mode === "seed") {
                    if (existingCount > 0) {
                        log(`⏭️ Skipping ${collectionName} (${existingCount} existing docs)`, "dim");
                        continue;
                    }
                    await collection.insertMany(seedData);
                    log(`✅ Seeded ${collectionName} with ${seedData.length} docs`, "green");
                } else if (mode === "fresh") {
                    if (existingCount > 0) {
                        await collection.deleteMany({});
                        log(`🧹 Cleared ${collectionName} (${existingCount} docs removed)`, "gray");
                    }
                    await collection.insertMany(seedData);
                    log(`✅ Seeded fresh ${collectionName} with ${seedData.length} docs`, "green");
                }
            } catch (err) {
                log(`❌ Failed to seed ${collectionName}: ${err.message}`, "red");
            }
        }

        await ensureIndexes(db, otpExpiryMinutes, mode);
        log("🎉 Seeding completed successfully!", "green");
    } finally {
        await client.close().catch(() => { });
        log("🔒 MongoDB connection closed\n", "dim");
    }
}

/**
 * ✅ Entry point
 */
export default async function makeSeeding({ command = "seed", sub = [], flags = {} }) {
    const projectRoot = process.cwd();
    const config = commandConfig?.[command] || {};

    const seedPathFromFlagsOrConfig = flags.seedFilePath || config.seedFilePath;
    let seedDir = null;
    if (seedPathFromFlagsOrConfig) {
        if (
            seedPathFromFlagsOrConfig.startsWith("./") ||
            seedPathFromFlagsOrConfig.startsWith("../")
        ) {
            seedDir = path.resolve(projectRoot, seedPathFromFlagsOrConfig);
        } else {
            seedDir = seedPathFromFlagsOrConfig;
        }
    }

    const dbName = flags.db || config.dbName || null;
    const dbURI = flags.dbURI || config.dbURI || null;
    const otpExpiryMinutes = config.otpExpiryMinutes || 5;

    let subCommand = "seed";
    if (Array.isArray(sub) && sub.length > 0) subCommand = sub[0];
    else if (command.includes(":")) subCommand = command.split(":")[1] || "seed";

    if (subCommand === "list") {
        if (!seedDir) {
            log("❌ Missing seedFilePath for listing", "red");
            process.exit(1);
        }
        await listSeedFiles(seedDir);
        return;
    }

    if (!seedDir) {
        log("❌ Missing required option: --seedFilePath or seedFilePath in config", "red");
        process.exit(1);
    }
    if (!dbName) {
        log("❌ Missing required option: --db or dbName in config", "red");
        process.exit(1);
    }
    if (!dbURI) {
        log("❌ Missing required option: --dbURI, config.dbURI, or MONGO_URI in env", "red");
        process.exit(1);
    }

    switch (subCommand) {
        case "seed":
        case "fresh":
            await runSeeding({ seedDir, mode: subCommand, dbURI, dbName, otpExpiryMinutes });
            break;
        default:
            log(`❌ Unknown seeding sub-command: ${subCommand}`, "red");
            log("Available: seed (default), seed:list, seed:fresh", "yellow");
            process.exit(1);
    }
}
