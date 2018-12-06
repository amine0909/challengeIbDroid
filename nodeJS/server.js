const express = require("express")
const mysql = require("mysql")
const bodyParser = require('body-parser')
const connection  = require("./config")
const PORT = process.env.PORT || 3000
const app = express()



/* we need this For POST Method */ 
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


/*
 * Database table creation
 * 
 * 
 */

 app.get("/db", (req,res) => {
    createDB()
 })

function createDB() {
    // connect to the MySQL server
connection.connect(function(err) {
    if (err) {
      return console.error('error: ' + err.message);
    }
   
    // create your normal sql query here
    let createTodos = `Alter table feedbacks
                        Add constraint FK_feedback_societe
                        FOREIGN KEY (societe_id) REFERENCES societett (id)
                        
                        `;
   
    connection.query(createTodos, function(err, results, fields) {
      if (err) {
        console.log(err.message);
      }

      console.log("tables created")
    });
   
    connection.end(function(err) {
      if (err) {
        return console.log(err.message);
      }
    });
  });
 }
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})