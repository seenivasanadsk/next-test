#!/usr/bin/env node
/**
 * Advanced Next.js Project Analyzer
 * ---------------------------------
 * Detects:
 *  • Pages (Next App Router + Pages Router)
 *  • API Routes + HTTP methods
 *  • Server Actions (file-level + per-function)
 *  • Client Components
 */

// commands\analyzeNextRoutes.js

import fs from "fs";
import path from "path";

const projectRoot = process.cwd();
const scanTargets = process.argv.slice(2);
const targets = scanTargets.length ? scanTargets : ["app", "pages", "actions"];

const IGNORE_DIRS = new Set([
    "node_modules",
    ".next",
    ".git",
    "dist",
    "build",
    "out",
    ".vercel",
    ".turbo",
    ".cache",
    ".expo",
]);

const result = {
    pages: [],
    apis: [],
    serverActions: [],
    clientComponents: [],
};

// ----------------------
// Utility helpers
// ----------------------
function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    for (const file of fs.readdirSync(dir, { withFileTypes: true })) {
        if (IGNORE_DIRS.has(file.name)) continue;
        const full = path.join(dir, file.name);
        if (file.isDirectory()) walkDir(full, callback);
        else if (file.isFile()) callback(full);
    }
}

// Normalize to clean route
function toRoute(filePath) {
    let route = filePath
        .replace(projectRoot, "")
        .replace(/\\/g, "/")
        .replace(/^\/(app|pages)\//, "")
        .replace(/(page|route)?\.(js|ts|jsx|tsx)$/, "")
        .replace(/index$/, "")
        .replace(/\([^()]*\)\//g, "") // remove route groups
        .replace(/@[^/]+\//g, "") // remove parallel slots
        .replace(/\/+/g, "/");
    if (!route.startsWith("/")) route = "/" + route;
    if (route === "/") return route;
    return route.replace(/\/$/, "");
}

// Detect HTTP methods
function extractHttpMethods(code) {
    const regexes = [
        /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\b/gi,
        /export\s+function\s+(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\b/gi,
        /export\s+(?:const|let|var)\s+(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\b/gi,
    ];
    const methods = new Set();
    for (const r of regexes) {
        let m;
        while ((m = r.exec(code))) methods.add(m[1].toUpperCase());
    }
    return [...methods];
}

// Detect exported function names
function extractExportedFunctions(code) {
    const names = [];
    const funcPatterns = [
        /export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)/g,
        /export\s+(?:const|let|var)\s+([A-Za-z0-9_]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g,
    ];
    for (const p of funcPatterns) {
        let m;
        while ((m = p.exec(code))) names.push(m[1]);
    }
    return names;
}

// Detect server actions (supports file-level + per-function)
function extractServerActions(code) {
    const actions = [];
    const fileLevel = /^\s*["']use server["']/m.test(code);
    if (fileLevel) {
        return extractExportedFunctions(code);
    }
    const functionBlocks = [
        ...code.matchAll(/export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*\([^)]*\)\s*\{([\s\S]*?)\}/g),
        ...code.matchAll(/export\s+(?:const|let|var)\s+([A-Za-z0-9_]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{([\s\S]*?)\}/g),
    ];
    for (const [, name, body] of functionBlocks) {
        if (/"use server"/.test(body)) actions.push(name);
    }
    return actions;
}

// Detect client components
function isClientComponent(code) {
    return /^\s*["']use client["']/m.test(code);
}

// ----------------------
// Analyzer core
// ----------------------
function analyze() {
    for (const dir of targets) {
        const full = path.join(projectRoot, dir);
        if (!fs.existsSync(full)) continue;

        walkDir(full, (filePath) => {
            if (!/\.(js|ts|jsx|tsx)$/.test(filePath)) return;
            const normalized = filePath.replace(/\\/g, "/");
            let code = "";
            try {
                code = fs.readFileSync(filePath, "utf8");
            } catch {
                return;
            }

            // 1️⃣ Pages
            if (/\/app\/.*\/page\.(js|ts|jsx|tsx)$/i.test(normalized)) {
                result.pages.push(toRoute(filePath));
            }
            if (/\/pages\/(?!api\/).*\.((js|ts|jsx|tsx))$/i.test(normalized)) {
                result.pages.push(toRoute(filePath));
            }

            // 2️⃣ APIs
            if (
                /\/app\/.*\/route\.(js|ts|jsx|tsx)$/i.test(normalized) ||
                /\/pages\/api\/.*\.(js|ts|jsx|tsx)$/i.test(normalized)
            ) {
                const methods = extractHttpMethods(code);
                result.apis.push({ route: toRoute(filePath), methods });
            }

            // 3️⃣ Server Actions
            const serverFuncs = extractServerActions(code);
            if (serverFuncs.length > 0) {
                result.serverActions.push({
                    file: normalized.replace(projectRoot, ""),
                    functions: serverFuncs,
                });
            }

            // 4️⃣ Client Components
            if (isClientComponent(code)) {
                result.clientComponents.push(
                    normalized.replace(projectRoot, "").replace(/\\/g, "/")
                );
            }
        });
    }
    return result;
}

// ----------------------
// Run
// ----------------------
console.log("🔍 Scanning:", targets.map((t) => `"${t}"`).join(", "));
const summary = analyze();

// Summary output
console.log("\n📄 Pages:");
summary.pages.forEach((r) => console.log("  •", r));

console.log("\n⚙️  APIs:");
summary.apis.forEach(({ route, methods }) =>
    console.log(`  • ${route}  [${methods.join(", ") || "No methods"}]`)
);

console.log("\n🧩 Server Actions:");
summary.serverActions.forEach(({ file, functions }) => {
    console.log(`  • ${file}`);
    functions.forEach((f) => console.log(`     ↳ ${f}`));
});

console.log("\n💡 Client Components:");
summary.clientComponents.forEach((r) => console.log("  •", r));

console.log("\n✅ Done! Totals:", {
    pages: summary.pages.length,
    apis: summary.apis.length,
    serverActionFiles: summary.serverActions.length,
    totalServerActions: summary.serverActions.reduce(
        (a, f) => a + f.functions.length,
        0
    ),
    clientComponents: summary.clientComponents.length,
});

// Optional: write structured JSON file
fs.writeFileSync(
    path.join(projectRoot, "next-analyze.json"),
    JSON.stringify(summary, null, 2),
    "utf8"
);
console.log("\n🗂  Saved JSON → ./next-analyze.json");
