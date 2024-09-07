const express = require("express");
const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const session = require("express-session");
const cors = require("cors");
const axios = require("axios");

const app = express();

// CORS configuration to allow requests from the frontend (port 5173)
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true, // Allows cookies/session to be included in requests
};

app.use(cors(corsOptions));

// Session handling
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true, // Ensures cookies are only accessible via the backend
      secure: false, // Set to true in production when using HTTPS
      sameSite: "lax", // Ensures cookies are sent on cross-origin requests
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Serialize and deserialize user information into the session
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Facebook OAuth strategy configuration
passport.use(
  new FacebookStrategy(
    {
      clientID: 1617044762208034,
      clientSecret: "94d2306d17827a25b8fc8e19fe18190d", // Replace with actual secret
      callbackURL: "http://localhost:5000/auth/facebook/callback", // OAuth callback URL
      profileFields: ["id", "displayName", "photos"], // Fetch user's name and photo
    },
    (accessToken, refreshToken, profile, done) => {
      profile.accessToken = accessToken; // Store access token in profile
      return done(null, profile);
    }
  )
);

// Facebook login route
app.get("/auth/facebook", passport.authenticate("facebook"));

// Facebook callback route
app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("http://localhost:5173/dashboard"); // Redirect to frontend dashboard
  }
);

// API route to get logged-in user information
app.get("/api/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      name: req.user.displayName,
      picture: req.user.photos[0].value,
      accessToken: req.user.accessToken, // Send the access token to the frontend
    });
  } else {
    res.sendStatus(401); // Not authenticated
  }
});

// API route to get Facebook pages owned by the user
app.get("/api/pages", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.sendStatus(401); // Ensure user is authenticated
  }

  const { accessToken } = req.user; // Get the access token from the session

  axios
    .get(`https://graph.facebook.com/me/accounts?access_token=${accessToken}`)
    .then((response) => {
      res.json(response.data.data); // Send back the list of pages
    })
    .catch((err) => res.status(400).json(err)); // Handle errors
});

// API route to get insights for a selected Facebook page
app.get("/api/page/:id/insights", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.sendStatus(401); // Ensure user is authenticated
  }

  const { id } = req.params;
  const { accessToken } = req.user;
  const { since, until } = req.query; // Get 'since' and 'until' from query parameters

  const url = `https://graph.facebook.com/${id}/insights?metric=page_fans,page_engaged_users,page_impressions,page_actions_post_reactions_total&since=${since}&until=${until}&access_token=${accessToken}&period=total_over_range`;

  axios
    .get(url)
    .then((response) => {
      res.json(response.data.data); // Send insights data to frontend
    })
    .catch((err) => res.status(400).json(err)); // Handle errors
});

// Start the backend server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
