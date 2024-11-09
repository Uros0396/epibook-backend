const express = require("express");
const session = require("express-session");
const passport = require("passport");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const google = express.Router();
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const Usersmodel = require("../models/Usersmodel");

const app = express();

// app.use(
//   session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: true,
//   })
// );

// app.use(passport.initialize());
// app.use(passport.session());

// passport.serializeUser((user, done) => {
//   done(null, user);
// });

// passport.deserializeUser((user, done) => {
//   done(null, user);
// });

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: process.env.GOOGLE_CALLBACK_URL,
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         let user = await Usersmodel.findOne({ email: profile._json.email });
//         if (!user) {
//           const { _json: userData } = profile;
//           user = new Usersmodel({
//             name: userData.given_name,
//             email: userData.email,
//             avatar: userData.picture,
//             googleId: userData.id,
//           });
//           await user.save();
//         }
//         done(null, user);
//       } catch (error) {
//         console.log(error);
//         done(error, null);
//       }
//     }
//   )
// );

// google.get(
//   "/auth/google",
//   passport.authenticate("google", { scope: ["email", "profile"] })
// );

google.get("/auth/google", (req, res) => {
  const redirectUri = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_CALLBACK_URL}&response_type=code&scope=email profile`;
  res.redirect(redirectUri);
});

google.get("/auth/google/callback", async (req, res) => {
  const body = {
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_CALLBACK_URL,
    grant_type: "authorization_code",
    code: req.query.code,
  };
  const token = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: JSON.stringify(body),
  });
  const response = await token.json();

  //res.cookie("token", JSON.stringify(response.access_token));
  res.redirect(
    "https://epibook-frontend.vercel.app/success/" + response.access_token
  );
});

// google.get(
//   "/auth/google/callback",
//   passport.authenticate("google", { failureRedirect: "/" }),
//   (req, res) => {
//     if (!req.user) {
//       return res.status(401).json({ message: "Google authentication failed" });
//     }

//     const user = req.user;
//     const token = jwt.sign(user, process.env.JWT_SECRET);
//     const redirectUrl = `${
//       process.env.FRONTEND_URL
//     }/success?token=${encodeURIComponent(token)}`;
//     res.redirect(redirectUrl);
//   }
// );

module.exports = google;
