import { createListingSchema } from "../utils/joi.js";
import * as listingService from "../services/listing.service.js";

export const createListing = async (req, res) => {
    try {
        // Validate non-image fields
        const { error, value } = createListingSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        // Only collectors should create listings
        if (req.user.role !== "collector") {
            return res.status(403).json({ error: "Only collectors can create listings" });
        }

        // Require verified collectors
        if (!req.user.verified) {
            return res.status(403).json({ error: "Collector account not verified by admin" });
        }

        // Collect Cloudinary URLs
        const imageUrls = (req.files || []).map(file => file.path);

        const listing = await listingService.createListing({
            collectorId: req.user._id,
            ...value,
            images: imageUrls
        });

        return res.status(201).json({ listing });
    } catch (err) {
        console.error("Create listing error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};