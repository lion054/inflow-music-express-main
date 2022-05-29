const express = require('express');
const { validate } = require('express-validation');
const multer = require('multer');
const { authorize } = require('../../middlewares/auth');
const { passportJWT } = require('../../middlewares/passport');

const {
  artistOnboarding, 
  getAllArtists, 
  updateArtist, 
  getArtistById, 
  getLabels, 
  getLabelArtists, 
  isArtist, 
  deactivateArtist, 
  getAllArtistImages, 
  tokentx, 
  getTxHistory,
  updateMintGateUrls,
  getMintGateUrlsById
} = require('./controller');
const {
  artistOnboardingPayload, getAllArtistsPayload, getArtistByIdPayload, deactivateArtistPayload,
} = require('./validation');

const routes = express.Router();
const upload = multer();
const onBoardingImages = [{
  name: 'profile', maxCount: 1,
}, {
  name: 'banner', maxCount: 1,
}];

routes.get('/getall', getAllArtists);
routes.get('/labels', getLabels);
routes.post('/getmintgateurlsbyid', getMintGateUrlsById)
routes.post('/getbyid', getArtistById);
routes.use(passportJWT)
routes.post('/onboarding', authorize('admin'), upload.fields(onBoardingImages), artistOnboarding);
// routes.get('/getallImages', getAllArtistImages);
// routes.post('/getbyid', validate(getArtistByIdPayload), getArtistById);
routes.post('/tokentx', tokentx)
routes.post('/gettxhistorybyartist', getTxHistory);
routes.post('/isArtist', isArtist);
routes.post('/updatemintgateurls', updateMintGateUrls)
routes.patch('/update', authorize('admin'), upload.fields(onBoardingImages), updateArtist);
routes.patch('/deactivate', authorize('admin'), validate(deactivateArtistPayload), deactivateArtist);

routes.post('/artistsbylabel', getLabelArtists);

module.exports = routes;
