// lib/serverUtils.js
import os from "os";
import { headers } from "next/headers";

/**
 * Get the full host string from headers
 */
export async function getHost() {
    const h = await headers();
    return h.get("host") || "localhost:80";
}

/**
 * Get only the hostname (IP or domain)
 */
export async function getHostname() {
    const host = await getHost();
    return host.split(":")[0];
}

/**
 * Get only the port
 */
export async function getPort() {
    const h = await headers();
    const host = await getHost();
    const portFromHost = host.split(":")[1];
    return portFromHost || h.get("x-forwarded-port") || "80";
}

/**
 * Get the local IPv4 address of the server
 */
export async function getServerIp() {
    const interfaces = Object.values(os.networkInterfaces()).flat();
    const iface = interfaces.find(
        (i) =>
            i.family === "IPv4" &&
            !i.internal &&
            (i.address.startsWith("192.168.") || i.address.startsWith("10."))
    );
    return iface?.address || null;
}

/**
 * Get client IP address
 * - Works automatically in Server Components & Server Actions
 * - Can accept NextRequest in Route Handlers
 * @param {import('next/server').NextRequest} req optional NextRequest
 * @returns {string|null} client IP
 */
export async function getClientIp(req = null) {
    let ip = null;

    if (req?.headers) {
        // Route handler with NextRequest
        ip =
            req.headers.get("x-forwarded-for")?.split(",")[0] ||
            req.headers.get("cf-connecting-ip") ||
            req.ip || // experimental
            null;
    } else {
        // Server Component / Server Action
        const h = await headers();
        ip = h.get("x-forwarded-for")?.split(",")[0] || h.get("cf-connecting-ip") || null;
    }

    // Normalize IPv6-mapped IPv4
    return ip?.replace(/^::ffff:/, "") || null;
}
