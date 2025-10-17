// lib/serverUtils.js
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
