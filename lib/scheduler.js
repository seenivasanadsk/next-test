// lib\scheduler.js

export function schedule(name) {
    const config = { name };

    return {
        minutely(interval = 1) {
            config.schedule = "MINUTE";
            config.interval = interval;
            return this;
        },
        hourly(interval = 1) {
            config.schedule = "HOURLY";
            config.interval = interval;
            return this;
        },
        daily(interval = 1) {
            config.schedule = "DAILY";
            config.interval = interval;
            return this;
        },
        weekly(days = ["SUN"], interval = 1) {
            config.schedule = "WEEKLY";
            config.days = days;
            config.interval = interval;
            return this;
        },
        monthly(dayOfMonth = 1) {
            config.schedule = "MONTHLY";
            config.dayOfMonth = dayOfMonth;
            return this;
        },
        atStartup() {
            config.schedule = "ONSTART"; // ✅ mark as system startup
            return this;
        },
        onLogon() {
            config.schedule = "ONLOGON"; // ✅ mark as user logon
            return this;
        },
        run(fnOrPath) {
            config.script = fnOrPath;  // ✅ store as `script`
            return config;
        },
    };
}
