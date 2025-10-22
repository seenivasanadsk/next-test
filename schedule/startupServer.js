// schedule\startupServer.js

import { schedule } from "../lib/scheduler.js";

export default schedule("ServerStartup")
    .onLogon()
    .run("scripts/job/server_startup.js");
