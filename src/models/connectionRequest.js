const mongoose = require("mongoose");

const connectionRequestSchema = mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: `{VALUE} is not a valid status!`,
      },
    },
  },
  {
    timestamps: true,
  }
);

// These are compound indexes
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

// Note: The function that is passed should be a regular function and not an arrow function.
connectionRequestSchema.pre("save", function (next) {
  const connectionRequest = this;
  // The below condition is written in such a way that it is comparing the ObjectIds and not the strings.
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("You cannot send a connection request to yourself!");
  }
  // It’s mandatory to call next() only if you are using the callback-style middleware. Otherwise, Mongoose will wait indefinitely.
  //If you switch to async function, you don’t need next() at all — the function’s resolution/rejection is enough.
  next();
});

const ConnectionRequestModel = new mongoose.model("ConnectionRequest", connectionRequestSchema);
module.exports = ConnectionRequestModel;
