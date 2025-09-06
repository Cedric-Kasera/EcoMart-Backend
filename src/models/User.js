import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },

    role: {
        type: String,
        enum: ["collector", "recycler", "admin"],
        default: "collector"
    },

    address: { type: String, required: true },

    verified: { type: Boolean, default: false },

    createdAt: { type: Date, default: Date.now }
});


export default mongoose.model("User", userSchema);