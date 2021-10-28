// OLD IMPORT SYNTAX const express = require("express")
import express from "express" // NEW IMPORT SYNTAX (remember to add type: "module" in package.json to use new syntax)
import listEndpoints from "express-list-endpoints"
import cors from "cors"
import { join } from "path"
import swaggerUI from "swagger-ui-express"
import yaml from "yamljs"

import studentsRouter from "./services/students/index.js"
import booksRouter from "./services/books/index.js"
import filesRouter from "./services/files/index.js"

import { genericErrorHandler, badRequestHandler, unauthorizedHandler, notFoundHandler } from "./errorHandlers.js"
import createHttpError from "http-errors"

const server = express()

const publicFolderPath = join(process.cwd(), "./public")

const yamlDocument = yaml.load(join(process.cwd(), "./src/apiDescription.yml"))

// *********************** GLOBAL MIDDLEWARES *********************

const loggerMiddleware = (req, res, next) => {
  console.log(`Req method ${req.method} -- Req URL ${req.url} -- ${new Date()}`)
  next()
}

const authorizationMiddleware = (req, res, next) => {
  if (true) {
    next()
  } else {
    res.status(401).send({ message: "YOU ARE NOT AUTHORIZED!" })
  }
}

/*

CORS = CROSS ORIGIN RESOURCE SHARING

What is an origin?

1. Two different domains they represent different origins
http://mywonderfulapp.com is different origin than http://google.com

2. Two different port numbers they represent different origins
http://localhost:3000 is different origin than http://localhost:3001

3. Two different protocols they represent different origins
http://mywonderfulapp.com is different origin than https://mywonderfulapp.com

By default browsers are blocking all those http requests which are not on the same origin. With CORS we can relax those safety measures
*/

const whitelist = [process.env.FE_LOCAL_URL, process.env.FE_PROD_URL]
const corsOpts = {
  origin: function (origin, next) {
    // Since CORS is a global middleware, it is going to be executed for each and every request --> we are able to "detect" the origin of each and every req from this function
    console.log("CURRENT ORIGIN: ", origin)
    if (!origin || whitelist.indexOf(origin) !== -1) {
      // If origin is in the whitelist or if the origin is undefined () --> move ahead
      next(null, true)
    } else {
      // If origin is NOT in the whitelist --> trigger a CORS error
      next(new Error("CORS ERROR"))
    }
  },
}

server.use(cors(corsOpts)) // You need this if you want to make the FE communicate with BE
server.use(express.static(publicFolderPath))
// server.use(authorizationMiddleware)
server.use(express.json()) // If I do NOT specify this line BEFORE the endpoints, all the requests' bodies will be UNDEFINED
server.use(loggerMiddleware)

// ************************ ENDPOINTS **********************

server.use("/students", studentsRouter) // all of the endpoints which are in the studentsRouter will have /students as a prefix
server.use("/books", booksRouter)
server.use("/files", filesRouter)
server.use("/docs", swaggerUI.serve, swaggerUI.setup(yamlDocument))

// *********************** ERROR MIDDLEWARES ***************************

server.use(badRequestHandler)
server.use(unauthorizedHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)

const port = process.env.PORT // check if dotenv package is installed and USED ( -r dotenv/config)

console.table(listEndpoints(server))

server.listen(port, () => {
  console.log("Server running on port:", port)
})
