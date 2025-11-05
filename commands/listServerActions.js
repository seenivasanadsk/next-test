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

function extractServerActions(code) {
  const actions = [];
  const fileLevel = /^\s*["']use server["']/m.test(code);
  if (fileLevel) {
    const matches = [
      ...code.matchAll(/export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)/g),
      ...code.matchAll(/export\s+(?:const|let|var)\s+([A-Za-z0-9_]+)/g),
    ];
    return matches.map((m) => m[1]);
  }

  const functionBlocks = [
    ...code.matchAll(
      /export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*\([^)]*\)\s*\{([\s\S]*?)\}/g
    ),
    ...code.matchAll(
      /export\s+(?:const|let|var)\s+([A-Za-z0-9_]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{([\s\S]*?)\}/g
    ),
  ];

  for (const [, name, body] of functionBlocks) {
    if (/"use server"/.test(body)) actions.push(name);
  }
  return actions;
}

export default function listServerActions({ command, sub, flags, args }) {
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

  const actions = [];

  for (const dir of targets) {
    if (!dir || typeof dir !== "string") continue;
    const full = path.join(projectRoot, dir);
    if (!fs.existsSync(full)) continue;

    walkDir(full, (filePath) => {
      if (!/\.(js|ts|jsx|tsx)$/i.test(filePath)) return;

      let code = "";
      try {
        code = fs.readFileSync(filePath, "utf8");
      } catch {
        return;
      }

      const funcs = extractServerActions(code);
      if (funcs.length > 0) {
        const actionPath = path.join(projectRoot, "actions/");
        actions.push({
          file: filePath.replace(actionPath, ""),
          functions: funcs,
        });
      }
    });
  }

  actions
    .sort((a, b) => a.file.localeCompare(b.file))
    .forEach(({ file, functions }) => {
      console.log(formatText(file, { color: "cyan" }));
      functions.forEach((fn) => {
        console.log("  " + formatText(`↳ ${fn}`, { color: "yellow" }));
      });
    });
}
