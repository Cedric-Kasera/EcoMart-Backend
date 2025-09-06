import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { createListing, getMyListings } from "../controllers/listing.controller.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// POST /api/listings - collector uploads new listing
router.post("/create", authMiddleware, upload.array("images", 3), createListing);

// GET /api/listings/my - collector views their listings
router.get("/my", authMiddleware, getMyListings);

export default router;