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
    console.log("Login request received:", request.body);
    const user = await Usersmodel.findOne({ email: request.body.email });
    if (!user) {
      console.log("User not found with given email");
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

    response
      .header("Authorized", token)
      .status(200)
      .send({
        statusCode: 200,
        token: token,
        user: {
          name: user.name,
          surname: user.surname,
          email: user.email,
          _id: user._id,
        },
      });
  } catch (error) {
    response.status(500).send({
      statusCode: 500,
      message: "Something went wrong",
    });
  }
});

module.exports = login;
