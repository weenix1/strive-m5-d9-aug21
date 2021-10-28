import PdfPrinter from "pdfmake"
import { pipeline } from "stream"
import { promisify } from "util" // CORE MODULE
import fs from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"

export const getPDFReadableStream = data => {
  const fonts = {
    Helvetica: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
      // italics: "fonts/Roboto-Italic.ttf",
      // bolditalics: "fonts/Roboto-MediumItalic.ttf",
    },
  }

  const printer = new PdfPrinter(fonts)

  const docDefinition = {
    content: [data.firstName, "Another paragraph, this time a little bit longer to make sure, this line will be divided into at least two lines"],
    defaultStyle: {
      font: "Helvetica",
    },
    // ...
  }

  const options = {
    // ...
  }

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition, options)
  // pdfReadableStream.pipe(fs.createWriteStream('document.pdf')); // old syntax for piping
  // pipeline(pdfReadableStream, fs.createWriteStream('document.pdf')) // new syntax for piping (we don't want to pipe pdf into file on disk right now)
  pdfReadableStream.end()
  return pdfReadableStream
}

export const generatePDFAsync = async data => {
  const asyncPipeline = promisify(pipeline) // promisify is a (VERY COOL) utility which transforms a function that uses callbacks (error-first callbacks) into a function that uses Promises (and so Async/Await). Pipeline is a function that works with callbacks to connect 2 or more streams together --> I can promisify a pipeline getting back and asynchronous pipeline

  const fonts = {
    Helvetica: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
      // italics: "fonts/Roboto-Italic.ttf",
      // bolditalics: "fonts/Roboto-MediumItalic.ttf",
    },
  }

  const printer = new PdfPrinter(fonts)

  const docDefinition = {
    content: ["Another paragraph, this time a little bit longer to make sure, this line will be divided into at least two lines"],
    defaultStyle: {
      font: "Helvetica",
    },
    // ...
  }

  const options = {
    // ...
  }

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition, options)
  // pdfReadableStream.pipe(fs.createWriteStream('document.pdf')); // old syntax for piping
  // pipeline(pdfReadableStream, fs.createWriteStream('document.pdf')) // new syntax for piping (we don't want to pipe pdf into file on disk right now)
  pdfReadableStream.end()
  const path = join(dirname(fileURLToPath(import.meta.url)), "example.pdf")
  await asyncPipeline(pdfReadableStream, fs.createWriteStream(path))
  return path
}

// promisify = () => new Promise((res, rej) => pipeline())
