const router = require("express").Router();
const User = require("../models/Model.js");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
require("dotenv").config();

const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("../authenticate/auth.js");

function isPasswordStrong(password) {
  const regex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[A-Z]).{8,}$/;
  return regex.test(password);
}

router
  .get("/forgot-password", checkNotAuthenticated, async (req, res) => {
    res.render("forgotPass", { message: "" });
  })

  .post("/forgot-password", checkNotAuthenticated, async (req, res) => {
    const email = req.body.email;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.render("forgotPass.ejs", {
        message: "User with this email doesn't exist in our database!",
      });
    }

    const token = crypto.randomBytes(20).toString("hex");
    //store it in database
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; //1 hour
    await user.save();

    // send email with a link
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAILID,
        pass: process.env.MAILPASS,
      },
    });

    const mailOptions = {
      to: email,
      subject: "Reset password",
      html: `
            <div style="background-color: #F5F5F5; padding: 20px;">
                <div style="background-color: #ffffff; padding: 20px; border-radius: 5px;">
                    <h2>Reset Your Password</h2>
                    <p>Click the button below to reset your password:</p>
                    <div style="text-align: center;">
                        <a href="http://localhost:5000/reset-password?token=${token}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px; font-size: 16px; margin-top: 10px;">Reset Password</a>
                    </div>
                </div>
            </div>
            `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(`Email sent: ${info.response} `);
      }
    });

    res.render("enterCode.ejs", { message: "" });
  })

  .get("/reset-password", checkNotAuthenticated, async (req, res) => {
    const token = req.query.token;
    const user = await User.findOne({ where: { resetPasswordToken: token } });
    console.log(user);
    if (!user) {
      return res.render("resetPass.ejs", {
        message: "No user found in database!",
        token: token,
      });
    }
    res.render("resetPass.ejs", { message: "", token: token });
  })
  .post("/reset-password", checkNotAuthenticated, async (req, res) => {
    const token = req.body.token;
    const user = await User.findOne({ where: { resetPasswordToken: token } });

    if (!user) {
      return res.render("resetPass.ejs", {
        message: "No user found in database!",
      });
    }

    const newPassword = req.body.password;
    const confirmPass = req.body.confirmPassword;

    if (newPassword !== confirmPass) {
      return res.render("resetPass", {
        message: "Password and Confirm Password must match ! ",
        token: token,
      });
    }
    // check password is strong or not
    if (!isPasswordStrong(newPassword)) {
      return res.render("resetPass", {
        message: `New Password must be more than 8 characters, include at least 1 Uppercase letter, 1 Lowercase letter, 1 Number and 1 Special Character`,
        token: token,
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.render("login", {
      message: "Password Successfully Changed! Proceed to Login",
    });
  });

module.exports = router;
