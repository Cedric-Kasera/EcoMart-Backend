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

export async function updateCollectorListing(listingId, collectorId, updateData) {
    const listing = await Listing.findOneAndUpdate(
        { _id: listingId, collector: collectorId },
        { $set: updateData },
        { new: true }
    );
    return listing;
}

export async function deleteListing(listingId) {
    return Listing.findByIdAndDelete(listingId);
}
