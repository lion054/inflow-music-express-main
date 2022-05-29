const httpStatus = require('http-status');
// const uuidv4 = require('uuid');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const User = require('./model');
const Artist = require('../artist/model');
const { emailToResetPassword } = require('../../utils/nodeMailer')
const { keysToCamel } = require('../../utils/snake');
const { emailToVerify } = require('../../utils/nodeMailer')
const JWT = require('jsonwebtoken')
const { jwtSecret, jwtExpiration, jwtRefreshExpiration } = require('../../config')
exports.users = async (req, res, next) => {
  try {
    const {
      user,
      query: {
        companyId, userId,
      },
    } = req;

    let query = {};

    if (companyId) {
      query = { company_id: companyId };
    } else if (userId) {
      query = { _id: userId };
    } else {
      query = {
        _id: { $nin: user._id },
        role: { $ne: 'admin' },
      };
    }

    const options = {
      _id: 1,
      company_id: 1,
      email: 1,
      first_name: 1,
      is_verified: 1,
      last_name: 1,
      phone: 1,
      photo: 1,
      role: 1,
      status: 1,
    };

    let users = await User.find(query, options);

    if (users.length > 0 && userId) {
      const [singleUser] = users;

      users = keysToCamel(singleUser.toObject());
    } else {
      users = users.map((singleUser) => keysToCamel(singleUser.toObject()));
    }

    return res.status(httpStatus.OK).json(users);
  } catch (error) {
    return next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const {
      // eslint-disable-next-line camelcase
      password, phone, email, name
    } = req.body;

    let usercreated = false;

    let user;

    let
      type;

    if (phone) {
      const existingUser = await User.findOne({ $or: [{ firebase_user_id }, { phone }] });

      if (existingUser) {
        return res.json({
          message: 'User is already exist with that "firebaseUserId" Or "phone"',
          status: false,
        });
      }

      user = await new User(req.body).save();

      usercreated = true;
      type = 'phone';
    } else if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.json({
          message: 'There is already a user with this email address.',
          status: false,
        });
      }

      user = await new User(req.body).save();
      emailToVerify(user)
      usercreated = true;
      type = 'email';
    }
    if (usercreated) {
      // if (type === 'email') {
      //   await User.findOneAndUpdate({ email });
      // } else if (type === 'phone') {
      //   await User.findOneAndUpdate({ phone }, { firebase_user_id });
      // }

      return res.status(httpStatus.OK).json({
        code: httpStatus.OK,
        data: { user },
        message: 'User registered successfully',
        status: true,
      });
    }

    return res.status(httpStatus.BAD_REQUEST).json({
      code: httpStatus.BAD_REQUEST,
      message: 'No phone or email to register user',
    });
  } catch (error) {
    return next(error);
  }
};

exports.verifyEmail = async (req, res, next) => { 
  try {
    const { token } = req.body
    
    const verifyOptions = {
      expiresIn:  "12h"
    };
    JWT.verify(token, jwtSecret, verifyOptions, async function(err, decoded) {

      if (err) return res.status(404).json(`Token expired`);
      const user = await User.findById(decoded.sub.id)
      if (user.isVerified) {
        return res.status(202).json({
          message: "Try verifying your email again!"
        });
      }
      await user.update({ email_verified: true })

      let access_token = JWT.sign({ id: user._id, account_type: user.account_type }, jwtSecret, {
        expiresIn: jwtExpiration,
      });
      // save refresh_token and expiryDate
      let expiredAt = new Date();
      expiredAt.setSeconds(
        expiredAt.getSeconds() + jwtRefreshExpiration
      );
      const refresh_token = uuidv4() + user._id
      const refresh_token_expiryDate = expiredAt.getTime()
    
      if ( user.account_type === 'artist') { 
        await Artist.updateOne({ _id: user._id }, { $set: {
          refresh_token,
          refresh_token_expiryDate,
        } });
    
      } else {
        await User.updateOne({ _id: user._id }, { $set: {
          refresh_token,
          refresh_token_expiryDate,
        } });
    
      }

      
      return res.status(200).json({
        message: "Your email has been verified!",
        access_token,
        refresh_token, 
        userData: user
      });
    });    
  } catch (e) {
    return res.status(404).json(`Email not found`);
  }
}

