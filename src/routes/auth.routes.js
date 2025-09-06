import express from "express";
import { register, login, me } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// GET /api/auth/me - requires valid token
router.get("/me", authMiddleware, me);

export default router;