const express = require('express');
const router = express.Router();

// import from controllers
const { requireSignIn, adminMiddleware, authMiddleware } = require('../controllers/auth');
const {} = require('../controllers/link');

// import from validators
const { linkCreateValidator, linkUpdateValidator } = require('../validators/link');
const { runValidation } = require('../validators/index');
const { create, list, read, update, remove} = require('../controllers/link')

// routes
router.post('/link', linkCreateValidator, runValidation, requireSignIn, authMiddleware, create)
router.get('/link', list)
router.get('/link/:slug', read)
router.put('/link/:slug', linkUpdateValidator, runValidation, requireSignIn, authMiddleware, create)
router.delete('/link/:slug', requireSignIn, authMiddleware, remove)

module.exports = router;

