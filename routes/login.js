{
  /*const express = require("express");
const login = express.Router();
const UserModel = require("../models/Usersmodel");
const bcrypt = require("bcrypt");

login.post("/login", async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).send({
        statusCode: 404,
        message: "wrong email",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(403).send({
        statusCode: 403,
        message: "password is not valid",
      });
    }

    res.status(200).send({
      statusCode: 200,
      message: "Login successful",
      userId: user._id,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "something went wrong",
    });
  }
});

module.exports = login;*/
}

const express = require("express");
const login = express.Router();
const UserModel = require("../models/Usersmodel");

login.post("/login", async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).send({
        statusCode: 404,
        message: "wrong email",
      });
    }

    // Controlla la password in testo semplice (NON SICURO)
    if (req.body.password !== user.password) {
      return res.status(403).send({
        statusCode: 403,
        message: "password is not valid",
      });
    }

    res.status(200).send({
      statusCode: 200,
      message: "Login successful",
      userId: user._id,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "something went wrong",
    });
  }
});

module.exports = login;
