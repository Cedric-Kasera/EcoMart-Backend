import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { createListing } from "../controllers/listing.controller.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// POST /api/listings - collectors only
router.post("/create", authMiddleware, upload.array("images", 3), createListing);

export default router;