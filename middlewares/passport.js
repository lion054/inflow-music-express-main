const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Artist = mongoose.model("Artist");
const User = mongoose.model("User");
const { jwtSecret } = require('../config')

// JSON WEB TOKENS STRATEGY
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromHeader('x-access-token'),
  secretOrKey: jwtSecret,
  passReqToCallback: true
}, async (req, payload, done) => {
  try {
    let user;
    // Find the user specified in token
    if ( payload.account_type === "artist") {
      user = await Artist.findById(payload.id);
    } else {
      user = await User.findById(payload.id);
    }

    // If user doesn't exists, handle it
    if (!user) {
      return done(null, false);
    }
    // Otherwise, return the user
    req.body.user = user
    done(null, user);
  } catch(error) {
    done(error, false);
  }
}));

// LOCAL STRATEGY
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  try {
    // Find the user given the email
    const { account_type } = req.body
    console.log("eee", email, password)
    let user 
    if ( account_type === 'artist') {
      user = await Artist.findOne({ email });
    } else {
      user = await User.findOne({ email });
    }
    console.log("ssss", user)
    // If not, handle it
    if (!user) {
      //res.status(404)
      return done(null, false, {emailnotfound: "Email not found"});
    }
  
    // Check if the password is correct
    const isMatch = await user.isValidPassword(password);
    console.log("isMatch", isMatch)
    // If not, handle it
    if (!isMatch) {
      return done(null, false, { passwordincorrect: "Password incorrect" });
    }
  
    // Otherwise, return the user
    done(null, user);
  } catch(error) {
    done(error, false, {error: 'internel error'});
  }
}));

exports.passportSignIn = passport.authenticate('local', { session: false });
exports.passportJWT = passport.authenticate('jwt', { session: false });


