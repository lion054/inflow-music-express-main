// const httpStatus = require('http-status');
// const jwt = require('jwt-simple');
// const User = require('../api/v1/user/model');
// const { Error } = require('../utils/api-response');
// const { jwtSecret } = require('../config');

exports.authorize = role => async (req, res, next) => {
  //get user here
  const { user } = req.body
  if (user.account_type === role) {
    next();
  } else {
    return res.status(403).send({
      message: `Require ${role} Role!`
    });
  }
};
