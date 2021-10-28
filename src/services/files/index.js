import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import { pipeline } from "stream";
import { createGzip } from "zlib";
import json2csv from "json2csv";

import { getBooksReadableStream } from "../../lib/fs-tools.js";
import { getPDFReadableStream, generatePDFAsync } from "../../lib/pdf-tools.js";

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary, // CREDENTIALS, this line of code is going to search in your process.env for something called CLOUDINARY_URL
  params: {
    folder: "strive-books",
  },
});

import { saveStudentsPictures } from "../../lib/fs-tools.js";

const filesRouter = express.Router();

filesRouter.post(
  "/:studentID/uploadSingle",
  multer().single("profilePic"),
  async (req, res, next) => {
    try {
      console.log(req.file);

      await saveStudentsPictures(req.file.originalname, req.file.buffer);
      res.send("ok");
    } catch (error) {
      next(error);
    }
  }
);

filesRouter.post(
  "/uploadMultiple",
  multer().array("profilePic"),
  async (req, res, next) => {
    try {
      console.log(req.files);

      const arrayOfPromises = req.files.map((file) =>
        saveStudentsPictures(file.originalname, file.buffer)
      );
      await Promise.all(arrayOfPromises);
      res.send("OK");
    } catch (error) {
      next(error);
    }
  }
);

filesRouter.post(
  "/uploadCloudinary",
  multer({ storage: cloudinaryStorage }).single("profilePic"),
  async (req, res, next) => {
    try {
      console.log(req.file);
      res.send("Image uploaded on Cloudinary");
    } catch (error) {
      next(error);
    }
  }
);

filesRouter.get("/downloadJSON", async (req, res, next) => {
  try {
    // SOURCE (file on disk, request, ....) --> DESTINATION (file on disk, terminal, response...)

    // In this example we are going to have: SOURCE (file on disk --> books.json) --> DESTINATION (response)

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=whatever.json.gz"
    ); // This header tells the browser to do not open the file, but to download it

    const source = getBooksReadableStream();
    const transform = createGzip();
    const destination = res;

    pipeline(source, transform, destination, (err) => {
      if (err) next(err);
    });
  } catch (error) {
    next(error);
  }
});

filesRouter.get("/downloadPDF", (req, res, next) => {
  try {
    res.setHeader("Content-Disposition", "attachment; filename=whatever.pdf"); // This header tells the browser to do not open the file, but to download it

    const source = getPDFReadableStream({ firstName: "Zee" }); // PDF READABLE STREAM
    const destination = res;

    pipeline(source, destination, (err) => {
      if (err) next(err);
    });
  } catch (error) {
    next(error);
  }
});

filesRouter.get("/downloadCSV", (req, res, next) => {
  try {
    res.setHeader("Content-Disposition", "attachment; filename=books.csv");
    const source = getBooksReadableStream();
    const transform = new json2csv.Transform({
      fields: ["asin", "title", "price", "category"],
    });
    const destination = res;

    pipeline(source, transform, destination, (err) => {
      if (err) next(err);
    });
  } catch (error) {
    next(error);
  }
});

filesRouter.get("/PDFAsync", async (req, res, next) => {
  try {
    // 1. Generate the PDF (with pdfmake)
    const path = await generatePDFAsync({});
    // 2. Do stuff with the generated PDF (example --> send it as an attachment to email)

    res.send(path);
  } catch (error) {
    next(error);
  }
});

export default filesRouter;
