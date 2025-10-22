// schedule\clearBackup.js

import { schedule } from "../lib/scheduler.js";

export default schedule("clearBackup")
    .minutely(5)
    .run("scripts/backup/index.js");
