const httpStatus = require('http-status');
const sharp = require('sharp');

const Label = require('./model');
const Artist = require('../artist/model');

exports.getalllabeldata = async (req, res, next) => {
  try {
    const labels = await Label.find({});

    return res.status(httpStatus.CREATED).json({
      code: httpStatus.CREATED,
      message: 'Labels retrieved',
      labels,
    });
  } catch (err) {
    return next(err);
  }
};

exports.addLabel = async (req, res, next) => {
  try {
    const existinglabel = await Label.findOne({ name: req.body.name });

    if (existinglabel) {
      return res.status(httpStatus.BAD_REQUEST).json({
        code: httpStatus.BAD_REQUEST,
        message: 'Existing label name',
      });
    }
    const labelpic = req.files.label[0];
    const labelpicname = `${req.body.name}_labelpic.jpeg`;

    await sharp(labelpic.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`${__dirname}/../../../images/${labelpicname}`);

    req.body.image = labelpicname;
    const label = new Label(req.body);

    await label.save();

    return res.status(httpStatus.CREATED).json({
      code: httpStatus.CREATED,
      message: 'Label Created',
      label,
    });
  } catch (err) {
    return next(err);
  }
};

exports.removelabel = async (req, res, next) => {
  try {
    const label = await Label.findById(req.body.labelid);

    if (!label) {
      return res.status(httpStatus.BAD_REQUEST).json({
        code: httpStatus.BAD_REQUEST,
        message: 'Label does not exist',
      });
    }

    await label.remove();

    await Artist.updateMany({ label: label._id }, { label: '' });

    return res.status(httpStatus.CREATED).json({
      code: httpStatus.CREATED,
      message: 'Label removed',
    });
  } catch (err) {
    return next(err);
  }
};

exports.addartisttolabel = async (req, res, next) => {
  try {
    const label = await Label.findById(req.body.labelid);
    const artist = await Artist.findById(req.body.artistid);

    if (!label || !artist) {
      return res.status(httpStatus.BAD_REQUEST).json({
        code: httpStatus.BAD_REQUEST,
        message: 'Label or artist does not exist',
      });
    }

    await label.artists.push(artist._id);
    await label.save();

    artist.label = label._id;
    await artist.save();

    return res.status(httpStatus.CREATED).json({
      code: httpStatus.CREATED,
      message: 'Label artist added',
      label,
    });
  } catch (err) {
    return next(err);
  }
};

exports.removeartistfromlabel = async (req, res, next) => {
  try {
    const label = await Label.findById(req.body.labelid);
    const artist = await Artist.findById(req.body.artistid);

    if (!label || !artist) {
      return res.status(httpStatus.BAD_REQUEST).json({
        code: httpStatus.BAD_REQUEST,
        message: 'Label or artist does not exist',
      });
    }

    await label.artists.pull(artist._id);

    await label.save();

    artist.label = '';
    await artist.save();

    return res.status(httpStatus.CREATED).json({
      code: httpStatus.CREATED,
      message: 'Label artist removed',
      label,
    });
  } catch (err) {
    return next(err);
  }
};

exports.getlabelartists = async (req, res, next) => {
  try {
    const label = await Label.findById(req.body.labelid);

    if (!label) {
      return res.status(httpStatus.BAD_REQUEST).json({
        code: httpStatus.BAD_REQUEST,
        message: 'Label does not exist',
      });
    }

    const artists = [];

    await Promise.all(label.artists.map(async (artistid) => {
      const artist = await Artist.findById(artistid);

      artists.push(artist);

      return artist;
    }));

    const remainingartists = await Artist.find({ label: '' });

    return res.status(httpStatus.CREATED).json({
      code: httpStatus.CREATED,
      message: 'Label artists retrieved',
      label,
      artists,
      remainingartists,
    });
  } catch (err) {
    return next(err);
  }
};
