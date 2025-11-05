// commands\listRoutes.js
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
    .replace(/(page|route)?\.(js|ts|jsx|tsx)$/, "")
    .replace(/index$/, "")
    .replace(/\([^()]*\)\//g, "") // remove route groups
    .replace(/@[^/]+\//g, "") // remove parallel routes
    .replace(/\/+/g, "/");
  if (!route.startsWith("/")) route = "/" + route;
  return route === "/" ? route : route.replace(/\/$/, "");
}

export default function listRoutes({ command, sub, flags, args }) {
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

  const pages = [];

  for (const dir of targets) {
    if (!dir || typeof dir !== "string") continue;
    const full = path.join(projectRoot, dir);
    if (!fs.existsSync(full)) continue;

    walkDir(full, (filePath) => {
      if (!/\.(js|ts|jsx|tsx)$/i.test(filePath)) return;

      // ✅ APP Router: /app/**/page.js
      if (/[/\\]app[/\\].*[/\\]page\.(js|ts|jsx|tsx)$/i.test(filePath)) {
        pages.push(toRoute(filePath, projectRoot));
        return;
      }

      // ✅ PAGES Router: /pages/**/*.js but NOT /pages/api/**
      if (/[/\\]pages[/\\](?!api[/\\]).*\.(js|ts|jsx|tsx)$/i.test(filePath)) {
        pages.push(toRoute(filePath, projectRoot));
      }
    });
  }

  pages.sort().forEach((page) => {
    console.log(formatText(page, { color: "yellow" }));
  });
  process.exit(0);
}
