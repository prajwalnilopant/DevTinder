const express = require("express");
const authRouter = express.Router();

const { validateSignUpData } = require("../utils/validate");
const User = require("../models/user");
const bcrypt = require("bcrypt");

//Sign-Up API
authRouter.post("/signup", async (req, res) => {
  // Recommended to do all the DB operations inside try-catch
  try {
    // Validating the data
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;

    // Encrypting the password..
    const hashedPassword = await bcrypt.hash(password, 10);

    // Creating an instance of User from the user model
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: hashedPassword,
    });
    // save() function usually returns a promise. So, it is recommended to be handled with the help of async-await
    const savedUser = await user.save();
    const token = await savedUser.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
    });
    res.json({ message: "User Added Successfully", data: savedUser });
  } catch (err) {
    res.status(400).send("Error saving the User:" + err.message);
  }
});

// Login API
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid Credentials!");
    }

    const isPasswordValid = await user.validatePassword(password);
    if (isPasswordValid) {
      // Create a JWT Token
      const token = await user.getJWT();

      // Add the token to cookie and send the response back to the user.
      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000),
      });

      res.send(user);
    } else {
      throw new Error("Invalid Credetials");
    }
  } catch (err) {
    res.status(400).send("Error saving the User:" + err.message);
  }
});

// Logout API
authRouter.post("/logout", (req, res) => {
  // Clear the cookie
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("Logged out successfully!");
});

module.exports = authRouter;
