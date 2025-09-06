import mongoose from "mongoose";

const pickupSchema = new mongoose.Schema({
    address: { type: String, trim: true },
    scheduledAt: { type: Date },
    notes: { type: String, trim: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    collector: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    quantityKg: { type: Number, required: true, min: 0.01 },
    pricePerKg: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },

    status: {
        type: String,
        enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
        default: "pending"
    },

    pickup: pickupSchema,

    contactPhone: { type: String, trim: true },
    notes: { type: String, trim: true },

}, {
    timestamps: true
});

// Useful indexes
orderSchema.index({ buyer: 1 });
orderSchema.index({ collector: 1 });
orderSchema.index({ listing: 1 });

export default mongoose.model("Order", orderSchema);