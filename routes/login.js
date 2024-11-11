const jwt = require("jsonwebtoken");
const express = require("express");
const login = express.Router();
const Usersmodel = require("../models/Usersmodel");

const isPasswordValid = (userPassword, requestPassword) => {
  if (userPassword === requestPassword) {
    return true;
  } else {
    return false;
  }
};

login.post("/login", async (request, response) => {
  try {
    const user = await Usersmodel.findOne({ email: request.body.email });
    if (!user) {
      return response.status(404).send({
        statusCode: 404,
        message: "User not found with given email",
      });
    }

    const checkPassword = isPasswordValid(user.password, request.body.password);
    console.log(checkPassword);
    if (!checkPassword) {
      return response.status(403).send({
        statusCode: 403,
        message: "Password not valid",
      });
    }

    const payload = {
      name: user.name,
      surname: user.surname,
      email: user.email,
      _id: user._id,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "240m",
    });

    response.status(200).send({
      statusCode: 200,
      token,
    });
  } catch (error) {
    response.status(500).send({
      statusCode: 500,
      message: "Something went wrong",
    });
  }
});

module.exports = login;
