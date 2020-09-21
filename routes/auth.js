const express = require('express');
const router = express.Router();

// import from controllers
const { register, registerActivate, login } = require('../controllers/auth');

// import from validators
const { userRegisterValidator, userLoginValidator } = require('../validators/auth');
const { runValidation } = require('../validators/index');

router.post('/register', userRegisterValidator, runValidation, register);
router.post('/register/activate', registerActivate);
router.post('/login', userLoginValidator, runValidation, login);


module.exports = router;