exports.resetPassword = async (req, res, next) => {
  try {
    const {  email } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        await emailToResetPassword(existingUser)
        return res.json({
          message: 'Check your email for changing password',
          status: true,
        });
      } 

    return res.status(httpStatus.BAD_REQUEST).json({
      code: httpStatus.BAD_REQUEST,
      message: 'No Email found!',
    });
  } catch (error) {
    return next(error);
  }
};

exports.changePassword = async (req, res, next) => { 
  try {
    const { token, newPassword } = req.body
    console.log("55555", token, newPassword)
    const verifyOptions = {
      expiresIn:  "12h"
    };
    JWT.verify(token, jwtSecret, verifyOptions, async function(err, decoded) {
      console.log("dddd", decoded)
      if (err) return res.status(404).json(`Token expired`);
      const user = await User.findById(decoded.sub.id)
      user.password = newPassword
      await user.save()

      return res.status(200).json({
        message: "Password has been changed!"
      });
    });    
  } catch (e) {
    return res.status(404).json(`Email not found`);
  }
}

exports.login = async (req, res, next) => {
  try {
    let { email, account_type } = req.body;

    // phone = phone.split(' ').join('');
    let user
    if ( account_type === 'artist') {
      user = await Artist.findOne({ email });
    } else {
      user = await User.findOne({ email });
    }

    if (!user) {
      return res.status(httpStatus.CONFLICT).json({
        code: httpStatus.CONFLICT,
        message: 'User not found with given email',
        status: false,
      });
    }
    console.log("aaa", user, account_type)
    let access_token = JWT.sign({ id: user._id, account_type: user.account_type }, jwtSecret, {
      expiresIn: jwtExpiration,
    });
    // save refresh_token and expiryDate
    let expiredAt = new Date();
    expiredAt.setSeconds(
      expiredAt.getSeconds() + jwtRefreshExpiration
    );
    const refresh_token = uuidv4() + user._id
    const refresh_token_expiryDate = expiredAt.getTime()
  
    if ( account_type === 'artist') { 
      await Artist.updateOne({ _id: user._id }, { $set: {
        refresh_token,
        refresh_token_expiryDate,
      } });
  
    } else {
      await User.updateOne({ _id: user._id }, { $set: {
        refresh_token,
        refresh_token_expiryDate,
      } });
  
    }

    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      userData: user,
      access_token,
      refresh_token,
      message: 'User loggedIn successfully',
      status: true,
    });
  } catch (error) {
    return next(error);
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken: requestToken, account_type } = req.body;

  if (requestToken == null) {
    return res.status(403).json({ message: "Refresh Token is required!" });
  }

  try {
    let user
    if ( account_type === "artist") {
      user = await Artist.findOne({ requestToken });
    } else {
      user = await User.findOne({ requestToken });
    }
    

    if (!user) {
      res.status(403).json({ message: "Refresh token is not in database!" });
      return;
    }
    if ( account_type === 'artist') {
      if (Artist.isRefreshTokenExpired(user)) {
        await Artist.updateOne({ _id: user._id }, { $set: {
          refresh_token: null,
          refresh_token_expiryDate: null,
        } });
  
        res.status(403).json({
          message: "Refresh token was expired. Please make a new signin request",
        });
        return;
      }
    } else {
      if (User.isRefreshTokenExpired(user)) {
        await User.updateOne({ _id: user._id }, { $set: {
          refresh_token: null,
          refresh_token_expiryDate: null,
        } });
  
        res.status(403).json({
          message: "Refresh token was expired. Please make a new signin request",
        });
        return;
      }
    }

    const newAccessToken = JWT.sign({ id: user._id, account_type: user.account_type }, jwtSecret, {
      expiresIn: jwtExpiration,
    });

    return res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};

