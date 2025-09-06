import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { createListing, deleteMyListing, getMyListings, updateMyListing } from "../controllers/listing.controller.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// POST /api/listings/create - collector uploads new listing
router.post("/create", authMiddleware, upload.array("images", 3), createListing);

// GET /api/listings/my - collector views their listings
router.get("/my", authMiddleware, getMyListings);

// PATCH /api/listings/:id - collector updates their listing
router.patch("/update/:id", authMiddleware, updateMyListing);

// DELETE /api/listings/delete/:id - collector deletes their listing
router.delete("/delete/:id", authMiddleware, deleteMyListing);

export default router;