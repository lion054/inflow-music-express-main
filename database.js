const mongoose = require('mongoose');
const {
  mongo, env,
} = require('./config');

// Exit application on err
mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection error: ${err}`);
  // eslint-disable-next-line no-process-exit
  process.exit(-1);
});

// print mongoose logs in dev env
if (env === 'development') {
  mongoose.set('debug', false);
}

/**
 * Connect to mongo db
 *
 * @returns {object} Mongoose connection
 * @public
 */
// exports.connect = () => {
//   mongoose.connect(mongo.uri, {
//     keepAlive: 1,
//     useCreateIndex: true,
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   }, () => {});

//   return mongoose.connection;
// };

exports.connect = () => {
  mongoose.connect(mongo.uri, {
    keepAlive: 1,
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log('DB connections successful');

    return mongoose.connection;
  }).catch((error) => console.log(error));
};
