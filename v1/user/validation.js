/* eslint-disable sort-keys */
const { Joi } = require('express-validation');

const headers = {
  headers: Joi.object({
    authorization: Joi.string()
      .trim()
      .required()
      .label('Auth Token'),
  }).options({ allowUnknown: true }),
};

module.exports = {

  // POST /v1/user/wallet/connect
  connectWallet: {
    ...headers,
    body: Joi.object({ walletId: Joi.string().required() }),
  },

  // POST /v1/user/wallet/disconnect
  disconnectWallet: {
    ...headers,
    body: Joi.object({}),
  },

  // POST /v1/user/get_wallet
  getWalletId: {
    ...headers,
    body: Joi.object({ firebaseUserId: Joi.string().required() }),
  },

  // POST /v1/user/login
  loginUser: {
    // ...headers,
    body: Joi.object({
      phone: Joi.string().required(),
      // refreshToken: Joi.string().required(),
    }),
  },

  // POST /v1/user/register
  registerUser: {
    body: Joi.object({
      // firebase_user_id: Joi.string().required(),
      name: Joi.string().required(),
      phone: Joi.string().optional(),
      email: Joi.string().required(),
      password: Joi.string().required(),
      // refresh_token: Joi.string().required(),
    }),
  },

  // POST /v1/user/update_wallet
  updateWalletId: {
    ...headers,
    body: Joi.object({
      firebaseUserId: Joi.string().required(),
      walletId: Joi.string().required(),
    }),
  },

  // GET /v1/user
  users: { ...headers },

  // GET /v1/user/wallet
  wallet: {
    ...headers,
    query: Joi.object({}),
  },

  // GET /v1/user/profile/get
  getProfilePayload: { body: Joi.object({ uid: Joi.string().required() }) },

  // PATCH /v1/user/profile/update
  updateProfilePayload: {
    body: Joi.object({
      uid: Joi.string().required(),
      address: Joi.string().trim(),
      city: Joi.string().trim(),
      country: Joi.string().trim(),
      currency: Joi.string().trim(),
      first_name: Joi.string().trim(),
      last_name: Joi.string().trim(),
      name: Joi.string().trim(),
      profile_image: Joi.string().trim(),
    }),
  },

  // DELETE /v1/user/profile/delete
  deleteProfilePayload: {
    ...headers,
    body: Joi.object({}),
  },

};
