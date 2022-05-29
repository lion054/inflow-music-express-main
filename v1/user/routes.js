const express = require('express');
const { validate } = require('express-validation');
const multer = require('multer');
const controller = require('./controller');
const {
  users,
  registerUser,
  connectWallet,
  disconnectWallet,
  wallet,
  loginUser,
  deleteProfilePayload,
} = require('./validation');
const { authorize } = require('../../middlewares/auth');
const { passportSignIn, passportJWT } = require('../../middlewares/passport');
const routes = express.Router();

const upload = multer();
const onBoardingImages = [{
  name: 'profile', maxCount: 1,
}, {
  name: 'banner', maxCount: 1,
}];

routes.route('/register').post(validate(registerUser, {}, {}), controller.register);

// routes.route('/login').post(validate(loginUser, {}, {}), passportSignIn, controller.login);
routes.route('/login').post(passportSignIn, controller.login);

routes.route('/refreshtoken').post(controller.refreshToken);

routes.route('/verifyemail').post(controller.verifyEmail);

routes.route('/resetpassword').post(controller.resetPassword);

routes.route('/changepassword').post(controller.changePassword);

routes.use(passportJWT);

routes.route('/profile/get').post(controller.getProfile);
routes.route('/profile/update').patch(upload.fields(onBoardingImages), controller.updateProfile);
// routes.route('/').get(validate(users), authorize(), controller.users);
routes.route('/').get(validate(users), controller.users);
routes.route('/buytoken').post(controller.buytoken);
routes.route('/gettokensbought').post(controller.getTokensBought);
routes.route('/profile/delete').delete(validate(deleteProfilePayload), controller.deleteProfile);
routes.route('/wallet').get(validate(wallet), controller.getWallet);
routes.route('/wallet/connect').post(validate(connectWallet), controller.connectWallet);
routes.route('/wallet/disconnect').post(validate(disconnectWallet), controller.disconnectWallet);
module.exports = routes;
