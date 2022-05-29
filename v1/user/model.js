const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// const jwt = require('jwt-simple');
// const { jwtSecret, jwtExpiration, jwtRefreshExpiration } = require('../../config');

/**
 * User Schema
 * @private
 */

const userSchema = new mongoose.Schema({
  account_type: {
    default: 'user',
    enum: ['user', 'admin'],
    type: String,
  },
  tokensbought: { type: [String] },
  address: { type: String },
  city: { type: String },
  country: { type: String },
  created_at: {
    default: Date.now,
    type: Number,
  },
  currency: { type: String },
  email: { type: String },
  email_verified: {
    default: false,
    type: Boolean,
  },
  first_name: { type: String },
  last_name: { type: String },
  name: { type: String },
  password: { type: String },
  phone: { type: String },
  pin_code: { type: String },
  profile_image: {
    type: String, default: '',
  },
  banner_image: {
    type: String, default: '',
  },
  refresh_token: { type: String },
  refresh_token_expiryDate: { type: Date},
  status: {
    default: 'active',
    enum: ['active', 'blocked', 'deleted', 'pending'],
    type: String,
  },
  updated_at: {
    default: Date.now,
    type: Number,
  },
  wallet_id: {
    default: null,
    type: String,
  },
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
userSchema.pre('save', async function save(next) {
  try {
    // eslint-disable-next-line no-invalid-this
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10)

    // eslint-disable-next-line no-invalid-this
    this.password = await bcrypt.hash(this.password, salt);

    return next();
  } catch (error) {
    return next(error);
  }
});

/**
 * Methods
 */

userSchema.methods.isValidPassword = async function(password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch(error) {
    throw new Error(error);
  }
}

/**
 * Statics
 */
userSchema.statics = {
  isRefreshTokenExpired: (user) => {
    return user.refresh_token_expiryDate.getTime() < new Date().getTime();
  }
};

/**
 * @typedef User
 */

const model = mongoose.model('User', userSchema);

model.createIndexes({
  first_name: 1,
  last_name: 1,
});

module.exports = model;
