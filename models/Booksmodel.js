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
      type: mongoose.Types.Decimal128, // Usa Decimal128 per memorizzare valori decimali
      required: true,
    },
    category: {
      type: String,
      enum: ALLOWED_CATEGORIES,
      required: true,
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

module.exports = mongoose.model("booksModel", BookSchema, "books");
