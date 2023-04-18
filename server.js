const express = require("express");
const dotenv = require("dotenv").config();
const app = express();
var path = require("path");
const Login = require("./routes/loginRoute.js");
const afterLogin = require("./routes/homeRoute.js");
const Regsiter = require("./routes/registerRoute.js");
const Logout = require("./routes/logoutRoute.js");
const forgotPassword = require("./routes/forgotPass.js");
const sequelize = require("./database/Connection.js");

const flash = require("express-flash");
const session = require("express-session");
const passport = require("passport");
const methodOverride = require("method-override");

const User = require("./models/Model.js");

app.use(express.static(path.join(__dirname, "src","public")));

// Import Passport configuration
require("./database/passport.js")(passport);

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 6000000 * 100 }, // session expires in 600000 seconds
  })
);
// Initialize Passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

app.use("/login", Login);
app.use("/", afterLogin);
app.use("/", Regsiter);
app.use("/logout", Logout);
app.use("/", Login);
app.use("/", forgotPassword);

app.listen(process.env.PORT || 2001, () => {
  console.log(`Server is listening on port ${process.env.PORT}`);
});
