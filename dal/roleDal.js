import { getDb } from "@/lib/db";

export async function findRoleByName(roleName) {
    const db = await getDb()
    return await db.collection('roles').findOne({ name: roleName });
}
