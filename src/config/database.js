// Logic to connect to our Database
// To communicate with the DB we will be using a npm package called Mongoose. Mongoose is standaradly used while building the MERN stack applications.

const mongoose = require("mongoose");

// Mongoose.connect returns a promise. It is better to wrap it inside an Async function.
const connectDB = async () => {
  await mongoose.connect(process.env.DB_CONNECTION_STRING); // Connecting to cluster within a DB
};

module.exports = connectDB;
