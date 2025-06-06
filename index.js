require('dotenv').config();

const express = require("express");
const router = express.Router();
const app = express();

const path = require("path");
const ejsLayouts = require("express-ejs-layouts");
const session = require("express-session");

const reminderController = require("./controller/reminder_controller");
const authController = require("./controller/auth_controller");

app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 1000 * 10,
    },
  })
);

const passport = require("./middleware/passport");
const { ensureAuthenticated, isAdmin, forwardAuthenticated } = require("./middleware/checkAuth")

app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs");
app.use(ejsLayouts);
app.use(router)

app.use((req, res, next) => {
  console.log(`User details are: `);
  console.log(req.user);

  console.log("Entire session object:");
  console.log(req.session);

  console.log(`Session details are: `);
  console.log(req.session.passport);
  next();
});

// Google OAuth
router.get("/auth/google/callback", 
  passport.authenticate('google', { failureRedirect: '/error/' }),
  function(req, res) {
    res.redirect('/portfolio');
  });

router.get("/auth/google",
    passport.authenticate('google', {
        scope:['https://www.googleapis.com/auth/userinfo.profile', 
                'https://www.googleapis.com/auth/userinfo.email']
}));

// Routes start here

app.get("/portfolio", ensureAuthenticated, reminderController.list);
app.get("/auth/revoke", authController.revoke);

// register fixing
app.get("/auth/register", forwardAuthenticated, authController.register);

app.post("/auth/register", authController.registerSubmit);

app.get("/auth/login", forwardAuthenticated, authController.login);
app.get("/admin", isAdmin, authController.admin);
app.post("/auth/register", authController.registerSubmit);
app.post("/auth/login", authController.loginSubmit);
app.post("/auth/revoke", authController.revoke);

app.listen(3001, function () {
  console.log(
    "Server running. Visit: localhost:3001/portfolio in your browser 🚀"
  );
});
