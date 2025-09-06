import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(6).max(20).required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("collector", "recycler").optional(),
  address: Joi.string().min(3).required()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const createListingSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().allow("", null),
  type: Joi.string().valid("plastic", "e-waste", "scrap-metal", "organic", "other").required(),
  weightKg: Joi.number().min(0).required(),
  pricePerKg: Joi.number().min(0).required(),
  images: Joi.array().items(Joi.string().uri()).optional()
});