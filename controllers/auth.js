const AWS = require("aws-sdk");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const {
  registerEmailParams,
  forgotPasswordEmailParams,
} = require("../helpers/email");
const shortId = require("shortid");
const expressJWT = require("express-jwt");
const _ = require("lodash");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const ses = new AWS.SES({ apiVersion: "2010-12-01" });

exports.register = (req, res) => {
  // console.log('REGISTER CONTROLLER', req.body);
  const { name, email, password } = req.body;
  // Check User Exists
  User.findOne({ email }).exec((err, user) => {
    if (user) {
      console.log(err);
      return res.status(400).json({
        error: "Email is Taken",
      });
    }
    // generate token with user name and email and password
    const token = jwt.sign(
      { name, email, password },
      process.env.JWT_ACCOUNT_ACTIVATION,
      {
        expiresIn: "10m",
      }
    );
    // send email
    const params = registerEmailParams(email, token);

    const sendEmailOnRegister = ses.sendEmail(params).promise();

    sendEmailOnRegister
      .then((data) => {
        console.log("Email Subitted to SES", data);
        res.json({
          message: `Email has been sent to ${email}, Follow the instructions to complete your registration`,
        });
      })
      .catch((error) => {
        console.log("SES email on register ", error);
        res.json({
          message: `We could not verify your email. Please try again`,
        });
      });
  });
};

exports.registerActivate = (req, res) => {
  const { token } = req.body;
  // console.log(token)
  jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        error: "Expired Link. Try Again",
      });
    }

    const { name, email, password } = jwt.decode(token);
    const username = shortId.generate();

    User.findOne({ email }).exec((err, user) => {
      if (user) {
        return res.status(401).json({
          error: "Email is taken",
        });
      }
      // Register New User
      const newUser = new User({ username, name, email, password });
      newUser.save((err, newUser) => {
        if (err) {
          return res.status(401).json({
            error: "Error saving user in database, try later",
          });
        }
        return res.json({
          message: "Registration Successfull, Please login",
        });
      });
    });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  // return res.status(200).json({
  //    email,
  //    password
  //})
  User.findOne({ email }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User with that email does not exist. Please register.",
      });
    }

    if (!user.authenticate(password)) {
      return res.status(400).json({
        error: "Email and Password do not match. Please Try Again.",
      });
    }

    // generate token and send to client
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    const { _id, name, email, role } = user;

    return res.json({
      token,
      user: { _id, name, email, role },
    });
  });
};

exports.requireSignIn = expressJWT({ secret: process.env.JWT_SECRET });

exports.authMiddleware = (req, res, next) => {
  const authUserId = req.user._id;
  User.findOne({ _id: authUserId }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }
    req.profile = user;
    next();
  });
};

exports.adminMiddleware = (req, res, next) => {
  const adminUserId = req.user._id;
  User.findOne({ _id: adminUserId }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(400).json({
        error: "User not authorized. Access Denied",
      });
    }
    req.profile = user;
    next();
  });
};

exports.forgotPassword = (req, res) => {
  const { email } = req.body;
  // check if user exists in database
  User.findOne({ email }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User with that email does not exist",
      });
    }

    // generate token and email to user
    const token = jwt.sign(
      { name: user.name },
      process.env.JWT_RESET_PASSWORD,
      {
        expiresIn: "10m",
      }
    );

    // send email
    const params = forgotPasswordEmailParams(email, token);

    // populate the database > user > resetPasswordLink
    return User.updateOne({ resetPasswordLink: token }, (err, success) => {
      if (err) {
        return res.status(400).json({
          error: "Password Reset Failed. Try Later",
        });
      }

      const sendEmail = ses.sendEmail(params).promise();
      sendEmail
        .then((data) => {
          console.log("reset Password Success");
          return res.json({
            message: `Email has been sent to ${email}. Click on the link to reset your password`,
          });
        })
        .catch((error) => {
          console.log(" reset Password failed ", error);
          return res.json({
            message: `We could not verify this email. Try later`,
          });
        });
    });
  });
};

exports.resetPassword = (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;
  if (resetPasswordLink) {
    // check for expiry
    jwt.verify(
      resetPasswordLink,
      process.env.JWT_RESET_PASSWORD,
      (err, success) => {
        if (err) {
          return res.status(400).json({
            error: "Expired Link. Try again",
          });
        }
      }
    );

    User.findOne({ resetPasswordLink }).exec((err, user) => {
      if (err || !user) {
        return res.status(400).json({
          error: "Invalid Token",
        });
      }

      const updatedFields = {
        password: newPassword,
        resetPasswordLink: "",
      };

      user = _.extend(user, updatedFields);

      user.save((err, result) => {
        if (err) {
          error: "Password Reset Failed. Try again";
        }
      });

      res.json({
        message: "You can login using the new Password",
      });
    });
  }
};
