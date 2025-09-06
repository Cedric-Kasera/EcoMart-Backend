import dotenv from "dotenv";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import connectDB from "../config/connectDB.js";
import User from "../models/User.js";

dotenv.config();

const ADMIN_NAME = process.env.SEED_ADMIN_NAME || "Admin";
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@ecomart.local";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "admin123";
const FORCE_OVERWRITE = process.env.SEED_ADMIN_FORCE === "true";

async function seedAdmin() {
  try {
    await connectDB();

    let existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing && !FORCE_OVERWRITE) {
      console.log(`Admin user already exists: ${ADMIN_EMAIL}`);
      await mongoose.disconnect();
      process.exit(0);
    }

    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const adminData = {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashed,
      role: "admin",
      verified: true
    };

    if (existing && FORCE_OVERWRITE) {
      existing.name = adminData.name;
      existing.password = adminData.password;
      existing.role = adminData.role;
      existing.verified = adminData.verified;
      await existing.save();
      console.log(`Admin user updated (overwritten): ${ADMIN_EMAIL}`);
    } else {
      await User.create(adminData);
      console.log(`Admin user created: ${ADMIN_EMAIL}`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seeding admin failed:", err);
    try { await mongoose.disconnect(); } catch (_) {}
    process.exit(1);
  }
}

seedAdmin();
