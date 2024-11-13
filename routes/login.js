const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Usersmodel = require("../models/Usersmodel");
const login = express.Router();

const manageErrorMessage = require("../utiles/menageErrorMessage");

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

    const checkPassword = await bcrypt.compare(
      request.body.password,
      user.password
    );

    if (!checkPassword) {
      return response.status(401).send({
        statusCode: 401,
        message: "Password or email not valid",
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
    console.error("Error during login:", error);
    response.status(500).send({
      statusCode: 500,
      message: manageErrorMessage(error),
    });
  }
});

module.exports = login;
