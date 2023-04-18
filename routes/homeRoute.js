const express = require("express");
const router = express.Router();
const flash = require("connect-flash");
const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("../authenticate/auth.js");

router.get("/home", checkAuthenticated, (req, res) => {
  res.render("home.ejs", { message: "", name: req.user.email });
});

module.exports = router;
