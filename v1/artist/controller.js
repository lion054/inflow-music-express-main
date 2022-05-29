/* eslint-disable camelcase */
const httpStatus = require('http-status');
const sharp = require('sharp');
const Artist = require('./model');
const User = require('../user/model');
const fs = require('fs');

exports.artistOnboarding = async (req, res, next) => {
  
  try {
    const {
      social_token_id, wallet_id, social_token_name, social_token_symbol, password
    } = req.body;
    console.log("password:", password)
    // const existingArtist = await Artist.findOne({ $or: [{ social_token_id }, { wallet_id }] });

    // let existingArtist = await Artist.findOne({ social_token_id });

    // if (existingArtist) {
    //   return res.status(httpStatus.BAD_REQUEST).json({
    //     code: httpStatus.BAD_REQUEST,
    //     message: 'Existing token',
    //   });
    // }
    
    // existingArtist = await Artist.findOne({ wallet_id });

    // if (existingArtist) {
    //   return res.status(httpStatus.BAD_REQUEST).json({
    //     code: httpStatus.BAD_REQUEST,
    //     message: 'Existing wallet',
    //   });
    // }

    
    // existingArtist = await Artist.findOne({ social_token_name });

    // if (existingArtist) {
    //   return res.status(httpStatus.BAD_REQUEST).json({
    //     code: httpStatus.BAD_REQUEST,
    //     message: 'Existing social token name',
    //   });
    // }

    // existingArtist = await Artist.findOne({ social_token_symbol });

    // if (existingArtist) {
    //   return res.status(httpStatus.BAD_REQUEST).json({
    //     code: httpStatus.BAD_REQUEST,
    //     message: 'Existing social token symbol',
    //   });
    // }

    const profilePic = req.files.profile[0];
    const bannerPic = req.files.banner[0];
    const profilePicName = `${req.body.social_token_id}_profilePic.jpeg`;
    const bannerPicName = `${req.body.social_token_id}_bannerPic.jpeg`;

    
    await sharp(profilePic.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`./uploads/${profilePicName}`, (err, info) => console.log(err, info));

    await sharp(bannerPic.buffer)
      .resize(1266, 530)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`./uploads/${bannerPicName}`, (err, info) => console.log(err, info));

    req.body.profile_image = profilePicName;
    req.body.banner_image = bannerPicName;
    const newArtist = new Artist(req.body);

    await newArtist.save();
    console.log('new Artist Saved')

    const user = await User.findOne({ email: req.body.email });

    if (user) {
      await User.findOneAndUpdate({ email: req.body.email }, {
        social_token_id,
        wallet_id,
        social_token_name,
        social_token_symbol,
        type: 'artist',
        profile_image: req.body.profile_image,
        banner_image: req.body.banner_image,
      });
    } else {
      const newUser = new User(req.body);

      await newUser.save();
    }

    return res.status(httpStatus.CREATED).json({
      code: httpStatus.CREATED,
      message: 'Artist onboarded Successfully',
      artist: newArtist,
    });

    // return res.status(httpStatus.CREATED).json({
    //   code: httpStatus.CREATED,
    //   message: 'HIII',
    // });
  } catch (error) {
    console.log(error);

    return next(error);
  }
};

exports.getAllArtists = async (req, res, next) => {
  try {
    const allArtists = await Artist.find({ status: 'active' });

    res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      message: 'All Artists',
      artists: allArtists,
    });
  
  } catch (error) {
    return next(error);
  }
};

exports.getArtistById = async (req, res, next) => {
  try {
    const artist = await Artist.findById(req.body.id);

    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      artist,
    });
  } catch (error) {
    return next(error);
  }
};

exports.updateArtist = async (req, res, next) => {
  try {
    const {
      id,
      first_name,
      last_name,
      address,
      city,
      country,
      email,
      phone,
      pin_code,
      wallet_id,
      social_token_id,
      social_token_symbol,
    } = req.body;
    const artist = await Artist.findById(id);

    if (req.files.profile) {
      const profilePic = req.files.profile[0];
      const profilePicName = `${artist.wallet_id}_profilePic.jpeg`;

      await sharp(profilePic.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`${__dirname}/../../../images/${profilePicName}`);
      req.body.profile_image = profilePicName;
    }

    if (req.files.banner) {
      const bannerPic = req.files.banner[0];
      const bannerPicName = `${artist.wallet_id}_bannerPic.jpeg`;

      await sharp(bannerPic.buffer)
        .resize(1266, 530)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`${__dirname}/../../../images/${bannerPicName}`);
      req.body.banner_image = bannerPicName;
    }
    const dataToUpdate = {
      first_name,
      last_name,
      address,
      city,
      country,
      email,
      phone,
      pin_code,
      wallet_id,
      social_token_id,
      social_token_symbol,
      profile_image: req.body.profile_image,
      banner_image: req.body.banner_image,
    };
    const updatedArtist = await Artist.findByIdAndUpdate(id, dataToUpdate, { new: true });

    await User.findOneAndUpdate({ email }, dataToUpdate, { new: true });

    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      message: 'Artist Updated',
      artist: updatedArtist,
    });
  } catch (error) {
    return next(error);
  }
};

exports.deactivateArtist = async (req, res, next) => {
  try {
    const { id } = req.body;
    const artist = await Artist.findByIdAndUpdate(id, { status: 'deleted' }, { new: true });

    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      message: 'Artist Deactivated',
      artist,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getLabels = async (req, res, next) => {
  try {
    const labels = await Artist.find().distinct('label');

    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      labels,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getLabelArtists = async (req, res, next) => {
  try {
    const { label } = req.body;
    const labelArtists = await Artist.find({ label });

    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      labelArtists,
    });
  } catch (error) {
    return next(error);
  }
};

exports.isArtist = async (req, res, next) => {
  try {
    const { email } = req.body;
    const artist = await Artist.findOne({ email });

    let isArtist = false;

    if (artist) {
      isArtist = true;
    } else {
      isArtist = false;
    }

    if (isArtist) {
      return res.status(httpStatus.OK).json({
        code: httpStatus.OK,
        isArtist,
        artist,
      });
    }

    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      isArtist,
    });
  } catch (error) {
    return next(error);
  }
};

exports.tokentx = async (req, res, next) => {
  try {
    const { mint_price_history, social_token_id } = req.body;
    const artist = await Artist.findOne({ social_token_id });

    artist.mint_price_history.push(mint_price_history);

    await artist.save();

    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      message: 'mint price updated successfully',
    });    
  } catch (error) {
    return next(error)
  }
}

exports.getTxHistory = async(req, res, next) => {

  try {
    const { social_token_id } = req.body;
    const artist = await Artist.findOne({ social_token_id });
    const priceHistory = artist.mint_price_history;

    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      priceHistory
      });
    
  } catch (error) {
    return next(error)
  }
}

exports.updateMintGateUrls = async(req, res, next) => {
  console.log('REQ.BODY' ,req.body)
  try {
    const { social_token_id } = req.body.user;
    const  mintGateUrl  = req.body.url;
    const artist = await Artist.findOne({ social_token_id });  
    
    console.log(social_token_id, mintGateUrl, artist);
    artist.mintgated_urls.push(mintGateUrl);
    await artist.save();

    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      mintGateUrl
      });
  } catch (error) {
    return next(error)
  }
}

exports.getMintGateUrlsById = async(req, res, next) => {
  try {
    const artist = await Artist.findById(req.body.id);
    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      mintGatedUrls : artist.mintgated_urls
    });

  } catch (error) {
    return next(error);
  }
}



