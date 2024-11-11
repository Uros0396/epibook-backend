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
    const user = await UserModel.findById(userId);
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

users.post("/users/create", async (req, res, next) => {
  const newUser = new UserModel({
    name: req.body.name,
    surname: req.body.surname,
    dob: new Date(req.body.dob),
    email: req.body.email,
    password: req.body.password,
    username: req.body.username,
    gender: req.body.gender,
    address: req.body.address,
  });

  try {
    const user = await newUser.save();
    res.status(201).send({
      statusCode: 201,
      message: "User created successfully",
      savedUser,
    });
  } catch (error) {
    next(error);
  }
});

users.patch("/user/update/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).send({
      statusCode: 400,
      message: "User Id Is required",
    });
  }

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
    next(error);
  }
});

users.delete("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).send({
      statusCode: 400,
      message: "User ID is required",
    });
  }

  try {
    const deletedUser = await Usersmodel.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).send({
        statusCode: 404,
        message: "User not found with given ID",
      });
    }

    console.log("User deleted successfully:", user);
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
    console.error("Error deleting user:", error);
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
