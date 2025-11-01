// dal\userDal.js
import bcrypt from "bcrypt";
import { getDb } from "../lib/db";
import { findWithTableOptions } from "@/lib/dataTable";

function getUserTableHeaders() {
  return [
    {
      title: "Username",
      valuePath: "username",
      sortable: true,
      filterable: "Off",
      searchable: true,
    },
    { title: "Role", valuePath: "role", sortable: true, filterable: "Select" },
    {
      title: "Last Login",
      valuePath: "lastLogin",
      sortable: true,
      filterable: "Date",
      searchable: true,
      display: "dateTime",
    },
    {
      title: "Last Access",
      valuePath: "lastAccess",
      sortable: true,
      filterable: "Date",
      searchable: true,
      display: "dateTime",
    },
    {
      title: "Last Pass Reset",
      valuePath: "lastPasswordReset",
      sortable: true,
      filterable: "Date",
      searchable: true,
      display: "dateTime",
    },
  ];
}

export async function findUserByUserName(username) {
  const db = await getDb();
  return db.collection("users").findOne({ username });
}

export async function findUserById(userId) {
  const db = await getDb();
  return await db.collection("users").findOne({ _id: userId });
}

export async function fetchUserOptions() {
  const db = await getDb();
  const users = await db
    .collection("users")
    .find({ isActive: true }, { projection: { username: 1 } })
    .toArray();
  return users;
}

export async function updatePasswordById(userId, password) {
  password = await bcrypt.hash(password, 10);
  const db = await getDb();
  const result = await db
    .collection("users")
    .updateOne(
      { _id: userId },
      { $set: { hashed_password: password, lastPasswordReset: new Date() } }
    );
  return result;
}

export async function updateUserLastLogin(userId) {
  const db = await getDb();
  const result = await db
    .collection("users")
    .updateOne({ _id: userId }, { $set: { lastLogin: new Date() } });
  return result;
}

export async function updateUserLastAccess(userId) {
  const db = await getDb();
  const result = await db
    .collection("users")
    .updateOne({ _id: userId }, { $set: { lastAccess: new Date() } });
  return result;
}

export async function updateUserById(updates, id) {
  const db = await getDb();
  const result = await db.collection("users").deleteOne({ _id: userId });
  return result;
}

export async function deleteUserFromDb(id) {
  const db = await getDb();
  const result = await db.collection("users").deleteOne({ _id: id });
  return result;
}

export async function findUsersWithOptions(options = {}) {
  const db = await getDb();
  const collection = db.collection("users");
  const headers = getUserTableHeaders();

  return findWithTableOptions({
    collection,
    headers,
    ...options,
  });
}
