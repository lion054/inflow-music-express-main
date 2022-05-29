require('dotenv').config();

/** Default config will remain same in all environments and can be over-ridded */
const config = {
  allowedMedia: ['jpg', 'jpeg', 'png', 'gif', 'avi', 'mov', '3gp', 'mp4', 'mkv', 'mpeg', 'mpg', 'mp3', 'pdf'],
  baseUrl: 'https://pacific-harbor-84820.herokuapp.com/',
  ddosConfig: {
    burst: 100,
    limit: 100,
  },
  env: process.env.NODE_ENV,
  fcm: { 'server-key': '' },
  // JWT expiry time in minutes
  jwtRefreshExpiration: 60 * 24 * 48, //Refresh token expiration interval: 2 days
  jwtExpiration: 60 * 24 * 24, // Access token expiration interval: 1 day
  jwtSecret: 'qweqweuiquhjkdncjnzxncb12ne23h194y12u84134234h2j34h3',
  mediaTypes: ['photo', 'video', 'document'],
  mongo: {
    uri: process.env.MONGODB_CONNECTION_STRING
  },
  port: process.env.PORT || 3001,
  website: 'https://reverent-clarke-14b5b9.netlify.app/',
  whitelist: null,
};

module.exports = config;
