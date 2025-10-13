import Joi from 'joi';

export const emailSchema = Joi.string().email().required();

export const reviewSchema = Joi.object({
  productId: Joi.string().required(),
  productUrl: Joi.string().uri().required(),
  platform: Joi.string().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  title: Joi.string().max(200).optional(),
  text: Joi.string().min(10).max(5000).required(),
  images: Joi.array().items(Joi.string()).max(5).optional(),
  isAnonymous: Joi.boolean().optional(),
});

export const userUpdateSchema = Joi.object({
  email: Joi.string().email().optional(),
});

export default {
  emailSchema,
  reviewSchema,
  userUpdateSchema,
};
