const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const mongoose = require("mongoose");
const facebookRoutes = require("./routes/facebookRoutes");
require("dotenv").config();

const app = express();

// MongoDB connection
mongoose.connect("mongodb://localhost/facebook-app");

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

// Passport configuration
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FB_REDIRECT_URI,
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, { profile, accessToken });
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Middleware
app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/", facebookRoutes);

// Serve static files from React frontend
app.use(express.static(path.join(__dirname, "../front-end/dist")));

// Fallback route - Serve React app for any other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../front-end/dist/index.html"));
});

// Start server
app.listen(5000, () => console.log("Server running on http://localhost:5000"));
