// dal\userDal.js
import { getDb } from '../lib/db';

export async function findUserByUserName(username) {
    const db = await getDb()
    return db.collection('users').findOne({ username });
}

export async function findUserById(userId) {
    const db = await getDb()
    return await db.collection('users').findOne({ _id: userId });
}

export async function fetchUserOptions() {
    const db = await getDb();
    const users = await db
        .collection('users')
        .find({ isActive: true }, { projection: { username: 1 } })
        .toArray();
    return users;
}