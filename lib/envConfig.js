// lib\envConfig.js
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

export function loadEnvs({ productionSeed = false } = {}) {
    const env = productionSeed ? "production" : process.env.NODE_ENV || "development";
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

    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("APP_ENV:", process.env.APP_ENV);
}
