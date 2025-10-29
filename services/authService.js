// services/authService.js
import { AppError } from '@/utils/error';
import { findUserById } from '../dal/userDal';
import bcrypt from 'bcrypt';
import { createSession, deleteSessionBySessionID, findSessionBySessionID } from '@/dal/sessionDal';
import { getPort, getServerIp } from '@/lib/serverUtils';

export async function loginUser(userId, password) {
    const user = await findUserById(userId);
    if (!user) throw new AppError('User not found', 404);

    const isValid = await bcrypt.compare(password, user.hashed_password);
    if (!isValid) throw new AppError('Invalid password', 401);

    const session = await createSession({ userId: user._id, role: user.role })

    return session;
}

export async function logoutUser(sessionId) {
    if (!sessionId) throw new AppError("Session ID is required", 400);

    const session = await findSessionBySessionID(sessionId);
    if (!session) throw new AppError("Session not found", 404);

    // Delete the session from DB
    const res = await deleteSessionBySessionID(session._id);

    return session
}

export async function verifySession(sessionId) {
    // Check session cookie
    if (!sessionId) return { redirectTo: "/login", isValid: false, message: "SessionID required" }

    // Find session via DAL
    const session = await findSessionBySessionID(sessionId);
    if (!session) return { redirectTo: "/login", isValid: false, message: "Session not found" }

    // Check session expiry
    const now = new Date();
    const expiry = new Date(session.expiresAt);
    if (expiry <= now) {
        return { redirectTo: "/login", isValid: false, message: "Session is expired" }
    }

    // Get user via DAL
    const user = await findUserById(session.userId);
    if (!user) return { redirectTo: "/login", isValid: false, message: "User not found" }

    // Check user is Active
    if (!user.isActive) return { redirectTo: "/login", isValid: false, message: "User restricted" }

    // ✅ Return safe data
    return {
        isValid: true,
        userId: user._id.toString(),
        username: user.username,
        role: user.role,
        sessionId: session.sessionId,
        serverIP: await getServerIp(),
        serverPort: await getPort()
    };
}