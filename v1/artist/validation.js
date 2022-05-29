const { Joi } = require('express-validation');

exports.artistOnboardingPayload = {
  body: Joi.object({
    first_name: Joi.string().trim().required(),
    last_name: Joi.string().trim(),
    address: Joi.string().trim().required(),
    city: Joi.string().trim().required(),
    country: Joi.string().trim().required(),
    email: Joi.string().trim().required(),
    phone: Joi.string().required(),
    pin_code: Joi.string().trim().required(),
    wallet_id: Joi.string().trim().max(42).min(42)
      .required(),
    social_token_name: Joi.string().trim().required(),
    social_token_symbol: Joi.string().trim().required(),
    social_token_id: Joi.string().trim().required(),
  }),
};

exports.getAllArtistsPayload = { body: Joi.object({}) };

exports.updateArtistPayload = {
  body: Joi.object({
    id: Joi.string().trim().required(),
    first_name: Joi.string().trim(),
    last_name: Joi.string().trim(),
    address: Joi.string().trim(),
    city: Joi.string().trim(),
    country: Joi.string().trim(),
    email: Joi.string().trim(),
    phone: Joi.string(),
    pin_code: Joi.string().trim(),
    wallet_id: Joi.string().trim(),
    social_token_id: Joi.string().trim(),
    social_token_symbol: Joi.string().trim(),
  }),
};

exports.deactivateArtistPayload = { body: Joi.object({ id: Joi.string().trim().required() }) };

exports.getArtistByIdPayload = { body: Joi.object({ id: Joi.string().trim() }) };
