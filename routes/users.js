const express = require("express");
const mongoose = require("mongoose");
const Usersmodel = require("../models/Usersmodel");
const users = express.Router();
const isArrayEmpty = require("../utiles/checkArrayLength");
const manageErrorMessage = require("../utiles/menageErrorMessage");
const { upload, cloud } = require("../middleware-be/multerMiddleware");
const bcrypt = require("bcrypt");

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

  if (!username) {
    return res.status(400).send({
      statusCode: 400,
      message: "Username is required",
    });
  }

  try {
    const user = await Usersmodel.findOne({ username });
    if (!user) {
      return res.status(404).send({
        statusCode: 404,
        message: "User not found with given username",
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
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const newUser = new Usersmodel({
    name: req.body.name,
    surname: req.body.surname,
    dob: new Date(req.body.dob),
    email: req.body.email,
    password: hashedPassword,
    username: req.body.username,
    gender: req.body.gender,
    address: req.body.address,
  });

  try {
    const user = await newUser.save();
    res.status(201).send({
      statusCode: 201,
      message: "User created successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
});
module.exports = users;
