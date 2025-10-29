// dal\sessionDal.js
import { getDb } from '../lib/db';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';
import { getClientIp } from '@/lib/serverUtils';

export async function createSession({ userId, role }) {
    const db = await getDb();
    const ipAddress = await getClientIp()
    const sessionExpireMinutes = parseInt(process.env.SESSION_EXPIRE_MINUTES || "60", 10); // default 60 mins

    // Delete existing sessions for this user
    await db.collection("sessions").deleteMany({ userId: new ObjectId(userId) });

    const session = {
        sessionId: crypto.randomBytes(32).toString('hex'),
        userId: new ObjectId(userId),
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 1000 * 60 * sessionExpireMinutes),
        ipAddress,
        role,
    };

    const result = await db.collection('sessions').insertOne(session);
    return { ...session, _id: result.insertedId };
}

export async function findSessionBySessionID(sessionId) {
    if (!sessionId) return null;
    const db = await getDb();
    return db.collection("sessions").findOne({ sessionId });
}

export async function deleteSessionBySessionID(sessionId) {
    if (!sessionId) return null;

    const db = await getDb();
    return db.collection("sessions").deleteOne({ sessionId });
}