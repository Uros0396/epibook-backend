const express = require("express");
const mongoose = require("mongoose");
const Booksmodel = require("../models/Booksmodel");
const Books1 = express.Router();
const isArrayEmpty = require("../utiles/checkArrayLength");
const manageErrorMessage = require("../utiles/menageErrorMessage");

Books1.get("/books", async (req, res) => {
  const { page = 1, pageSize = 200 } = req.query;
  try {
    const books = await Booksmodel.find()
      .limit(pageSize)
      .skip((page - 1) * pageSize)
      .lean();

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

Books1.get("/books/search/:title", async (req, res) => {
  const { title } = req.params;
  const { page = 1, pageSize = 10 } = req.query;

  if (!title) {
    return res.status(400).send({
      statusCode: 400,
      message: "Title is required",
    });
  }

  try {
    const books = await Booksmodel.find({
      title: {
        $regex: ".*" + title + ".*",
        $options: "i",
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

Books1.get("/book/:bookId", async (req, res) => {
  const { bookId } = req.params;

  try {
    const book = await Booksmodel.findById(bookId).lean();

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

Books1.post("/books/create", async (req, res) => {
  const newBook = new Booksmodel({
    asin: req.body.asin,
    title: req.body.title,
    img: req.body.img,
    price: mongoose.Types.Decimal128.fromString(req.body.price),
    category: req.body.category,
  });

  try {
    const savedBook = await newBook.save();
    res.status(201).send({
      statusCode: 201,
      message: "Book saved",
      savedBook,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

Books1.patch("/book/update/:bookId", async (req, res) => {
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

Books1.delete("/book/:bookId", async (req, res) => {
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

module.exports = Books1;