exports.getWallet = async (req, res, next) => {
  try {
    const { user } = req;

    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      data: { walletId: user.wallet_id },
      message: 'Wallet details',
      status: true,
    });
  } catch (error) {
    return next(error);
  }
};

exports.connectWallet = async (req, res, next) => {
  try {
    const {
      user,
      body: { walletId },
    } = req;

    await User.updateOne({ _id: user._id }, { $set: { wallet_id: walletId } });

    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      message: 'Wallet connected successfully',
      status: true,
    });
  } catch (error) {
    return next(error);
  }
};

exports.disconnectWallet = async (req, res, next) => {
  try {
    const { user } = req;

    await User.updateOne({ _id: user._id }, { $set: { wallet_id: null } });

    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      message: 'Wallet disconnected successfully',
      status: true,
    });
  } catch (error) {
    return next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.body.uid);

    if (req.files.profile) {
      const profilepic = req.files.profile[0];
      const profilepicname = `${user._id}_profilepic.jpeg`;

      await sharp(profilepic.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`${__dirname}/../../../images/${profilepicname}`);
      req.body.profile_image = profilepicname;
    }

    if (req.files.banner) {
      const bannerpic = req.files.banner[0];
      const bannerpicname = `${user._id}_bannerpic.jpeg`;

      await sharp(bannerpic.buffer)
        .resize(1266, 530)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`${__dirname}/../../../images/${bannerpicname}`);
      req.body.banner_image = bannerpicname;
    }

    const updatedUser = await User.findByIdAndUpdate(req.body.uid, req.body, {
      new: true, runValidators: true,
    });

    await Artist.findOneAndUpdate({ email: updatedUser.email }, req.body);

    if (!updatedUser) {
      return res.status(httpStatus.NOT_FOUND).json({
        code: httpStatus.NOT_FOUND,
        message: 'No document found with the given user id',
      });
    }

    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      message: 'User updated Successfully',
      updatedUser,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    console.log("getProfile", req.body)
    const user = await User.findById(req.body.uid);

    if (!user) {
      return res.json({ message: 'No document found with the given user id' });
    }

    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      message: 'User Found',
      user,
    });
  } catch (error) {
    return next(error);
  }
};

exports.deleteProfile = async (req, res, next) => {
  try {
    if (req.user) {
      const user = await User.findByIdAndUpdate(req.user._id, { status: 'deleted' }, { new: true });

      if (!user) {
        return res.json({
          code: httpStatus.NOT_FOUND,
          message: 'No document found with the given user id',
        });
      }

      return res.status(httpStatus.OK).json({
        code: httpStatus.OK,
        message: 'User Status set to deleted',
        user,
      });
    }

    return res.status(httpStatus.UNAUTHORIZED).json({
      code: httpStatus.UNAUTHORIZED,
      message: 'User must be logged in',
    });
  } catch (error) {
    return next(error);
  }
};

exports.buytoken = async (req, res, next) => {

  try {
    const {
      // eslint-disable-next-line camelcase
      SocialTokenAddress, uid,
    } = req.body;

    const user = await User.findById(uid);

    user.tokensbought.push(socialTokenAddress);

    await user.save();

    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      message: 'Token added to bought list successfully',
    });
  } catch (error) {
    return next(error);
  }
};

exports.getTokensBought = async (req, res, next) => {
  try {
    const user = await User.findById(req.body.uid);

    const tokennames = await Promise.all(user.tokensbought.map(async (token) => {
      const artist = await Artist.findOne({ social_token_id: token });

      return artist.social_token_symbol;
    }));

    const result = tokenNames.filter(token => token !== undefined)
    console.log(result);

    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      message: 'User tokens bought',
      tokensBought: user.tokensbought,
      tokenNames: result,
    });
  } catch (error) {
    return next(error);
  }
};
