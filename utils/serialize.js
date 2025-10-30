// /utils/serialize.js
import { ObjectId } from "mongodb";

const hiddenFields = ["password", "token", "OTP", "secret", "hashed_password"]

/**
 * Serialize MongoDB document(s) for sending to client
 * Converts ObjectId -> string, Date -> ISO string
 * Hides sensitive fields if specified
 */
export function serializeDoc(doc) {
    if (!doc) return null;

    if (Array.isArray(doc)) return doc.map((d) => serializeDoc(d, hiddenFields));

    const result = {};
    for (const [key, value] of Object.entries(doc)) {
        if (hiddenFields.includes(key)) continue;

        if (value instanceof ObjectId) {
            result[key] = value.toString();
        } else if (value instanceof Date) {
            result[key] = value.toISOString();
        } else if (Array.isArray(value)) {
            result[key] = value.map((v) => (v && typeof v === "object" ? serializeDoc(v, hiddenFields) : v));
        } else if (value && typeof value === "object") {
            result[key] = serializeDoc(value, hiddenFields);
        } else {
            result[key] = value;
        }
    }
    return result;
}

/**
 * Unserialize client data to MongoDB-ready format
 * Converts string _id -> ObjectId and ISO string -> Date
 */
export function unserializeDoc(doc) {
    if (!doc) return null;

    if (Array.isArray(doc)) return doc.map(unserializeDoc);

    const result = {};
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/i;

    for (const [key, value] of Object.entries(doc)) {
        if (typeof value === "string") {
            if (ObjectId.isValid(value) && (value.length === 12 || value.length === 24)) {
                result[key] = new ObjectId(value);
            } else if (isoDateRegex.test(value)) {
                result[key] = new Date(value);
            } else {
                result[key] = value;
            }
        } else if (Array.isArray(value)) {
            result[key] = value.map((v) => (v && typeof v === "object" ? unserializeDoc(v) : v));
        } else if (value && typeof value === "object") {
            result[key] = unserializeDoc(value);
        } else {
            result[key] = value;
        }
    }
    return result;
}

/**
 * Convert ID to ObjectId safely
 */
export function unserializeId(id) {
    if (!id) throw new Error("ID is required");
    if (id instanceof ObjectId) return id;
    if (!ObjectId.isValid(id)) throw new Error("Invalid ObjectId");
    return new ObjectId(id);
}

/**
 * Convert ObjectId to string safely
 * @param {ObjectId|string} id
 * @returns {string|null}
 */
export function serializeId(id) {
    if (!id) return null;
    if (typeof id === "string") return id;        // already string
    if (id instanceof ObjectId) return id.toString();
    throw new Error("Invalid ObjectId");
}