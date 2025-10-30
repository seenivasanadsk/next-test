import { getDb } from "@/lib/db";

export async function findOtpByUserId(userId) {
    const db = await getDb();
    return await db.collection("passwordResets").findOne({ userId });
}

export async function deleteOtpByUserId(userId) {
    const db = await getDb();
    return await db.collection("passwordResets").deleteMany({ userId });
}

export async function createOtpByUserId(userId, OTP) {
    const db = await getDb();
    const newRecord = { userId, OTP, createdAt: new Date() };
    await db.collection("passwordResets").insertOne(newRecord);
    return newRecord;
}
