import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Cloudinary storage config
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "eco-trade/listings", // Cloudinary folder
        allowed_formats: ["jpg", "jpeg", "png"]
    }
});

// Multer upload middleware
export const upload = multer({
    storage,
    limits: { files: 3 } // max 3 images
});
