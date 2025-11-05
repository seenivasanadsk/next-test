import fs from "fs";
import path from "path";
import formatText from "./helpers/formatText.js";
import commandConfig from "../config/command.js";

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

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  for (const file of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(file.name)) continue;
    const full = path.join(dir, file.name);
    if (file.isDirectory()) walkDir(full, callback);
    else if (file.isFile()) callback(full);
  }
}

function toRoute(filePath, projectRoot) {
  let route = filePath
    .replace(projectRoot, "")
    .replace(/\\/g, "/")
    .replace(/^\/(app|pages)\//, "")
    .replace(/(route)?\.(js|ts|jsx|tsx)$/, "")
    .replace(/index$/, "")
    .replace(/\([^()]*\)\//g, "")
    .replace(/@[^/]+\//g, "")
    .replace(/\/+/g, "/");
  if (!route.startsWith("/")) route = "/" + route;
  return route === "/" ? route : route.replace(/\/$/, "");
}

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

export default function listApis({ command, sub, flags, args }) {
  const projectRoot = process.cwd();
  const config = commandConfig?.[command] || {};

  if (!config?.analyzePath) {
    console.log(
      formatText("Config missing for this command", { color: "red" })
    );
    console.log(
      formatText("Check these file config/command.js", { color: "yellow" })
    );
    process.exit(0);
  }

  const targets = config.analyzePath;

  if (typeof projectRoot !== "string") {
    throw new TypeError(
      `Invalid argument: projectRoot must be a string (got ${typeof projectRoot})`
    );
  }

  const apis = [];

  for (const dir of targets) {
    if (!dir || typeof dir !== "string") continue;
    const full = path.join(projectRoot, dir);
    if (!fs.existsSync(full)) continue;

    walkDir(full, (filePath) => {
      if (!/\.(js|ts|jsx|tsx)$/i.test(filePath)) return;
      let isApi = false;

      // ✅ App Router API: /app/**/route.js
      if (/[/\\]app[/\\].*[/\\]route\.(js|ts|jsx|tsx)$/i.test(filePath)) {
        isApi = true;
      }

      // ✅ Pages Router API: /pages/api/**
      if (/[/\\]pages[/\\]api[/\\].*\.(js|ts|jsx|tsx)$/i.test(filePath)) {
        isApi = true;
      }

      if (isApi) {
        let code = "";
        try {
          code = fs.readFileSync(filePath, "utf8");
        } catch {
          return;
        }

        const methods = extractHttpMethods(code);
        apis.push({
          route: toRoute(filePath, projectRoot),
          methods: methods.length ? methods.join(", ") : "ANY",
        });
      }
    });
  }

  // Sort and align output
  apis.sort((a, b) => a.route.localeCompare(b.route));

  const longestMethod = Math.max(...apis.map((a) => a.methods.length));
  const longestRoute = Math.max(...apis.map((a) => a.route.length));

  apis.forEach((api) => {
    const methodText = formatText(api.methods.padEnd(longestMethod + 2), {
      color: "blue",
    });
    const routeText = formatText(api.route.padEnd(longestRoute), {
      color: "yellow",
    });
    console.log(`${methodText} ${routeText}`);
  });
}
