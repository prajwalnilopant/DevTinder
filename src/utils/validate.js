const validator = require("validator");

const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;
  if (!firstName || !lastName) {
    throw new Error("Enter a valid firstName or lastName");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Enter a valid Email ID");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Password is too weak! Please enter a strong password!");
  }
};

const validateEditProfileData = (req) => {
  const allowedEditFields = ["firstName", "lastName", "age", "gender", "photoURL", "about", "skills"];
  const isEditAllowed = Object.keys(req.body).every((field) => allowedEditFields.includes(field));

  return isEditAllowed;
};

module.exports = { validateSignUpData, validateEditProfileData };
