const common = {
  dbName: "test",
  dbURI: "mongodb://localhost:27017",
}

export default {
  route: {
    analyzePath: ["app"],
  },
  api: {
    analyzePath: ["app"],
  },
  action: {
    analyzePath: ["actions"],
  },
  backup: {
    // [APP_NAME] - Get from package.json name
    // [DB_NAME]  - Get db name
    // [FORMAT_]  - Get current date
    fileFormat: "backup-[APP_NAME]-[DB_NAME]-[FORMAT_yyyy-mm-dd-hh-ii-ss-aa]",
    appNameOrPrefix: "NextTestApp",
    dbName: common.dbName,
    dbURI: common.dbURI,
    backupPath: "./backup", // if './' present in the starting its replace project root path
    backupRetentionDays: 7,
  },
  seed: {
    seedFilePath: "./seed",
    dbName: common.dbName,
    dbURI: common.dbURI,
    otpExpiryMinutes: 5,
  },
  db: {
    dbName: common.dbName,
    dbURI: common.dbURI,
  },
  server: {
    port: 2000
  },
  log: {
    logDir: "./logs",
    maxLogDays: 7,
    lines: 10
  },
  schedule: {
    prefix: "ntapp-",
    scriptPath: "./schedule"
  }
};
