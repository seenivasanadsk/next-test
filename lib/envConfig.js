// lib/envConfig.js
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

let isInitialized = false;

export function loadEnvs({ isProduction = false } = {}) {
    if (isInitialized) {
        console.log("🔄 Environment config already initialized, skipping...");
        return;
    }

    // Don't override NODE_ENV if it's already set by Next.js
    const env = process.env.NODE_ENV || (isProduction ? "production" : "development");

    // Only load additional env files that Next.js doesn't handle
    const customEnvFile = path.resolve(process.cwd(), `.env.${env}`);

    if (fs.existsSync(customEnvFile)) {
        const result = dotenv.config({ path: customEnvFile });
        if (result.error) {
            console.warn(`⚠️ Failed to load custom env file: ${result.error}`);
        } else {
            console.log(`✅ Loaded custom environment: ${customEnvFile}`);
        }
    }

    isInitialized = true;
}

export function resetEnvConfig() {
    isInitialized = false;
}