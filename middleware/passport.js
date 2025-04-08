const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const userController = require("../controller/userController.js");
// const { db } = require("../models/userModel.js");
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();
const localLogin = new LocalStrategy(
  {
    // these variables will receive the username and password sent from the login page on the browser
    usernameField: "email",
    passwordField: "password",
  },
 async (email, password, done) => {
    console.log("hi")
    // returns a user if the credentials match
    // done is a special callback function that passport gives us
    // call done if you have a user, or call done but pass in false
    // aka you'll either get a user back, or you will get a null value
    const user = await userController.getUserByEmailIdAndPassword(email, password);
    return user
    // if you get a user back, tell passport via done() and the user and it'll create a session
    // first parameter is for displaying database-level errors, but we aren't using a database right now so we can leave it as null
    // at this moment, we only care about the second parameter
    // if user is given, redirect to dashboard
      ? done(null, user)
    // if you can't get the user back, then second parameter is false
    // if user is not given, redirect to login
      : done(null, false, {
          message: "Your login details are not valid. Please try again",
        });
  }
);
passport.use(localLogin);

passport.serializeUser(function(user, done) {
  console.log("ENTERED!")
  console.log(user);
  // const userId = await (user).id;
  done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
  const user = await db.user.findUnique({ where: { id: id}})
   // look up in the database the user by their id
   // const user = something();
    done(null, user);
  }
);

const oauth_login = (new GoogleStrategy({
  clientID: "711930648739-a3d1lmtfofqh4v99q1vl7ecrbf0o3a2c.apps.googleusercontent.com",
  clientSecret: "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",
  callbackURL: "http://portfolio.hillarylam.info/auth/google/callback"
},
function(accessToken, refreshToken, profile, cb) {
  cb(null, profile);
    }
));

passport.use(oauth_login)
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});

module.exports = passport
