// scripts\task\taskDelete.js

import { deleteAllTasks } from "../../lib/windowsTasks.js";
import { loadEnvs } from "../../lib/envConfig.js";

const args = process.argv.slice(2);
const isProduction = args.includes("--prod");

// Load environment
loadEnvs({ isProduction });

await deleteAllTasks(); // delete all tasks without recreating
