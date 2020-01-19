 //Initiallising node modules
 var express = require("express");
 var bodyParser = require("body-parser");
 var sql = require("mssql");
 var app = express();

 // Body Parser Middleware
 app.use(bodyParser.json());

 //Setting up server
 var server = app.listen(process.env.PORT || 8080, function() {
     var port = server.address().port;
     console.log("App now running on port", port);
 });

 //Initiallising connection string
 var dbConfig = {
     user: "SA",
     password: "Sqlserver#1",
     server: "localhost",
     database: "testdb"
 };

 //Function to connect to database and execute query
 var executeQuery = function(res, query) {
     sql.connect(dbConfig, function(err) {
         if (err) {
             console.log("Error while connecting database :- " + err);
             res.send(err);
         } else {
             console.log("db connection: success");
             var request = new sql.Request();
             request.query(query, function(err, dbresponse) {
                 if (err) {
                     console.log("Error while querying database :- " + err);
                     res.send(err);
                 } else {
                     console.log("Exec query: success");
                     res.send(dbresponse);
                 }
             });
         }
     });
 }

 //GET API
 app.get("/api/per", function(req, res) {
     var query = "select * from Persons";
     executeQuery(res, query);
 });

 //POST API
 app.post("/api/user", function(req, res) {

 });

 //PUT API
 app.put("/api/user/:id", function(req, res) {

 });

 // DELETE API
 app.delete("/api/user /:id", function(req, res) {

 });
