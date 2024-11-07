const mongoose = require("mongoose");
const ALLOWED_CATEGORIES = ["fantasy", "horror", "scifi", "romance", "history"];

const BookSchema = new mongoose.Schema(
  {
    asin: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    img: {
      type: String,
      required: false,
      default: "https://placehold.co/600x400",
    },
    price: {
      type: mongoose.Types.Decimal128,
      required: true,
    },
    category: {
      type: String,
      enum: ALLOWED_CATEGORIES,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usersmodel",
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Commentsmodel",
      },
    ],
  },

  {
    timestamps: true,
    strict: true,
  }
);

module.exports = mongoose.model("Booksmodel", BookSchema, "books");
