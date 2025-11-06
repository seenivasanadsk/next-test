// command.js
import bootCommand from "./commands/index.js";

const commands = {
  list: {
    desc: "List all Commands",
  },
  about: {
    file: "aboutAnalyzer.js",
    desc: "Show information about system, application and etc..",
  },
  route: {
    file: "listRoutes.js",
    desc: "Analyze and list all routes",
  },
  api: {
    file: "listApis.js",
    desc: "Analyze and list all API",
  },
  action: {
    file: "listServerActions.js",
    desc: "Analyze and list all Server Actions",
  },
  seed: {
    file: "makeSeeder.js",
    desc: "Seed initial data into the database",
  },
  db: {
    file: "analyzeDB.js",
    desc: "Database management utilities",
  },
  backup: {
    file: "dbBackup.js",
    desc: "Backup your database and configurations",
  },
  server: {
    file: "serverUtils.js",
    desc: "Manage server operations like start, stop, clean, build in the background",
  },
  log: {
    file: "logManager.js",
    desc: "Manage application logs",
  },
};

bootCommand(commands);
