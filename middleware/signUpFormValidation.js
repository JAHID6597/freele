const { check } = require('express-validator');

module.exports = {
  signUpFormValidation: [
    check('username')
      .not()
      .isEmpty()
      .withMessage('username is not empty')
      .isLength({
        min: 3,
      })
      .withMessage('minimum username length is 3'),
    check('email')
      .not()
      .isEmpty()
      .withMessage('email is not empty')
      .isEmail()
      .withMessage('provide valid email address'),
    check('password')
      .not()
      .isEmpty()
      .withMessage('password is not empty')
      .isLength({
        min: 6,
      })
      .withMessage('minimum password length is 6'),
  ],
};
