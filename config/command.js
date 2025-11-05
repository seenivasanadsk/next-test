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
    dbName: "test",
    dbURI: "mongodb://localhost:27017",
    backupPath: "_backup", // if '_' present in the starting its replace project root path
    backupRetentionDays: 7,
  },
};
