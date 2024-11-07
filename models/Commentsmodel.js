const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usersmodel",
      required: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booksmodel",
      required: true,
    },
    comments: {
      type: String,
      required: true,
    },
    rate: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  { timestamps: true, strict: true }
);

module.exports = mongoose.model("Commentsmodel", CommentSchema, "comments");
