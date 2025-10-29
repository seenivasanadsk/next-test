"use server";

import { verifySession } from "@/services/authService";
import { cookies } from "next/headers";

export default async function getCurrentSession() {
    const cookieStore = await cookies(); // next/headers automatically gives cookies for this request
    const sessionId = cookieStore.get("SESSION_ID")?.value || null;
    const session = await verifySession(sessionId);
    return session;
}
