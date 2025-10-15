// scripts\seed\users.js
import bcrypt from "bcrypt";

const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

const admin = {
    name: process.env.ADMIN_NAME,
    email: process.env.ADMIN_EMAIL,
    hashed_password: adminPassword,
    role: process.env.ADMIN_ROLE,
};

export default [admin];
