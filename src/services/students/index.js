// *********************** ALL THE ENDPOINTS DEDICATED TO STUDENTS ************************

// *********************** STUDENTS CRUD **************************************************

// 1. CREATE --> POST http://localhost:3001/students (+ body)
// 2. READ --> GET http://localhost:3001/students (+ optional Query Parameters)
// 3. READ --> GET http://localhost:3001/students/:studentId
// 4. UPDATE --> PUT http://localhost:3001/students/:studentId (+ body)
// 5. DELETE --> DELETE http://localhost:3001/students/:studentId

import express from "express" // 3RD PARTY MODULE (does need to be installed)
import fs from "fs" // CORE MODULE (doesn't need to be installed)
import { fileURLToPath } from "url" // CORE MODULE (doesn't need to be installed)
import { dirname, join } from "path" // CORE MODULE (doesn't need to be installed)
import uniqid from "uniqid" // 3RD PARTY MODULE (does need to be installed)
import { validationResult } from "express-validator"
import createHttpError from "http-errors"
import { studentValidationMiddlewares } from "./validation.js"
import { sendRegistrationEmail } from "../../lib/email-tools.js"

const studentsRouter = express.Router() // a Router is a set of endpoints that share something like a prefix (studentsRouter is going to share /students as a prefix)

// ********************* how to find out the path *************
// 1. I'll start from the current file I'm in right now (C://......./students/index.js) and I'll get the path to that file
const currentFilePath = fileURLToPath(import.meta.url)
// 2. I'll get the parent folder's path
const parentFolderPath = dirname(currentFilePath)
// 3. I can concatenate the parent's folder path with students.json --> "C:\Strive\FullStack\2021\Aug21\M5\strive-m5-d2-aug21\src\services\students\students.json"
const studentsJSONPath = join(parentFolderPath, "students.json") // DO NOT EVER USE '+' TO CONCATENATE TWO PATHS, USE JOIN INSTEAD

// 1.
studentsRouter.post("/", studentValidationMiddlewares, (req, res, next) => {
  const errorsList = validationResult(req)

  if (!errorsList.isEmpty()) {
    // If we had validation errors --> we need to trigger Bad Request Error Handler
    next(createHttpError(400, { errorsList }))
  } else {
    // First parameter is relative URL, second parameter is the REQUEST HANDLER

    // 1. Read the request body obtaining the new student's data

    const newStudent = { ...req.body, createdAt: new Date(), id: uniqid() }

    // 2. Read the file content obtaining the students array
    const students = JSON.parse(fs.readFileSync(studentsJSONPath))

    // 3. Add new student to the array
    students.push(newStudent)

    // 4. Write the array back to the file
    fs.writeFileSync(studentsJSONPath, JSON.stringify(students))

    // 5. Send back a proper response

    res.status(201).send({ id: newStudent.id })
  }
})

// 2.
studentsRouter.get("/", (req, res, next) => {
  // 1. Read the content of students.json file

  const fileContent = fs.readFileSync(studentsJSONPath) // You are getting back the file content in the form of a BUFFER (machine readable)

  const arrayOfStudents = JSON.parse(fileContent) // JSON.parse is translating buffer into a real JS array
  // 2. Send it back as a response
  res.send(arrayOfStudents)
})

// 3.
studentsRouter.get("/:studentId", (req, res, next) => {
  // 1. Read the content of students.json file (obtaining an array)

  const students = JSON.parse(fs.readFileSync(studentsJSONPath))

  // 2. Find the user by id in the array

  const student = students.find(s => s.id === req.params.studentId) // in the req.params I need to use the exact same name I have used in the "placeholder" in the URL

  // 3. Send the user as a response

  res.send(student)
})

// 4.
studentsRouter.put("/:studentId", (req, res, next) => {
  // 1. Read students.json obtaining an array of students
  const students = JSON.parse(fs.readFileSync(studentsJSONPath))

  // 2. Modify the specified student
  const index = students.findIndex(student => student.id === req.params.studentId)

  const updatedStudent = { ...students[index], ...req.body }

  students[index] = updatedStudent

  // 3. Save the file with updated list of students
  fs.writeFileSync(studentsJSONPath, JSON.stringify(students))

  // 4. Send back a proper response

  res.send(updatedStudent)
})

// studentsRouter.put("/:studentId/profilePic", multer, async (req, res, next) => {
//   try {
// 1. read students.json file
// 2. find student by studentID
// 3. edit the student by adding img: "http://localhost:3001/${studentID}.gif"
// 4. save student back to students.json file
//   } catch (error) {
//     next(error)
//   }
// })

// 5.
studentsRouter.delete("/:studentId", (req, res, next) => {
  // 1. Read students.json obtaining an array of students
  const students = JSON.parse(fs.readFileSync(studentsJSONPath))

  // 2. Filter out the specified student from the array, keeping just the remaining students
  const remainingStudents = students.filter(student => student.id !== req.params.studentId) // ! = =

  // 3. Save the remaining students into students.json file again
  fs.writeFileSync(studentsJSONPath, JSON.stringify(remainingStudents))

  // 4. Send back a proper response
  res.status(204).send()
})

// studentsRouter.get("/whatever", (req, res, next) => {})

studentsRouter.post("/register", async (req, res, next) => {
  try {
    // 1. Receive email address via req.body
    const { email } = req.body

    // 2. Send email on that address
    await sendRegistrationEmail(email)

    // 3. Send ok
    res.send("ok")
  } catch (error) {
    next(error)
  }
})

export default studentsRouter
