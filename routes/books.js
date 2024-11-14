const express = require("express");
const mongoose = require("mongoose");
const Usersmodel = require("../models/Usersmodel");
const Booksmodel = require("../models/Booksmodel");
const books = express.Router();
const isArrayEmpty = require("../utiles/checkArrayLength");
const manageErrorMessage = require("../utiles/menageErrorMessage");
const { upload, cloud } = require("../middleware-be/multerMiddleware");

books.get("/books", async (req, res) => {
  const { page = 1, pageSize = 200 } = req.query;
  try {
    const books = await Booksmodel.find()
      .limit(pageSize)
      .skip((page - 1) * pageSize)
      .lean()
      .populate({
        path: "author",
        select: "email username",
      })
      .populate("comments");

    if (isArrayEmpty(books)) {
      return res.status(404).send({
        statusCode: 404,
        message: "No books found",
      });
    }

    res.status(200).send({
      statusCode: 200,
      message: `books found: ${books.length}`,
      books,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: manageErrorMessage(error),
    });
  }
});

books.get("/book/search/:title", async (req, res) => {
  const { title } = req.params;
  const { page = 1, pageSize = 10 } = req.query;

  if (!title) {
    return res.status(400).send({
      statusCode: 400,
      message: "Title is required",
    });
  }

  try {
    const escapeRegex = (str) => str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`.*${escapeRegex(title)}.*`, "i");
    const books = await Booksmodel.find({
      title: {
        $regex: regex,
      },
    })
      .limit(pageSize)
      .skip((page - 1) * pageSize);

    const count = await Booksmodel.countDocuments({
      title: {
        $regex: ".*" + title + ".*",
        $options: "i",
      },
    });

    const totalPages = Math.ceil(count / pageSize);

    if (isArrayEmpty(books)) {
      return res.status(404).send({
        statusCode: 404,
        message: "Title not Found",
        title,
      });
    }

    res.status(200).send({
      statusCode: 200,
      message: `Books Found: ${books.length}`,
      count,
      totalPages,
      books,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: error.message,
    });
  }
});

books.get("/book/:bookId", async (req, res) => {
  const { bookId } = req.params;

  try {
    const book = await Booksmodel.findById(bookId).lean().populate("comments");

    if (!book) {
      return res.status(400).send({
        statusCode: 400,
        message: "Book not found with given ID",
      });
    }

    if (book.price instanceof mongoose.Types.Decimal128) {
      book.price = parseFloat(book.price.toString());
    }

    res.status(200).send(book);
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

books.post("/books/:bookId/create/comment", async (req, res) => {
  try {
    const comment = new Commentsmodel({
      author: req.body.author,
      book: req.params.bookId,
      comments: req.body.comment,
      rate: req.body.rate,
    });
    await comment.save();

    const book = await Booksmodel.findByIdAndUpdate(
      req.params.bookId,
      { $push: { comments: comment._id } },
      { new: true }
    ).populate("comments");

    res.status(201).send({
      statusCode: 201,
      message: "Comment created",
      comment,
      book,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

books.post("/books/create", async (req, res, next) => {
  const { title, asin, category, price, img } = req.body;

  if (!title || !asin || !category || !price || !img) {
    return res.status(400).send({
      statusCode: 400,
      message: "Missing required fields: title, asin, price, img, asin",
    });
  }

  try {
    const newBook = new Booksmodel({
      title,
      category,
      asin,
      price: Number(req.body.price),
      img,
    });

    const book = await newBook.save();

    res.status(201).send({
      statusCode: 201,
      message: "Book created successfully",
      book,
    });
  } catch (error) {
    next(error);
  }
});

books.patch("/book/update/:bookId", async (req, res) => {
  const { bookId } = req.params;
  const bookExist = await Booksmodel.findById(bookId);

  if (!bookExist) {
    return res.status(400).send({
      statusCode: 400,
      message: "Book not found with given ID",
    });
  }

  try {
    const updatedBookData = req.body;

    if (updatedBookData.price) {
      updatedBookData.price = mongoose.Types.Decimal128.fromString(
        updatedBookData.price
      );
    }

    const options = { new: true };

    const result = await Booksmodel.findByIdAndUpdate(
      bookId,
      updatedBookData,
      options
    );

    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

books.delete("/book/:bookId", async (req, res) => {
  const { bookId } = req.params;

  try {
    const deletedBook = await Booksmodel.findByIdAndDelete(bookId);

    if (!deletedBook) {
      return res.status(404).send({
        statusCode: 404,
        message: "Book not found with given ID",
      });
    }

    res.status(200).send({
      statusCode: 200,
      message: "Book deleted successfully",
      deletedBook,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

//local
books.post("/books/upload", upload.single("img"), async (req, res, next) => {
  try {
    const url = `${req.protocol}://${req.get("host")}`;
    const imgUrl = req.file.filename;
    res.status(200).json({ img: `${url}/uploads/${imgUrl}` });
  } catch (error) {
    next(error);
  }
});

//cloud
books.post(
  "/books/upload/cloud",
  cloud.single("img"),
  async (req, res, next) => {
    try {
      res.status(200).json({ img: req.file.path });
    } catch (error) {
      next(error);
    }
  }
);

//update model
books.patch("/books/updateModel", async (req, res, next) => {
  await Booksmodel.updateMany(
    { comments: { $exists: false } },
    { $set: { comments: [] } }
  );
});

module.exports = books;
