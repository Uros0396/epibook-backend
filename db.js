const mongoose = require("mongoose");
require("dotenv").config();

const DB_URI = process.env.DB_URI;

const init = async () => {
  try {
    await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

module.exports = init;
