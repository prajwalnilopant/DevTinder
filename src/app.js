const express = require("express");
const app = express();

app.use(
  "/user",
  (req, res, next) => {
    console.log("Route Handler 1");
    // res.send("Response 1");
    next();
  },
  (req, res, next) => {
    console.log("Route Handler 2");
    // res.send("Response 2");
  },
  (req, res, next) => {
    console.log("Route Handler 3");
    // res.send("Response 3");
  },
  (req, res, next) => {
    console.log("Route Handler 4");
    // res.send("Response 4");
  },
  (req, res, next) => {
    console.log("Route Handler 5");
    // res.send("Response 5");
  }
);

app.listen(7777, () => {
  console.log("Listening on port 7777");
});
