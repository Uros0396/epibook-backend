{
  /*require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const usersRoute = require("./routes/users");
const loginRoute = require("./routes/login");
const booksRoute = require("./routes/books");
const commentsRoute = require("./routes/comment");
const init = require("./db");

const PORT = 4500;
const server = express();

server.use("/uploads", express.static(path.join(__dirname, "./uploads")));
server.use(cors());
server.use(express.json());

server.use("/", usersRoute);
server.use("/", loginRoute);
server.use("/", booksRoute);
server.use("/", commentsRoute);

const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.status === 400) {
    return res.status(400).json({ message: "Richiesta non valida!" });
  }
  if (err.status === 401) {
    return res.status(401).json({ message: "Accesso non autorizzato!" });
  }
  if (err.status === 404) {
    return res.status(404).json({ message: "Risorsa non trovata!" });
  }

  return res.status(500).json({ message: "Qualcosa è andato storto!" });
};

init();

server.use(errorHandler);

server.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));*/
}

require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const usersRoute = require("./routes/users");
const loginRoute = require("./routes/login");
const booksRoute = require("./routes/books");
const commentsRoute = require("./routes/comment");
const init = require("./db");

const PORT = 4500;
const server = express();

// Middleware per la gestione delle richieste statiche
server.use("/uploads", express.static(path.join(__dirname, "./uploads")));

// Middleware per CORS e parsing del JSON
server.use(cors());
server.use(express.json()); // Assicurati che questa riga sia qui

// Definizione delle rotte
server.use("/", usersRoute);
server.use("/", loginRoute);
server.use("/", booksRoute);
server.use("/", commentsRoute);

// Middleware per la gestione degli errori
const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.status === 400) {
    return res.status(400).json({ message: "Richiesta non valida!" });
  }
  if (err.status === 401) {
    return res.status(401).json({ message: "Accesso non autorizzato!" });
  }
  if (err.status === 404) {
    return res.status(404).json({ message: "Risorsa non trovata!" });
  }

  return res.status(500).json({ message: "Qualcosa è andato storto!" });
};

// Inizializzazione del database
init();

// Middleware per la gestione degli errori
server.use(errorHandler);

// Avvio del server
server.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));
