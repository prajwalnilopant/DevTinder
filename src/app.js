const express = require("express");
const connectDB = require("./config/database"); // This establishes the link between the database and our App
const app = express();
const cookieParser = require("cookie-parser");

// The below method is used to Parse the JSON data into JS Object. Without parsing we cannot use JSON objects directly within JS.
app.use(express.json());
app.use(cookieParser()); // This method is used to read the cookies. Without this, we would get undefined if there is no parser.

const requestRouter = require("./routes/requests");
const profileRouter = require("./routes/profile");
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

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
