// scripts/seed/users.js
import bcrypt from "bcrypt";

const users = [
  {
    username: process.env.ADMIN_NAME || "Admin",
    email: process.env.ADMIN_EMAIL || "admin@example.com",
    password: process.env.ADMIN_PASSWORD || "Admin@123",
    role: "Admin",
  },
  { username: "Guna", email: "guna@example.com", password: "Guna@123", role: "Manager" },
  { username: "Nataraj", email: "nataraj@example.com", password: "Nataraj@123", role: "Manager" },
  { username: "VJ", email: "vj@example.com", password: "VJ@123", role: "Manager" },
  { username: "Seeni", email: "seeni@example.com", password: "Seeni@123", role: "Manager" },
  { username: "Sara", email: "sara@example.com", password: "Sara@123", role: "Manager" },
  { username: "Ramki", email: "ramki@example.com", password: "Ramki@123", role: "Manager" },
];

// Hash all passwords safely
const hashedUsers = await Promise.all(
  users.map(async (u) => ({
    username: u.username,
    email: u.email,
    hashed_password: await bcrypt.hash(u.password, 10),
    role: u.role,
    lastLogin: null,
    lastAccess: null,
    lastPasswordReset: null,
    createdAt: null,
    createdBy: null,
    updatedAt: null,
    updatedBy: null,
    seededAt: new Date(),
    isActive: true,
  }))
);

export default hashedUsers;
