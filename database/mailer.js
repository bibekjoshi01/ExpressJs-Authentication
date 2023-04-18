require("dotenv").config();
const nodemailer = require("nodemailer");

const client = nodemailer.createTransport({
  host: "smtp.hostnet.nl",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAILID,
    pass: process.env.MAILPASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

client.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

module.exports = client;
