// lib/envConfig.js
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

let isInitialized = false;

export function loadEnvs({ isProduction = false } = {}) {
    // Simple check - if we've run this function before, skip
    if (isInitialized) {
        console.log("🔄 Environment config already initialized, skipping...");
        return;
    }

    const env = isProduction ? "production" : process.env.NODE_ENV || "development";
    process.env.NODE_ENV = env;

    const envFilePath = path.resolve(process.cwd(), `.env.${env}`);

    if (fs.existsSync(envFilePath)) {
        // Load only this file
        const result = dotenv.config({ path: envFilePath });
        if (result.error) throw result.error;
        console.log(`✅ Loaded environment: ${envFilePath}`);
    } else {
        console.warn(`⚠️ No environment file found for ${envFilePath}`);
    }

    // Explicitly set APP_ENV if not already set
    process.env.APP_ENV = process.env.APP_ENV || env;

    // Mark as initialized
    isInitialized = true;
}

// Export reset function for testing purposes
export function resetEnvConfig() {
    isInitialized = false;
}