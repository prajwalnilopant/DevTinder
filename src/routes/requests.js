const express = require("express");
const requestRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const sendEmail = require("../utils/sendEmail");

const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;
    const status = req.params.status;

    const allowedStatus = ["interested", "ignored"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status type " + status });
    }

    const toUser = await User.findById(toUserId);
    if (!toUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingConnectionRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });
    if (existingConnectionRequest) {
      return res.status(400).json({ message: "Connection request already exists" });
    }

    // Create a new connection request instance from the ConnectionRequest model
    // and save it to the database
    const connectionRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status,
    });
    const data = await connectionRequest.save();

    // Logic to send the Email using Amazon SES

    console.log(process.env.AWS_ACCESS_KEY_ID);
    console.log(process.env.AWS_SECRET_ACCESS_KEY);

    sendEmail
      .run(`A new friend request from ${req.user.firstName}`, `${req.user.firstName} has ${status} the request with ${toUser.firstName}`)
      .then((res) => console.log("Email sent:", res))
      .catch((err) => console.error("Email failed:", err));

    res.json({
      message: req.user.firstName + " " + status + " in " + toUser.firstName,
      data,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { requestId, status } = req.params;

    const allowedStatus = ["accepted", "rejected"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status type " + status });
    }

    const connectionRequest = await ConnectionRequest.findOne({ _id: requestId, toUserId: loggedInUser._id, status: "interested" });
    if (!connectionRequest) {
      return res.status(404).json({ message: "No pending request found" });
    }
    connectionRequest.status = status;
    const data = await connectionRequest.save();
    res.json({ message: "Request " + status, data });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = requestRouter;
