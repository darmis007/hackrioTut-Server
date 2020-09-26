const {check} = require('express-validator')

exports.categoryCreateValidator = [
    check('name')
    .not()
    .isEmpty()
    .withMessage('Name is required'),
    check('image')
    .isEmpty()
    .withMessage('Valid Image is required'),
    check('content')
    .isLength({min:20})
    .withMessage('20 characters content is required')
];

exports.categoryUpdateValidator = [
    check('name')
    .not()
    .isEmpty()
    .withMessage('Name is required'),
    check('content')
    .isLength({min:20})
    .withMessage('20 characters content is required')
];