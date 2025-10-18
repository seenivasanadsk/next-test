// scripts/seed/index.js
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { getDb } from "../../lib/db.js";
import { loadEnvs } from "../../lib/envConfig.js";
import logger from "../../lib/logger.js";

// Read CLI arguments
const args = process.argv.slice(2);
const forceReseed = args.includes("--force");
const isProduction = args.includes("--prod");

// Load environment BEFORE dynamic imports
loadEnvs({ isProduction });

async function seed() {
    try {
        logger.info("Starting database seeding...");

        const db = await getDb();
        const seedDir = path.resolve(process.cwd(), "scripts", "seed");
        const files = fs.readdirSync(seedDir).filter(f => f !== "index.js");

        if (files.length === 0) {
            logger.warn("No seed files found");
            return;
        }

        logger.info(`Processing ${files.length} seed file(s)`);

        for (const file of files) {
            const collectionName = path.basename(file, path.extname(file));
            const filePath = path.join(seedDir, file);
            const fileUrl = pathToFileURL(filePath).href;

            try {
                // Import seed data
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

                // Insert new data
                await collection.insertMany(seedData);
                logger.info(`Seeded ${collectionName} with ${seedData.length} records`);

            } catch (importError) {
                logger.error(`Failed to process ${collectionName}: ${importError.message}`);
                continue;
            }
        }

        logger.info("Database seeding completed successfully");

        // Ensure logs are flushed before exit
        await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
        logger.error(`Seeding failed: ${error.message}`);
        throw error;
    }
}

// Execute seeding
seed()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        logger.error(`Seed script failed: ${error.message}`);
        process.exit(1);
    });