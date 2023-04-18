const express = require("express");
const router = express.Router();
const passport = require("passport");
const { checkAuthenticated } = require("../authenticate/auth");

router.delete("/", function (req, res) {
  req.logout(function (err) {
    if (err) {
      console.error(err);
      return next(err);
    }
    res.redirect("/login");
  });
});

module.exports = router;
