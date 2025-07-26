const express = require("express");
const connectDB = require("./config/database"); // This establishes the link between the database and our App
const app = express();
const User = require("./models/user");

app.post("/signup", async (req, res) => {
  // Creating an instance of User from the user model
  const user = new User({
    firstName: "Prajwal",
    lastName: "Nilopant",
    emailId: "pj1@gmail.com",
    password: "pj@123",
    gender: "Male",
    age: 26,
  });

  // Recommended to do all the DB operations inside try-catch
  try {
    // save() function usually returns a promise. So, it is recommended to be handled with the help of async-await
    await user.save();
    res.send("User added successfully!");
  } catch (err) {
    res.status(400).send("Error saving the User:" + err.message);
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
