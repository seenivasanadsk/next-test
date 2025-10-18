import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadEnvs } from "../../lib/envConfig.js";

// Get current directory name (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Detect CLI arguments
const args = process.argv.slice(2);
const isProduction = args.includes("--prod");

// Load environment before doing anything else
loadEnvs({ isProduction });

/**
 * Format file size to human readable format
 */
function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Get backup file details including size and creation date
 */
function getBackupFileDetails(filePath) {
    try {
        const stats = fs.statSync(filePath);
        const fileSize = stats.size;
        const created = stats.birthtime;

        // Parse date from filename
        const fileName = path.basename(filePath);
        const dateMatch = fileName.match(/date-(\d{2}-\d{2}-\d{4})/);
        let parsedDate = null;

        if (dateMatch) {
            const [day, month, year] = dateMatch[1].split("-");
            parsedDate = new Date(`${year}-${month}-${day}`);
        }

        return {
            fileName,
            fileSize,
            formattedSize: formatFileSize(fileSize),
            created: parsedDate || created,
            filePath
        };
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        return null;
    }
}

/**
 * Calculate total size of all backup files
 */
function calculateTotalSize(files) {
    return files.reduce((total, file) => total + file.fileSize, 0);
}

/**
 * Display backup files in a formatted table
 */
function displayBackupFiles(files) {
    console.log("\n📁 BACKUP FILES SUMMARY");
    console.log("=".repeat(80));

    if (files.length === 0) {
        console.log("No backup files found.");
        return;
    }

    // Sort files by creation date (newest first)
    files.sort((a, b) => b.created - a.created);

    // Display summary
    const totalSize = calculateTotalSize(files);
    console.log(`Total backup files: ${files.length}`);
    console.log(`Total storage used: ${formatFileSize(totalSize)}`);
    console.log(`Backup location: ${process.env.BACKUP_PATH || "backups"}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    console.log("-".repeat(80));

    // Display files in a table-like format
    console.log("BACKUP FILES LIST:");
    console.log("-".repeat(80));
    console.log("No.  | File Name".padEnd(55) + " | Size".padEnd(12) + " | Created Date");
    console.log("-".repeat(80));

    files.forEach((file, index) => {
        const fileNumber = (index + 1).toString().padEnd(4);
        const fileName = file.fileName.length > 50
            ? file.fileName.substring(0, 47) + "..."
            : file.fileName.padEnd(50);
        const fileSize = file.formattedSize.padEnd(10);
        const createdDate = file.created.toLocaleDateString();

        console.log(`${fileNumber} | ${fileName} | ${fileSize} | ${createdDate}`);
    });

    console.log("-".repeat(80));

    // Show retention info
    const retentionDays = parseInt(process.env.RETENTION_DAYS || "7", 10);
    console.log(`📅 Retention policy: ${retentionDays} days`);

    // Show which files would be pruned
    const now = Date.now();
    const msInDay = 24 * 60 * 60 * 1000;
    const filesToPrune = files.filter(file => {
        const ageInDays = (now - file.created.getTime()) / msInDay;
        return ageInDays > retentionDays;
    });

    if (filesToPrune.length > 0) {
        console.log(`⚠️  ${filesToPrune.length} file(s) would be pruned based on retention policy`);
    } else {
        console.log("✅ All files are within retention period");
    }
}

/**
 * Main function to show backup files
 */
async function showBackupFiles() {
    try {
        const backupDir = process.env.BACKUP_PATH || "backups";

        // Check if backup directory exists
        if (!fs.existsSync(backupDir)) {
            console.log(`❌ Backup directory '${backupDir}' does not exist.`);
            console.log("   Run 'npm run backup' first to create backups.");
            return;
        }

        // Get all backup files
        const files = fs.readdirSync(backupDir)
            .filter(f => f.endsWith(".gz"))
            .map(f => path.join(backupDir, f))
            .map(getBackupFileDetails)
            .filter(Boolean);

        // Display the backup files
        displayBackupFiles(files);

    } catch (error) {
        console.error("❌ Error showing backup files:", error);
        process.exit(1);
    }
}

// Run the show backup function
showBackupFiles();