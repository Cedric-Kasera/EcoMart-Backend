import { createListingSchema } from "../utils/joi.js";
import * as listingService from "../services/listing.service.js";
import cloudinary from "../config/cloudinary.js";

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

export const getMyListings = async (req, res) => {
    try {
        if (req.user.role !== "collector") {
            return res.status(403).json({ error: "Only collectors can view their listings" });
        }

        const listings = await listingService.getCollectorListings(req.user._id);

        return res.status(200).json({ listings });
    } catch (err) {
        console.error("Get my listings error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};

export const updateMyListing = async (req, res) => {
    try {
        if (req.user.role !== "collector") {
            return res.status(403).json({ error: "Only collectors can update listings" });
        }

        // Validate input (partial update allowed)
        const { error, value } = createListingSchema.validate(req.body, { allowUnknown: true, presence: "optional" });

        if (error) return res.status(400).json({ error: error.details[0].message });

        // Only allow updating own listing
        const listingId = req.params.id;
        const updated = await listingService.updateCollectorListing(listingId, req.user._id, value);

        if (!updated) {
            return res.status(404).json({ error: "Listing not found or not yours" });
        }

        return res.status(200).json({ listing: updated });
    } catch (err) {
        console.error("Update listing error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};

export const deleteMyListing = async (req, res) => {
    try {
        if (req.user.role !== "collector") {
            return res.status(403).json({ error: "Only collectors can delete listings" });
        }

        const listingId = req.params.id;
        const listing = await listingService.getListingById(listingId);

        if (!listing || String(listing.collector) !== String(req.user._id)) {
            return res.status(404).json({ error: "Listing not found or not yours" });
        }

        // Delete images from Cloudinary
        for (const url of listing.images) {
            // Extract public_id from URL
            const parts = url.split("/");
            const publicIdWithExtension = parts.slice(-2).join("/").split(".")[0];
            try {
                await cloudinary.uploader.destroy(publicIdWithExtension);
            } catch (err) {
                console.warn("Cloudinary image delete failed:", url, err.message);
            }
        }

        await listingService.deleteListing(listingId);

        return res.status(200).json({ message: "Listing deleted" });
    } catch (err) {
        console.error("Delete listing error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};
