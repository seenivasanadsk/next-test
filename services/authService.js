// services/authService.js
import { AppError } from '@/utils/error';
import { findUserById, updatePasswordById, updateUserLastAccess, updateUserLastLogin } from '../dal/userDal';
import bcrypt from 'bcrypt';
import { createSession, deleteSessionBySessionID, findSessionBySessionID } from '@/dal/sessionDal';
import { getPort, getServerIp } from '@/lib/serverUtils';
import { getUserById } from './userService';
import { createOtpByUserId, deleteOtpByUserId, findOtpByUserId } from '@/dal/passwordResetDal';
import sendOTPMail from '@/mails/trigger/sendOTPMail';
import { serializeId } from '@/utils/serialize';
import logger from '@/lib/logger';

export async function loginUser(userId, password) {
    const user = await findUserById(userId);
    if (!user) throw new AppError('User not found', 404);

    if (!user.isActive) throw new AppError('User Restricted', 404);

    const isValid = await bcrypt.compare(password, user.hashed_password);
    if (!isValid) throw new AppError('Invalid password', 401);

    const session = await createSession({ userId: user._id, role: user.role })
    updateUserLastLogin(userId)

    return { session, user };
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

    updateUserLastAccess(user._id)

    // ✅ Return safe data
    return {
        isValid: true,
        userId: user._id.toString(),
        username: user.username,
        role: user.role,
        sessionId: session.sessionId,
        user,
        session,
        serverIP: await getServerIp(),
        serverPort: await getPort()
    };
}

export async function generateOtp(userId, ttlSeconds) {
    if (!userId) throw new AppError("User id Required", 404)
    const user = await getUserById(userId)
    const now = new Date();
    const toMail = process.env.MAIL_ID

    // Check if an OTP already exists and is not expired
    const existingOtpRecord = await findOtpByUserId(userId);

    if (existingOtpRecord) {
        const createdAt = new Date(existingOtpRecord.createdAt); // ensure it's a Date
        const diffSeconds = (now - createdAt) / 1000;

        if (!ttlSeconds) {
            const expiratrionMinutes = parseInt(process.env.OTP_EXPIRE_MINUTES || "1")
            ttlSeconds = expiratrionMinutes * 60
        }

        // ✅ Expired if TTL passed OR record is already marked expired
        if (diffSeconds > ttlSeconds) {
            await deleteOtpByUserId(userId);
        } else {
            sendOTPMail(toMail, {
                username: user.username,
                otp: existingOtpRecord.OTP,
                expiryMinutes: ttlSeconds / 60
            })
            return existingOtpRecord;
        }
    }

    // Generate new OTP
    const OTP = String(Math.floor(100000 + Math.random() * 900000));

    // Create new OTP record in DB
    const newRecord = await createOtpByUserId(userId, OTP);

    sendOTPMail(toMail, {
        username: user.username,
        otp: newRecord.OTP,
        expiryMinutes: ttlSeconds / 60
    })

    logger.info(`OTP Generated for Username:${user.username}, UserID:${serializeId(user._id)}, Role: ${user.role}`)

    return newRecord;
}

export async function verifyOtpAndUpdatePassword(userId, inputOtp, newPassword, ttlSeconds) {
    const now = new Date();

    const record = await findOtpByUserId(userId);
    if (!record) throw new AppError("OTP not generated, Try again", 401);

    if (!ttlSeconds) {
        const expiratrionMinutes = parseInt(process.env.OTP_EXPIRE_MINUTES || "1")
        ttlSeconds = expiratrionMinutes * 60
    }

    // Check if OTP expired
    const diffSeconds = (now - record.createdAt) / 1000;
    if (diffSeconds > ttlSeconds) {
        await deleteOtpByUserId(userId);
        throw new AppError("OTP Expired", 401);
    }

    if (record.OTP === inputOtp) {
        // Mark as verified and optionally delete
        logger.info(`Password Resetted for UserID:${serializeId(userId)}`)
        const res = await updatePasswordById(userId, newPassword)
        if (res?.acknowledged)
            return { userId }
    }

    throw new AppError("Invalid OTP", 401);
}