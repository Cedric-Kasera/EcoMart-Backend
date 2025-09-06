import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(6).max(20).required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("collector", "recycler").optional(),
  address: Joi.string().min(3).required()
});