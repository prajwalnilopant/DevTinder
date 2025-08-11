const express = require("express");
const connectDB = require("./config/database"); // This establishes the link between the database and our App
const app = express();
const User = require("./models/user");
const { validateSignUpData } = require("./utils/validate");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middlewares/auth");

// The below method is used to Parse the JSON data into JS Object. Without parsing we cannot use JSON objects directly within JS.
app.use(express.json());
app.use(cookieParser()); // This method is used to read the cookies. Without this, we would get undefined if there is no parser.

//Sign-Up API
app.post("/signup", async (req, res) => {
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
    await user.save();
    res.send("User added successfully!");
  } catch (err) {
    res.status(400).send("Error saving the User:" + err.message);
  }
});

// Login API
app.post("/login", async (req, res) => {
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

      res.send("Login Successful!");
    } else {
      throw new Error("Invalid Credetials");
    }
  } catch (err) {
    res.status(400).send("Error saving the User:" + err.message);
  }
});

// Get the User profile.
app.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(400).send("Something went wrong!" + err.message);
  }
});

app.post("/sendConnectionRequest", userAuth, async (req, res) => {
  const user = req.user;
  // Sending a connection request
  console.log("Sending a connection request");
  res.send(user.firstName + "sent the connection request!");
});

// Proper way of establishing a DB connection
connectDB()
  .then(() => {
    console.log("Connected to the Database Successfully!");
    app.listen(7777, () => {
      console.log("Listening on port 7777");
    });
  })
  .catch((err) => {
    console.log("Cannot connect to the Database!!");
  });
