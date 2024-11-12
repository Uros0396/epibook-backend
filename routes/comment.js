const express = require("express");
const mongoose = require("mongoose");
const comments = express.Router();
const Usersmodel = require("../models/Usersmodel");
const Booksmodel = require("../models/Booksmodel");
const Commentsmodel = require("../models/Commentsmodel");

comments.get("/comment", async (req, res, next) => {
  try {
    const allComments = await Commentsmodel.find().populate("author book");
    res.status(200).send(allComments);
  } catch (error) {
    next(error);
  }
});

comments.get("/comments/:bookId", async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const commentsByBook = await Booksmodel.findById(bookId)
      .populate("comments")
      .select("comments");
    res.status(200).send(commentsByBook);
  } catch (error) {
    next(error);
  }
});

comments.post("/comment/create", async (req, res, next) => {
  console.log("Author ID from request:", authorId);
  console.log("Book ID from request:", bookId);
  const { rate, author: authorId, book: bookId, comments } = req.body;
  try {
    const author = await Usersmodel.findOne({ _id: authorId });
    const book = await Booksmodel.findOne({ _id: bookId });

    if (!author || !book) {
      return res.status(404).send({ message: "Author or book not found" });
    }

    const newComment = new Commentsmodel({
      comments,
      rate,
      author: author._id,
      book: book._id,
    });
    const savedComment = await newComment.save();

    await Booksmodel.updateOne(
      { _id: book._id },
      { $push: { comments: savedComment._id } }
    );

    res.status(201).send(savedComment);
  } catch (error) {
    next(error);
  }
});

comments.put("/comment/:id", async (req, res, next) => {
  try {
    const updatedComment = await Commentsmodel.findByIdAndUpdate(
      req.params.id,
      {
        comment: req.body.comment,
        rate: mongoose.Types.Decimal128.fromString(req.body.rate.toString()),
      },
      { new: true }
    );

    if (!updatedComment) {
      return res.status(404).send({ message: "Comment not found" });
    }

    res.status(200).send(updatedComment);
  } catch (error) {
    next(error);
  }
});

comments.patch("/comment/:id", async (req, res, next) => {
  try {
    const updateFields = {};
    if (req.body.comment) updateFields.comment = req.body.comment;
    if (req.body.rate)
      updateFields.rate = mongoose.Types.Decimal128.fromString(
        req.body.rate.toString()
      );

    const patchedComment = await Commentsmodel.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );

    if (!patchedComment) {
      return res.status(404).send({ message: "Comment not found" });
    }

    res.status(200).send(patchedComment);
  } catch (error) {
    next(error);
  }
});

comments.delete("/comment/:id", async (req, res, next) => {
  try {
    const deletedComment = await Commentsmodel.findByIdAndDelete(req.params.id);

    if (!deletedComment) {
      return res.status(404).send({ message: "Comment not found" });
    }

    await Booksmodel.updateOne(
      { _id: deletedComment.book },
      { $pull: { comment: deletedComment._id } }
    );

    res.status(200).send({ message: "Comment deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = comments;
