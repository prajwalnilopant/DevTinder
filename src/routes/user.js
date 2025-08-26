const express = require("express");
const userRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const USER_FIELDS = "firstName lastName photoURL about skills age gender";

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequests = await ConnectionRequest.find({ toUserId: loggedInUser._id, status: "interested" }).populate("fromUserId", USER_FIELDS);
    // .populate("fromUserId", ["firstName", "lastName", "photoUrl", "about", "skills", "age", "gender"]); The above line is equivalent to this one. Both will work the same way.
    res.json({
      message: "Fetched received connection requests successfully!",
      data: connectionRequests,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_FIELDS)
      .populate("toUserId", USER_FIELDS);

    const data = connectionRequests.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.json({ data });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit; // Limit to a maximum of 50 users per page
    const skip = (page - 1) * limit;

    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    const excludedUsersFromFeed = new Set();
    connectionRequests.forEach((req) => {
      excludedUsersFromFeed.add(req.fromUserId.toString());
      excludedUsersFromFeed.add(req.toUserId.toString());
    });

    const allowedUsersOnFeed = await User.find({
      $and: [{ _id: { $nin: Array.from(excludedUsersFromFeed) } }, { _id: { $ne: loggedInUser._id } }],
    })
      .select(USER_FIELDS)
      .skip(skip)
      .limit(limit);

    res.json({ data: allowedUsersOnFeed });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = userRouter;
