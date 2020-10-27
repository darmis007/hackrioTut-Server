const express = require("express");
const router = express.Router();

// import middlewares
const {
  requireSignIn,
  authMiddleware,
  adminMiddleware,
} = require("../controllers/auth");
// import validator
const { userUpdateValidator } = require("../validators/auth");
const { runValidation } = require("../validators");

// import controllers
const { read, update } = require("../controllers/user");

// routes
router.get("/user", requireSignIn, authMiddleware, read);
router.get("/admin", requireSignIn, adminMiddleware, read);
router.put(
  "/user",
  userUpdateValidator,
  runValidation,
  requireSignIn,
  authMiddleware,
  update
);

module.exports = router;
