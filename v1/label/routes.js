const express = require('express');
// const { validate } = require('express-validation');
const multer = require('multer');
const { authorize } = require('../../middlewares/auth');
const {  passportJWT } = require('../../middlewares/passport');

const {
  addLabel, removelabel, addartisttolabel, removeartistfromlabel, getalllabeldata, getlabelartists,
} = require('./controller');

const routes = express.Router();
const upload = multer();
const onBoardingImages = [{
  name: 'label', maxCount: 1,
}];
routes.use([passportJWT, authorize('admin')])
routes.get('/alldata', getalllabeldata);
routes.post('/addlabel', upload.fields(onBoardingImages), addLabel);
routes.post('/removelabel', removelabel);
routes.post('/getlabelartists', getlabelartists);
routes.post('/addartist', addartisttolabel);
routes.post('/removeartist', removeartistfromlabel);

module.exports = routes;
