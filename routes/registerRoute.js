const express = require("express");
const User = require("../models/Model");
const router = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("../authenticate/auth.js");
const speakEasy = require("speakeasy");
const qrcode = require("qrcode");
const fetch = require("node-fetch");
const siteKey = process.env.SITE_KEY;

router.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register.ejs", { message: "" });
});

function checkPasswordStrength(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
  if (regex.test(password)) {
    return "strong";
  } else if (password.length >= 8 && password.length < 12) {
    return "medium";
  } else {
    return "weak";
  }
}

router.post("/register", checkNotAuthenticated, async (req, res) => {
  const captchaResponse = req.body["g-recaptcha-response"];
  const secretKey = process.env.SECRET_KEY;
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaResponse}`;

  const response = await fetch(verifyUrl, { method: "POST" });
  const json = await response.json();

  if (json.success) {
    try {
      const secret = speakEasy.generateSecret();

      const { email, password, confirmPassword } = req.body;
      // check if user with same email already exists
      const existingUser = await User.findOne({ where: { email: email } });
      if (existingUser) {
        return res.render("register.ejs", {
          message: "User with this email already exists",
        });
      }
      // // check password is strong or not
      // if (!isPasswordStrong(password)) {
      //     return res.render('register.ejs', {
      //         message: `Password must be more than 8 characters, include at least 1 Uppercase letter, 1 Lowercase letter, 1 Number and 1 Special Character`
      //     })
      // }

      if (password !== confirmPassword) {
        return res.render("register", { message: "Passwords must match" });
      }

      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const user = await User.create({
        email,
        password: hashedPassword,
        secret: secret.base32,
      });

      res.redirect(`/register/confirm?email=${email}`);
    } catch (error) {
      console.log(error);
    }
  } else {
    // captcha verification failed
    return res.render("register", { message: "Please Complete the captcha" });
  }
});

router.get("/register/confirm", checkNotAuthenticated, async (req, res) => {
  try {
    const email = req.query.email;
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return res.render("register-confirm.ejs", { message: "User not found" });
    }
    const secret = user.secret;
    const otpauthUrl = `otpauth://totp/${email}?secret=${secret}`;
    const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);

    res.render("register-confirm.ejs", { qrCodeUrl, secret: user.secret });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
