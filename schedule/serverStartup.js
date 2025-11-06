import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import commandConfig from "../config/command.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schedulePath = commandConfig?.schedule?.scriptPath;

let projectRoot = __dirname;
if (schedulePath?.startsWith("./")) {
    const removablePath = schedulePath.replace(/^\.\//, "");
    projectRoot = __dirname.replace(removablePath, "");
}

console.log("Project root:", projectRoot);

process.chdir(projectRoot);

// Run dir command in Windows
exec("cmd /c dir", (err, stdout, stderr) => {
    if (err) console.error(err);
    if (stderr) console.error(stderr);
    console.log(stdout);

    // Pause
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('Press Enter to exit...', () => rl.close());
});
