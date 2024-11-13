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
    saveUninitialized: true,
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
        let user = await Usersmodel.findOne({ email: profile._json.email });
        if (!user) {
          const { _json: userData } = profile;
          const userToSave = new Usersmodel({
            name: userData.given_name,
            email: userData.email,
            surname: userData.family_name,
            dob: new Date(),
            password: "123456789",
            username: `${userData.given_name}_${userData.family_name}`,
          });
          user = await userToSave.save();
        }
        done(null, user);
      } catch (error) {
        console.log(error);
        done(error, null);
      }
    }
  )
);
google.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

google.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    const user = req.user;
    const token = {
      name: user.name,
      surname: user.surname,
      email: user.email,
      _id: user._id,
    };
    const userToken = jwt.sign(token, process.env.JWT_SECRET);
    const redirectUrl = `${
      process.env.FRONTEND_URL
    }/success?token=${encodeURIComponent(userToken)}`;
    res.redirect(redirectUrl);
  }
);

module.exports = google;
