const express = require('express');
const userRoutes = require('./user/routes');
const labelRoutes = require('./label/routes');
const adminArtistRoutes = require('./artist/routes');

const router = express.Router();

/**
 * GET v1/status
 */
router.get('/status', (req, res) => res.send('OK'));
/**
 * GET v1/user
 */
router.use('/user', userRoutes);
router.use('/artist', adminArtistRoutes);
router.use('/label', labelRoutes);

module.exports = router;
