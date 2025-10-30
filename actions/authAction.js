// actions\authAction.js
"use server";
import { serializeId, unserializeDoc } from '@/utils/serialize';
import { generateOtp, loginUser, logoutUser, verifyOtpAndUpdatePassword, verifySession } from '../services/authService';
import { commonSuccess } from '@/utils/response';
import { AppError, commonError } from '@/utils/error';
import { cookies } from 'next/headers';
import logger from '@/lib/logger';

export async function loginAction(payload) {
    try {
        const { userId, password } = unserializeDoc(payload);
        const { session, user } = await loginUser(userId, password);
        const sessionExpireMinutes = parseInt(process.env.SESSION_EXPIRE_MINUTES || "60", 10);
        const maxAge = 60 * sessionExpireMinutes;
        const serializeUserId = serializeId(session.userId);

        // Setting session in Cookie
        const commonOptions = { httpOnly: true, maxAge }
        const cookieStore = (await cookies())
        cookieStore.set("SESSION_ID", session.sessionId, { ...commonOptions });
        cookieStore.set("SESSION_USER_ID", serializeUserId, { ...commonOptions });
        cookieStore.set("SESSION_USER_ROLE", session.role, { ...commonOptions });

        logger.info(`User Logged (in) Username:${user.username}, UserID:${serializeUserId}, Role: ${user.role}`)

        return commonSuccess(session, "Login Succeeful")
    } catch (error) {
        return commonError(error)
    }
}

export async function logoutAction() {
    const cookieStore = await cookies()
    try {
        const sessionId = cookieStore.get("SESSION_ID")?.value || null
        const verification = await verifySession(sessionId)
        if (!verification.isValid) {
            cookieStore.delete("SESSION_ID");
            cookieStore.delete("SESSION_USER_ID");
            cookieStore.delete("SESSION_USER_ROLE");
            return commonSuccess(verification);
        }
        const session = await logoutUser(sessionId);

        // Remove all session cookies (We can only modify Cookie in ServerAction)
        if (!!session._id) {
            cookieStore.delete("SESSION_ID");
            cookieStore.delete("SESSION_USER_ID");
            cookieStore.delete("SESSION_USER_ROLE");
        }

        logger.info(`User Logged (out) Username:${verification.username}, UserID:${verification.userId}, Role: ${verification.role}`)

        return commonSuccess(session, "Logout Succeeful")
    } catch (error) {
        if (error instanceof AppError) {
            cookieStore.delete("SESSION_ID");
            cookieStore.delete("SESSION_USER_ID");
            cookieStore.delete("SESSION_USER_ROLE");
        }
        return commonError(error)
    }
}


export async function sendOTP(payload) {
    try {
        const { userId } = unserializeDoc(payload)
        const data = await generateOtp(userId)
        return commonSuccess(data, { message: "OTP sent, check Mail" })
    } catch (error) {
        return commonError(error)
    }
}

export async function resetPassword(payload) {
    try {
        const { userId, otp, newPassword } = unserializeDoc(payload)
        const data = await verifyOtpAndUpdatePassword(userId, otp, newPassword)
        return commonSuccess(data, { message: "Password Reset" })
    } catch (error) {
        return commonError(error)
    }
}