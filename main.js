require("dotenv").config();
const express = require("express");
const cors = require("cors");
const usersRoute = require("./routes/users");
const loginRoute = require("./routes/login");
const booksRoute = require("./routes/books");
const init = require("./db");

const PORT = 4500;
const server = express();
server.use(cors());
server.use(express.json());
server.use("/", usersRoute);
server.use("/", loginRoute);
server.use("/", booksRoute);

init();

server.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));
