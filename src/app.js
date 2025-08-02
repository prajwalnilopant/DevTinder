const express = require("express");
const connectDB = require("./config/database"); // This establishes the link between the database and our App
const app = express();
const User = require("./models/user");
const { validateSignUpData } = require("./utils/validate");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

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

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      // Create a JWT Token
      const token = await jwt.sign({ _id: user._id }, "D3V#Tind3r786");

      // Add the token to cookie and send the response back to the user.
      res.cookie("token", token);

      res.send("Login Successful!");
    } else {
      throw new Error("Invalid Credetials");
    }
  } catch (err) {
    res.status(400).send("Error saving the User:" + err.message);
  }
});

// Get the User profile.
app.get("/profile", async (req, res) => {
  try {
    const cookies = req.cookies;
    const { token } = cookies;
    if (!token) {
      throw new Error("Invalid Token");
    }

    const decodedMessage = await jwt.verify(token, "D3V#Tind3r786");
    const { _id } = decodedMessage;
    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User does not exist!");
    }
    res.send(user);
  } catch (err) {
    res.status(400).send("Something went wrong!" + err.message);
  }
});

// GET only one user using findOne() method
app.get("/user", async (req, res) => {
  const userEmail = req.body.emailId;
  try {
    const user = await User.findOne({ emailId: userEmail });
    console.log(user);
    if (!user) {
      res.status(404).send("User not found");
    } else {
      res.send(user);
    }
  } catch (err) {
    res.status(400).send("Something went wrong!");
  }
});

// GET all users using find() method
app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    console.log(users);
    if (users.length === 0) {
      res.status(404).send("No users found");
    } else {
      res.send(users);
    }
  } catch (err) {
    res.status(400).send("Something went wrong!");
  }
});

// Delete a User from a Database.
app.delete("/user", async (req, res) => {
  const userId = req.body.userId;
  try {
    const user = await User.findByIdAndDelete({ _id: userId });
    // const user = await User.findByIdAndDelete(userId) -> This and above statements are one in the same.
    res.send("User deleted successfully");
  } catch (err) {
    res.status(400).send("Something went wrong!");
  }
});

// Updating the data of the User.
app.patch("/user/:userId", async (req, res) => {
  const userId = req.params?.userId;
  const data = req.body;
  try {
    const ALLOWED_UPDATES = ["photoUrl", "about", "gender", "age", "skills"];
    const isUpdateAllowed = Object.keys(data).every((k) => ALLOWED_UPDATES.includes(k));
    // Below two conditionals are API Level Sanitizations/ Validations
    if (!isUpdateAllowed) {
      throw new Error("Update not allowed");
    }
    if (data?.skills.length > 10) {
      throw new Error("Skills cannot be more than 10");
    }

    const user = await User.findByIdAndUpdate(userId, data, {
      returnDocument: "after",
      runValidators: true,
    });
    res.send("User data updated successfully");
  } catch (err) {
    res.status(400).send("UPDATE FAILED" + err.message);
  }
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
