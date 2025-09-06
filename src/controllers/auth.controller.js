import { registerSchema, loginSchema } from "../utils/joi.js";
import * as userService from "../services/auth.service.js";
import generateToken from "../utils/jwt.js";

export const register = async (req, res) => {
    try {
        const { error, value } = registerSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { name, email, phone, password, role, address } = value;

        // extra safety: disallow client-side admin registration
        if (role === "admin") {
            return res.status(403).json({ error: "Cannot register as admin" });
        }

        const user = await userService.createUser({ name, email, phone, password, role, address });

        const token = generateToken(user);

        // remove sensitive fields before returning
        const userObj = user.toObject();
        delete userObj.passwordHash;

        return res.status(201).json({ token, user: userObj });
    } catch (err) {
        if (err.code === "DUPLICATE") {
            return res.status(409).json({ error: err.message });
        }
        console.error("Register error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};

export const login = async (req, res) => {
    try {
        const { error, value } = loginSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { email, password } = value;

        const user = await userService.authenticateUser(email, password);
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = generateToken(user);

        const userObj = user.toObject();
        delete userObj.passwordHash;

        return res.json({ token, user: userObj });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};
