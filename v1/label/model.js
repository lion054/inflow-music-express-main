const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const jwt = require('jwt-simple');
// const { jwtSecret } = require('../../../config');

/**
 * User Schema
 * @private
 */

const labelSchema = new mongoose.Schema({
  name: {
    type: String, unique: true,
  },
  image: { type: String },
  artists: [String],
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
// artistSchema.pre('save', async function save(next) {
//   try {
//     // eslint-disable-next-line no-invalid-this
//     if (!this.isModified('password')) return next();

//     const rounds = 10;

//     // eslint-disable-next-line no-invalid-this
//     this.password = await bcrypt.hash(this.password, rounds);

//     return next();
//   } catch (error) {
//     return next(error);
//   }
// });

/**
 * Methods
 */
// artistSchema.method({
//   async passwordMatches(password) {
//     const result = await bcrypt.compare(password, this.password);

//     return result;
//   },

//   token(refreshToken) {
//     const payload = {
//       _id: this._id,
//       iat: Date.now(),
//       refreshToken,
//     };

//     return jwt.encode(payload, jwtSecret);
//   },
// });

/**
 * Statics
 */
// artistSchema.statics = {};

/**
 * @typedef Label
 */

const model = mongoose.model('Label', labelSchema);

// model.createIndexes({
//   first_name: 1,
//   last_name: 1,
// });

module.exports = model;
