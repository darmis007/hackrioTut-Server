const express = require("express");
const router = express.Router();

// import from controllers
const {
  requireSignIn,
  adminMiddleware,
  authMiddleware,
} = require("../controllers/auth");
const {} = require("../controllers/category");

// import from validators
const {
  categoryCreateValidator,
  categoryUpdateValidator,
} = require("../validators/category");
const { runValidation } = require("../validators/index");
const {
  create,
  list,
  read,
  update,
  remove,
} = require("../controllers/category");

// routes
router.post(
  "/category",
  categoryCreateValidator,
  runValidation,
  requireSignIn,
  adminMiddleware,
  create
);
router.get("/category", list);
router.post("/category/:slug", read);
router.put(
  "/category/:slug",
  categoryUpdateValidator,
  runValidation,
  requireSignIn,
  adminMiddleware,
  create
);
router.delete("/category/:slug", requireSignIn, adminMiddleware, remove);

module.exports = router;
