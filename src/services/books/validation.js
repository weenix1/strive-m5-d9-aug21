import { body } from "express-validator"

export const booksValidationMiddlewares = [body("title").exists().withMessage("Title is a mandatory field!")]
