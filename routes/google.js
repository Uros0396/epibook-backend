const express = require("express");
const session = require("express-session");
const passport = require("passport");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const google = express.Router();
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const Usersmodel = require("../models/Usersmodel");

google.use(
  session({
    secret: process.env.GOOGLE_CLIENT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

google.use(passport.initialize());
google.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await Usersmodel.findOne({ email: profile._json.email });
        if (!user) {
          const { _json: user } = profile;
          const userToSave = new Usersmodel({
            name: user.given_name,
            email: user.email,
            avatar: user.picture,
            googleId: user.id,
          });
        }
      } catch (error) {
        console.log(error);
      }
      return done(null, profile);
    }
  )
);

google.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

google.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }, (req, res) => {
    const user = req.user;
    const token = jwt.sign(user, process.env.JWT_SECRET);
    const redirectUrl = `${
      process.env.FRONTEND_URL
    }/success?token=${encodeURIComponent(token)}`;
    res.redirect(redirectUrl);
  })
);

module.exports = google;
