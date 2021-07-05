const { check } = require("express-validator");

module.exports = {
  signInFormValidation: [
    check("username").not().isEmpty().withMessage("username is not empty"),
    check("password").not().isEmpty().withMessage("password is not empty"),
  ],
};
