const { check } = require("express-validator");

module.exports = {
  editProfileFormValidation: [
    check("username")
      .not()
      .isEmpty()
      .withMessage("username is not empty")
      .isLength({ min: 3 })
      .withMessage("minimum username length is 3"),
    check("email")
      .not()
      .isEmpty()
      .withMessage("email is not empty")
      .isEmail()
      .withMessage("provide valid email address"),
  ],
};
