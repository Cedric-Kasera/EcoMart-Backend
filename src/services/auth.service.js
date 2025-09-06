import User from "../models/User.js";
import bcrypt from "bcrypt";

/**
 * Create a new user
 * @param {Object} payload - { name, email, phone, password, role, address }
 * @returns {Promise<User>}
 * @throws {Error} with code 'DUPLICATE' when email/phone already exists
 */

export async function registerUser({ name, email, phone, password, role = "collector", address }) {

    // Step 1: Check duplicates (email or phone)
    const existing = await User.findOne({ $or: [{ email }, { phone }] }).lean();
    if (existing) {
        const dupField = existing.email === email ? "email" : "phone";
        const err = new Error(`${dupField} already in use`);
        err.code = "DUPLICATE";
        throw err;
    }

    // Step 2: Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Step 3: Create user
    const user = new User({
        name,
        email,
        phone,
        passwordHash,
        role,
        address,
        verified: false
    });

    // Step 4: Save user to DB
    await user.save();
    return user;
}
