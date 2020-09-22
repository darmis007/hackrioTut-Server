const {check} = require('express-validator')

exports.userRegisterValidator = [
    check('name')
    .not()
    .isEmpty()
    .withMessage('Name is required'),
    check('email')
    .isEmail()
    .withMessage('Valid Email is required'),
    check('password')
    .isLength({min:6})
    .withMessage('6 character Password is required')
];

exports.userLoginValidator = [
    check('email')
    .isEmail()
    .withMessage('Valid Email is required'),
    check('password')
    .isLength({min:6})
    .withMessage('6 character Password is required')
];

exports.forgotPasswordValidator = [
    check('email')
    .isEmail()
    .withMessage('Valid Email is required')
];

exports.resetPasswordValidator = [
    check('newPassword')
    .isLength({min:6})
    .withMessage('6 character Password is required'),
    check('resetPasswordLink')
    .not()
    .isEmpty()
    .withMessage('Token is required')
];