const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const userController = require("../controller/userController.js");
// const { db } = require("../models/userModel.js");
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();
const localLogin =
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await userController.getUserByEmailIdAndPassword(email, password);
        return user
          ? done(null, { id: user.id, strategy: "local" })
          : done(null, false, { message: "Invalid login" });
      } catch (error) {
        return done(error);
      }
    }
  );

passport.serializeUser((user, done) => {
  console.log("serializeUser", user);
  done(null, user); // store both ID and strategy
});

passport.deserializeUser(async (sessionUser, done) => {
  try {
    let user;
    if (sessionUser.strategy === "local") {
      user = await db.user.findUnique({ where: { id: sessionUser.id } });
    } else if (sessionUser.strategy === "google") {
      user = await db.user.findUnique({ where: { googleId: sessionUser.id } });
    }

    if (user) {
      done(null, user);
    } else {
      done(new Error("User not found"), null);
    }
  } catch (error) {
    console.error("Error in deserializeUser:", error);
    done(error, null);
  }
});

const oauth_login = new GoogleStrategy({
  clientID: "711930648739-a3d1lmtfofqh4v99q1vl7ecrbf0o3a2c.apps.googleusercontent.com",
  clientSecret: "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",
  callbackURL: "http://portfolio.hillarylam.info/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
      try {
        // Either find the user or create them
        const user = await userController.findOrCreateGoogleUser(profile);
        return done(null, { id: user.googleId, strategy: "google" });
      } catch (err) {
        console.error("Error in Google Strategy:", err);
        return done(err, null);
      }
    }
);


passport.use(localLogin);
passport.use(oauth_login);

module.exports = passport