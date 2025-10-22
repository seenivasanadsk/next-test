// schedule\clearLogs.js

import { schedule } from "../lib/scheduler.js";

export default schedule("clearLogs")
    .minutely(5)
    .run("scripts/log/clear.js");
