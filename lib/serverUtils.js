// lib/serverUtils.js
import os from "os";
import { headers } from "next/headers";

// Get the full host string
export function getHost() {
    const headersList = headers();
    return headersList.get("host") || "localhost:80";
}

// Get only the hostname (IP or domain)
export function getHostname() {
    const host = getHost();
    return host.split(":")[0];
}

// Get only the port
export function getPort() {
    const headersList = headers();
    const host = getHost();
    const portFromHost = host.split(":")[1];
    return portFromHost || headersList.get("x-forwarded-port") || "80";
}

// Get the local IPv4 address of the machine
export function getServerIp() {
    const interfaces = Object.values(os.networkInterfaces()).flat();

    const iface = interfaces.find(
        i => i.family === "IPv4" && !i.internal && (
            i.address.startsWith("192.168.") ||
            i.address.startsWith("10.")
        )
    );

    return iface?.address || null;
}
