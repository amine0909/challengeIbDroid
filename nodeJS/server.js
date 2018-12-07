const express = require("express")
const mysql = require("mysql")
const bodyParser = require('body-parser')
const connection  = require("./config")
const PORT = process.env.PORT || 3000
const app = express()


// register routers
const registerClient = require("./register")
const loginClient = require("./login")
const reservation = require("./reservation")


/* we need this For POST Method */ 
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use("/api",registerClient)
app.use("/api",loginClient)
app.use("/api",reservation)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})