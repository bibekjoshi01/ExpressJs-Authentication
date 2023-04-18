const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("../authenticate/auth.js");
const speakeasy = require("speakeasy");
const Swal = require("sweetalert2");

router.get("/", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs", { message: "" });
});

router.post("/", checkNotAuthenticated, (req, res, next) => {
  passport.authenticate("local", async (err, user, info) => {
    if (err) {
      console.log(err);
      return next(err);
    }
    if (!user) {
      console.log("Invalid credentials !");
      return res.render("login.ejs", { message: "Invalid Credentials" });
    }

    try {
      const secret = user.secret;
      const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: "base32",
        token: req.body.code,
      });
      if (verified) {
        req.logIn(user, function (err) {
          if (err) {
            console.log(err);
            return next(err);
          }
          return res.render("home.ejs", {
            message: "Success",
            name: req.user.email,
          });
        });
      } else {
        return res.render("login.ejs", {
          message: "Invalid verification code.",
        });
      }
    } catch (err) {
      console.log(err);
      return next(err);
    }
  })(req, res, next);
});

module.exports = router;
