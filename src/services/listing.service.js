import Listing from "../models/Listings.js";

export async function createListing({ collectorId, title, description, type, weightKg, pricePerKg, images }) {
    const listing = new Listing({
        title,
        description,
        type,
        weightKg,
        pricePerKg,
        images,
        collector: collectorId
    });

    await listing.save();
    return listing;
}

export async function getCollectorListings(collectorId) {
    const listings = await Listing.find({ collector: collectorId })
        .sort({ createdAt: -1 });
    return listings;
}
