const express = require("express");
const app = express();

const { adminAuth, userAuth } = require("./middlewares/auth");

app.use("/admin", adminAuth);

app.post("/user/login", (req, res) => {
  res.send("User logged in successfully!");
});

app.get("/user/data", userAuth, (req, res) => {
  res.send("User Data Sent");
});

app.get("/admin/getAllData", (req, res) => {
  res.send("Sent all admin data");
});

app.get("/admin/deleteUser", (req, res) => {
  res.send("Deleted a User");
});

app.listen(7777, () => {
  console.log("Listening on port 7777");
});
