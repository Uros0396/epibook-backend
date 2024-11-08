const express = require("express");
const mongoose = require("mongoose");
const Usersmodel = require("../models/Usersmodel");
const users = express.Router();
const isArrayEmpty = require("../utiles/checkArrayLength");
const manageErrorMessage = require("../utiles/menageErrorMessage");
const { upload, cloud } = require("../middleware-be/multerMiddleware");

users.get("/users", async (req, res) => {
  const { page = 1, pageSize = 20 } = req.query;
  try {
    const users = await Usersmodel.find()
      .limit(pageSize)
      .skip((page - 1) * pageSize)
      .lean()
      .populate("books");

    if (isArrayEmpty(users)) {
      return res.status(404).send({
        statusCode: 404,
        message: "No users found",
      });
    }

    res.status(200).send({
      statusCode: 200,
      message: `Users found: ${users.length}`,
      users,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: manageErrorMessage(error),
    });
  }
});

users.get("/user/search/:username", async (req, res) => {
  const { username } = req.params;
  const { page = 1, pageSize = 10 } = req.query;

  if (!username) {
    return res.status(400).send({
      statusCode: 400,
      message: "Username is required",
    });
  }

  try {
    const regex = new RegExp(`.*${username}.*`, "i");
    const users = await Usersmodel.find({ username: { $regex: regex } })
      .limit(pageSize)
      .skip((page - 1) * pageSize)
      .populate("books");

    const count = await Usersmodel.countDocuments({
      username: { $regex: regex, $options: "i" },
    });
    const totalPages = Math.ceil(count / pageSize);

    if (isArrayEmpty(users)) {
      return res.status(404).send({
        statusCode: 404,
        message: "Username not found",
      });
    }

    res.status(200).send({
      statusCode: 200,
      message: `Users found: ${users.length}`,
      count,
      totalPages,
      users,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: manageErrorMessage(error),
    });
  }
});

users.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await Usersmodel.findById(userId).lean().populate("books");

    if (!user) {
      return res.status(404).send({
        statusCode: 404,
        message: "User not found with given ID",
      });
    }

    res.status(200).send(user);
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: manageErrorMessage(error),
    });
  }
});

users.post("/users/create", async (req, res) => {
  const newUser = new Usersmodel({
    name: req.body.name,
    surname: req.body.surname,
    email: req.body.email,
    dob: req.body.dob,
    password: req.body.password,
    username: req.body.username,
    gender: req.body.gender,
    address: req.body.address,
  });

  try {
    const savedUser = await newUser.save();
    res.status(201).send({
      statusCode: 201,
      message: "User created successfully",
      savedUser,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: manageErrorMessage(error),
    });
  }
});

users.patch("/user/update/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const updatedUser = await Usersmodel.findByIdAndUpdate(userId, req.body, {
      new: true,
    }).populate("books");

    if (!updatedUser) {
      return res.status(404).send({
        statusCode: 404,
        message: "User not found with given ID",
      });
    }

    res.status(200).send({
      statusCode: 200,
      message: "User updated successfully",
      updatedUser,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: manageErrorMessage(error),
    });
  }
});

users.delete("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const deletedUser = await Usersmodel.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).send({
        statusCode: 404,
        message: "User not found with given ID",
      });
    }

    res.status(200).send({
      statusCode: 200,
      message: "User deleted successfully",
      deletedUser,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: manageErrorMessage(error),
    });
  }
});

users.post("/users/upload", upload.single("img"), async (req, res, next) => {
  try {
    const url = `${req.protocol}://${req.get("host")}`;
    const imgUrl = req.file.filename;
    res.status(200).json({ img: `${url}/uploads/${imgUrl}` });
  } catch (error) {
    next(error);
  }
});

users.post(
  "/users/upload/cloud",
  cloud.single("img"),
  async (req, res, next) => {
    try {
      res.status(200).json({ img: req.file.path });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = users;
