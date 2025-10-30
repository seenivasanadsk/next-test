// scripts/seed/index.js
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { getDb } from "../../lib/db.js";
import { loadEnvs } from "../../lib/envConfig.js";
import logger from "../../lib/logger.js";

// CLI flags
const args = process.argv.slice(2);
const forceReseed = args.includes("--force");
const isProduction = args.includes("--prod");

loadEnvs({ isProduction });

async function seed() {
    try {
        logger.info("Starting database seeding...");
        const db = await getDb();

        // 🔹 Normal data seeding
        const seedDir = path.resolve(process.cwd(), "scripts", "seed");
        const files = fs.readdirSync(seedDir).filter(f => f !== "index.js");

        if (files.length === 0) {
            logger.warn("No seed files found");
        } else {
            logger.info(`Processing ${files.length} seed file(s)`);
            for (const file of files) {
                const collectionName = path.basename(file, path.extname(file));
                const filePath = path.join(seedDir, file);
                const fileUrl = pathToFileURL(filePath).href;

                try {
                    const { default: seedData } = await import(fileUrl);

                    if (!Array.isArray(seedData) || seedData.length === 0) {
                        logger.warn(`Skipping ${collectionName}: empty or invalid data`);
                        continue;
                    }

                    const collection = db.collection(collectionName);
                    const existingCount = await collection.countDocuments();

                    if (existingCount > 0 && forceReseed) {
                        logger.info(`Clearing ${existingCount} records from ${collectionName}`);
                        await collection.deleteMany({});
                    } else if (existingCount > 0) {
                        logger.info(`Skipping ${collectionName} (${existingCount} existing records)`);
                        continue;
                    }

                    await collection.insertMany(seedData);
                    logger.info(`Seeded ${collectionName} with ${seedData.length} records`);
                } catch (err) {
                    logger.error(`Failed to process ${collectionName}: ${err.message}`);
                    continue;
                }
            }
        }

        // 🔹 Now ensure indexes after seeding
        await ensureIndexes(db);

        logger.info("Database seeding and index creation completed successfully");
        await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
        logger.error(`Seeding failed: ${error.message}`);
        throw error;
    }
}

// 🔹 New: central index setup function
async function ensureIndexes(db) {
    logger.info("Ensuring required indexes...");

    // ✅ TTL index for sessions collection
    await db.collection("sessions").createIndex(
        { expiresAt: 1 },
        { expireAfterSeconds: 0 }
    );

    // ✅ TTL index for passwordResets collection
    const expiratrionMinutes = parseInt(process.env.OTP_EXPIRE_MINUTES || "1")
    const expireAfterSeconds = expiratrionMinutes * 60
    await db.collection("passwordResets").createIndex(
        { expireAfterSeconds }
    );

    logger.info("TTL index ensured for sessions collection");
}

// Run seeder
seed()
    .then(() => process.exit(0))
    .catch(err => {
        logger.error(`Seed script failed: ${err.message}`);
        process.exit(1);
    });
