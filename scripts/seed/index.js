// scripts\seed\index.js
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { getDb } from "../../lib/db.js";
import { loadEnvs } from "../../lib/envConfig.js";

// Read CLI arguments
const args = process.argv.slice(2);
const forceReseed = args.includes("--force");
const productionSeed = args.includes("--prod");

// 1️⃣ Load environment BEFORE dynamic imports
loadEnvs({ productionSeed });

async function seed() {
    const db = await getDb();
    const seedDir = path.resolve(process.cwd(), "scripts", "seed");
    const files = fs.readdirSync(seedDir).filter(f => f !== "index.js");

    for (const file of files) {
        const collectionName = path.basename(file, path.extname(file));
        const filePath = path.join(seedDir, file);
        const fileUrl = pathToFileURL(filePath).href;

        console.log(`\n🌱 Loading seed file: ${collectionName}...`);

        // 2️⃣ Import AFTER envs loaded
        const { default: seedData } = await import(fileUrl);

        if (!Array.isArray(seedData) || seedData.length === 0) {
            console.log(`⚠️ Skipping ${collectionName}: empty or invalid data`);
            continue;
        }

        const collection = db.collection(collectionName);
        const existingCount = await collection.countDocuments();

        if (existingCount > 0 && forceReseed) {
            await collection.deleteMany({});
            console.log(`⚠️ Cleared ${existingCount} records in "${collectionName}"`);
        } else if (existingCount > 0) {
            console.log(`Skipping "${collectionName}" (already has data)`);
            continue;
        }

        await collection.insertMany(seedData);
        console.log(`✅ Seeded "${collectionName}" with ${seedData.length} records`);
    }

    console.log("\n✅ All collections seeded successfully!");
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
