// *********************** ALL THE ENDPOINTS DEDICATED TO BOOKS ************************

// 1. CREATE --> POST http://localhost:3001/book (+ body)
// 2. READ --> GET http://localhost:3001/book (+ optional Query Parameters)
// 3. READ --> GET http://localhost:3001/book/:bookId
// 4. UPDATE --> PUT http://localhost:3001/book/:bookId (+ body)
// 5. DELETE --> DELETE http://localhost:3001/book/:bookId

import express from "express"
import uniqid from "uniqid"
import createHttpError from "http-errors"
import { validationResult } from "express-validator"

import { booksValidationMiddlewares } from "./validation.js"
import { getBooks, writeBooks } from "../../lib/fs-tools.js"

const booksRouter = express.Router()

// 1.
booksRouter.post("/", booksValidationMiddlewares, async (req, res, next) => {
  try {
    const errorsList = validationResult(req)

    if (!errorsList.isEmpty()) {
      // If we had validation errors --> we need to trigger Bad Request Error Handler
      next(createHttpError(400, { errorsList }))
    } else {
      const newBook = { ...req.body, createdAt: new Date(), id: uniqid() }
      const books = await getBooks()

      books.push(newBook)

      await writeBooks(books)

      res.status(201).send({ id: newBook.id })
    }
  } catch (error) {
    next(error)
  }
})

// 2.
booksRouter.get("/", async (req, res, next) => {
  try {
    const books = await getBooks()
    console.log(books)
    // throw new Error("KABOOOM!")
    if (req.query && req.query.title) {
      const filteredBooks = books.filter(book => book.title === req.query.title)
      res.send(filteredBooks)
    } else {
      res.send(books)
    }
  } catch (error) {
    next(error)
  }
})

// 3.
booksRouter.get("/:bookId", async (req, res, next) => {
  try {
    const books = await getBooks()
    // throw new Error("KABOOOOOOM!")
    const book = books.find(b => b.id === req.params.bookId)
    if (book) {
      // If book is found we send back 200 with the book
      res.send(book)
    } else {
      // If the book is not found we need to trigger (somehow) the notFoundHandler
      // const err = new Error("Not found error")
      // err.status = 404
      // next(err)
      next(createHttpError(404, `Book with id ${req.params.bookId} not found!`))
    }
  } catch (error) {
    // Errors that happen here need to be 500 errors (Generic Server Error)
    next(error) // If we want to send an error to error handlers I have to use the next function and the error as a parameter
  }
})

// 4.
booksRouter.put("/:bookId", async (req, res, next) => {
  try {
    const books = await getBooks()

    const index = books.findIndex(book => book.id === req.params.bookId)

    const bookToModify = books[index]
    const updatedFields = req.body

    const updatedBook = { ...bookToModify, ...updatedFields }

    books[index] = updatedBook

    await writeBooks(books)

    res.send(updatedBook)
  } catch (error) {
    next(error)
  }
})

// booksRouter.put("/:bookId/image", multer({storage: cloudinaryStorage}).single(), async (req, res, next) => {
//   // modify book with bookId by adding to it cover: req.file.path
// })

// 5.
booksRouter.delete("/:bookId", async (req, res, next) => {
  try {
    const books = await getBooks()

    const remainingBooks = books.filter(book => book.id !== req.params.bookId)

    await writeBooks(remainingBooks)

    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

export default booksRouter
