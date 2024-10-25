const express = require("express");
const users = express.Router();
const UserModel = require("../models/Usersmodel");

users.get("/users", async (req, res) => {
  try {
    const users = await UserModel.find();
    if (users.length === 0) {
      return res.status(404).send({
        statusCode: 404,
        message: "User not found",
      });
    }
    res.status(200).send({
      statusCode: 200,
      users,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Something went wrong",
    });
  }
});

users.get("/users/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).send({
      statusCode: 400,
      message: "User ID is required",
    });
  }
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).send({
        statusCode: 404,
        message: "User ID not Found",
      });
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Something went wrong",
    });
  }
});

users.post("/users/create", async (req, res) => {
  console.log(req.body);
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
      message: "User saved successfulluy",
      user,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Something went wrong",
    });
  }
});

users.put("/users/put/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).send({
      statusCode: 400,
      message: "User Id Is required",
    });
  }

  try {
    const user = await UserModel.findByIdAndUpdate(userId);

    if (!user) {
      return res.status(404).send({
        statusCode: 404,
        message: "The user was not successfully modified!",
      });
    }
    res.status(200).send({
      statusCode: 200,
      message: "User modified successfully",
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Something went wrong",
    });
  }
});

users.delete("/users/delete/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).send({
      statusCode: 400,
      message: "User ID is required",
    });
  }

  try {
    const user = await UserModel.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).send({
        statusCode: 404,
        message: "User not found with the given userId",
      });
    }

    res.status(200).send({
      statusCode: 200,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Something went wrong",
    });
  }
});

module.exports = users;
