// commands/aboutSimple.js
import os from "os";
import fs from "fs";
import path from "path";
import child_process from "child_process";
import formatText from "./helpers/formatText.js";

function exec(cmd) {
  try {
    return child_process
      .execSync(cmd, { stdio: "pipe", encoding: "utf8" })
      .trim();
  } catch {
    return "";
  }
}

function humanBytes(bytes) {
  if (!bytes || isNaN(bytes)) return "N/A";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let val = bytes;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
  }
  return `${val.toFixed(2)} ${units[i]}`;
}

function safeReadPackageJson(projectRoot) {
  try {
    const pkgPath = path.join(projectRoot, "package.json");
    if (fs.existsSync(pkgPath)) {
      return JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    }
  } catch {}
  return null;
}

function isPrivateIp(ip) {
  return (
    /^10\./.test(ip) ||
    /^192\.168\./.test(ip) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)
  );
}

export default function aboutSimple() {
  const projectRoot = process.cwd();

  const osType = os.type(); // e.g. 'Windows_NT', 'Linux', 'Darwin'
  const osPlatform = os.platform(); // 'win32','linux','darwin'
  const osRelease = os.release();

  const cpus = os.cpus() || [];
  const cpu = cpus[0] || {};
  const cpuModel = cpu.model || "Unknown CPU";
  const cores = cpus.length || "N/A";
  const speedMHz = cpu.speed || 0;
  const speedGHz = (speedMHz / 1000).toFixed(2) + " GHz";

  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  const nodeVersion = process.version;
  const npmVersion = exec("npm -v");
  const yarnVersion = exec("yarn -v");
  const pnpmVersion = exec("pnpm -v");

  const pkg = safeReadPackageJson(projectRoot);
  const nextVersion =
    (pkg &&
      ((pkg.dependencies && pkg.dependencies.next) ||
        (pkg.devDependencies && pkg.devDependencies.next))) ||
    "not found";

  // 🔹 Get local network IP
  const ifaces = os.networkInterfaces();
  let localIp = "N/A";
  for (const addrs of Object.values(ifaces)) {
    for (const a of addrs) {
      if (a.family === "IPv4" && !a.internal) {
        localIp = a.address;
        break;
      }
    }
    if (localIp !== "N/A") break;
  }

  // 🔹 Try to get global IP (via curl)
  let globalIp = "";
  try {
    globalIp = exec("curl -s https://api.ipify.org") || "";
  } catch {}

  // 🔹 Label private/public intelligently
  let ipDisplay = localIp;
  if (globalIp && globalIp !== localIp) {
    if (isPrivateIp(localIp)) {
      ipDisplay = `${localIp} (private), ${globalIp} (public)`;
    } else {
      ipDisplay = `${localIp} (public)`;
    }
  }

  // 🔹 Storage (best-effort)
  let storageHuman = "N/A";
  if (osPlatform === "win32") {
    const out = exec("wmic logicaldisk get Size /format:list")
      .split("\n")
      .find((l) => l.includes("Size="));
    if (out) {
      const size = Number(out.replace("Size=", "").trim());
      storageHuman = humanBytes(size);
    }
  } else {
    const stat = exec("df -k --total | grep total");
    if (stat) {
      const parts = stat.split(/\s+/);
      const sizeKB = Number(parts[1]);
      storageHuman = humanBytes(sizeKB * 1024);
    }
  }

  function printAbout(text) {
    console.log(formatText(text, { color: "yellow" }));
  }

  // 🔸 Print clean yellow list
  printAbout(`Operating System : ${osType} (${osPlatform}) ${osRelease}`);
  printAbout(`Processor        : ${cpuModel}`);
  printAbout(`Cores            : ${cores}`);
  printAbout(`CPU Speed        : ${speedGHz}`);
  printAbout(`Memory Total     : ${humanBytes(totalMem)}`);
  printAbout(`Memory Free      : ${humanBytes(freeMem)}`);
  printAbout(`Memory Used      : ${humanBytes(usedMem)}`);
  printAbout(`Storage Total    : ${storageHuman}`);
  printAbout(`IP Address       : ${ipDisplay}`);
  printAbout(`Node Version     : ${nodeVersion}`);
  printAbout(`NPM Version      : ${npmVersion}`);
  if (yarnVersion) printAbout(`Yarn Version     : ${yarnVersion}`);
  if (pnpmVersion) printAbout(`PNPM Version     : ${pnpmVersion}`);
  printAbout(`Next.js Version  : ${nextVersion}`);

  return {
    os: { osType, osPlatform, osRelease },
    cpu: { cpuModel, cores, speedGHz },
    memory: {
      total: humanBytes(totalMem),
      free: humanBytes(freeMem),
      used: humanBytes(usedMem),
    },
    storage: storageHuman,
    ip: ipDisplay,
    node: nodeVersion,
    npm: npmVersion,
    yarn: yarnVersion,
    pnpm: pnpmVersion,
    next: nextVersion,
  };
}
