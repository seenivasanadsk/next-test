import path from 'path';
import { fileURLToPath } from 'url';
import commandConfig from "../config/command.js";

export function getProjectRoot() {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const schedulePath = commandConfig?.schedule?.scriptPath;

    let projectRoot = __dirname;
    if (schedulePath?.startsWith("./")) {
        const removablePath = schedulePath.replace(/^\.\//, "");
        projectRoot = __dirname.replace(removablePath, "");
    }
    console.log("Project root:", projectRoot);
    return projectRoot;
}