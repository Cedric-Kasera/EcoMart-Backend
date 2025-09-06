import mongoose from "mongoose";

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, trim: true },

  type: {
    type: String,
    enum: ["plastic", "glass", "e-waste", "scrap-metal", "organic", "other"],
    required: true
  },

  weightKg: { type: Number, required: true, min: 0 },
  pricePerKg: { type: Number, required: true, min: 0 },

  images: [{ type: String }], // store URLs only

  collector: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  status: {
    type: String,
    enum: ["available", "reserved", "sold"],
    default: "available"
  },

  createdAt: { type: Date, default: Date.now }
});

// Indexes
listingSchema.index({ title: "text", description: "text" }); // Text index for search

export default mongoose.model("Listing", listingSchema);