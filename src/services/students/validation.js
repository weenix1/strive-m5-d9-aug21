import { body } from "express-validator"

export const studentValidationMiddlewares = [
  body("firstName").exists().withMessage("First name is a mandatory field!"),
  body("lastName").exists().withMessage("Last name is a mandatory field!"),
  body("email").exists().withMessage("Email is a mandatory field!").isEmail().withMessage("Email is not in the right format!"),
]
