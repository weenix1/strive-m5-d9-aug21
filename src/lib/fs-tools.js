import fs from "fs-extra" // fs-extra gives us same methods of fs (plus some extras) and gives us PROMISES!
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const { readJSON, writeJSON, writeFile, createReadStream } = fs // readJSON and writeJSON are not part of the "normal" fs module

const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data")

export const booksJSONPath = join(dataFolderPath, "books.json")
const studentsJSONPath = join(dataFolderPath, "students.json")
const publicFolderPath = join(process.cwd(), "./public/img/students") // process.cwd() gives me back the path to the folder in which the package.json is (ROOT OF THE PROJECT)

export const getBooks = () => readJSON(booksJSONPath)
export const writeBooks = content => writeJSON(booksJSONPath, content)
export const getStudents = () => readJSON(studentsJSONPath)
export const writeStudents = content => writeJSON(studentsJSONPath, content)

export const saveStudentsPictures = (fileName, contentAsBuffer) => writeFile(join(publicFolderPath, fileName), contentAsBuffer)

export const getBooksReadableStream = () => createReadStream(booksJSONPath)
// getBooks().then().catch()

// await getBooks()
