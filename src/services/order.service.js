import mongoose from "mongoose";
import Order from "../models/Order.js";
import Listing from "../models/Listings.js";

export async function createOrder({ buyerId, listingId, quantityKg, contactPhone, pickup, notes }) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const listing = await Listing.findById(listingId).session(session);
        if (!listing) throw new Error("Listing not found");
        if (listing.status !== "available" && listing.status !== "reserved") throw new Error("Listing not available for order");
        if (quantityKg <= 0) throw new Error("Invalid quantity");
        if (quantityKg > listing.weightKg) throw new Error("Requested quantity exceeds available amount");

        const pricePerKg = listing.pricePerKg;
        const totalPrice = pricePerKg * quantityKg;

        const order = new Order({
            buyer: buyerId,
            listing: listing._id,
            collector: listing.collector,
            quantityKg,
            pricePerKg,
            totalPrice,
            pickup,
            contactPhone,
            notes
        });

        // Adjust listing available weight and status
        listing.weightKg = Number((listing.weightKg - quantityKg).toFixed(4));
        if (listing.weightKg <= 0) {
            listing.weightKg = 0;
            listing.status = "sold";
        } else {
            listing.status = "reserved";
        }

        await listing.save({ session });
        await order.save({ session });

        await session.commitTransaction();
        session.endSession();

        return await Order.findById(order._id).populate("listing buyer collector");
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
}

export async function getOrderById(orderId) {
    return Order.findById(orderId).populate("listing buyer collector");
}

export async function getOrdersByBuyer(buyerId) {
    return Order.find({ buyer: buyerId }).populate("listing collector").sort({ createdAt: -1 });
}

export async function getOrdersByCollector(collectorId) {
    return Order.find({ collector: collectorId }).populate("listing buyer").sort({ createdAt: -1 });
}

export async function updateOrderStatus(orderId, userId, role, newStatus) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const order = await Order.findById(orderId).session(session);
        if (!order) {
            await session.abortTransaction();
            session.endSession();
            return null;
        }

        // Authorization & allowed transitions
        if (role === "collector") {
            if (String(order.collector) !== String(userId)) {
                throw new Error("Not authorized");
            }
            if (!["accepted", "rejected", "completed"].includes(newStatus)) {
                throw new Error("Invalid status for collector");
            }
        } else if (role === "buyer") {
            if (String(order.buyer) !== String(userId)) {
                throw new Error("Not authorized");
            }
            if (newStatus !== "cancelled") {
                throw new Error("Invalid status for buyer");
            }
        } else {
            throw new Error("Not authorized");
        }

        // If rejecting or cancelling, add quantity back to listing
        if (["rejected", "cancelled"].includes(newStatus)) {
            const listing = await Listing.findById(order.listing).session(session);
            if (listing) {
                listing.weightKg = Number((listing.weightKg + order.quantityKg).toFixed(4));
                // If weight > 0 make listing available again
                if (listing.weightKg > 0) listing.status = "available";
                await listing.save({ session });
            }
        }

        order.status = newStatus;
        await order.save({ session });

        await session.commitTransaction();
        session.endSession();

        return await Order.findById(order._id).populate("listing buyer collector");
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
}