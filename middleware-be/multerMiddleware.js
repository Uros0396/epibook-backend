const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "SERVERCLOUDUPLOADS",
    allowed_formats: ["jpg", "png", "gif", "mp4"],
    format: async (req, file) => "png",
    public_id: (req, file) => file.name,
  },
});

const internalStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const suffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = file.originalname.split(".").pop();
    cb(null, `${file.fieldname}-${suffix}.${fileExtension}`);
  },
});

const upload = multer({ storage: internalStorage });
const cloud = multer({ storage: cloudStorage });

module.exports = { upload, cloud };

/*const multer = require("multer");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configurazione di Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Usa le variabili d'ambiente per la sicurezza
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configurazione dello storage per multer usando Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads", // Puoi cambiare il nome della cartella su Cloudinary
    allowed_formats: ["jpg", "png", "jpeg"], // Formati consentiti
  },
});

// Creazione del middleware di upload
const upload = multer({ storage });

// Esportazione del middleware di upload
module.exports = upload;*/
