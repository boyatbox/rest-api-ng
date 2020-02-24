 //Initiallising node modules
 var express = require("express");
 var bodyParser = require("body-parser");
 var sql = require("mssql/msnodesqlv8");
 var sql = require("mssql/msnodesqlv8");
 var app = express();
 const stringify = require('csv-stringify');

 // Body Parser Middleware
 app.use(bodyParser.json());

 //CORS Middleware
 app.use(function(req, res, next) {
     //Enabling CORS 
     res.header("Access-Control-Allow-Origin", "*");
     res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
     next();
 });

 //Setting up server
 var server = app.listen(process.env.PORT || 8080, function() {
     var port = server.address().port;
     console.log("App now running on port", port);
 });

 //Initiallising connection string
 var dbConfig = {
    connectionString: 'Driver=SQL Server;Server=DESKTOP-OVIBE68;Database=testdb;Trusted_Connection=true;'
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
                     res.send(JSON.stringify(dbresponse.recordsets[0]));
                     //res.send(JSON.stringify(dbresponse));
                     //res.send(dbresponse);
                 }
             });
         }
     });
 }

 //GET API
 app.get("/api/per", function(req, res) {
     var query = "select * from restdb.dbo.stocks";
     executeQuery(res, query);
 });

 //POST API
 app.get("/api/app", function(req, res) {
    var query = "SELECT pf.Portfolio_ID,vsam.ValueStream_ID,ci.CI_Application_ID,pf.Portfolio_Name,vs.ValueStream_Name,ci.CI_Application_Name\
                FROM CI_Application ci, VS_CI_Application_Map vsam, ValueStream vs, Portfolio pf,Portfolio_VS_Map pvm\
                WHERE vsam.CI_Application_ID = ci.CI_Application_ID\
                AND vs.ValueStream_ID=vsam.ValueStream_ID\
                AND vs.ValueStream_ID=pvm.ValueStream_ID\
                AND pvm.Portfolio_ID=pf.Portfolio_ID";
     executeQuery(res, query);

 });

  app.get("/api/csv", function(req, res) {
    var query = "SELECT * FROM CI_Application";
     executeQuery(res, query);

 });
 
 //PUT API
 app.put("/api/user/:id", function(req, res) {

 });

 // DELETE API
 app.delete("/csv", function(req, res) {

 });


app.get("/csv", function (req, res) {


	var query = "SELECT * FROM CI_Application";
	executeQueryCsv(res, query);
});

//------------------------------------------//

 var executeQueryCsv = function(res, query) {
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
						const json2csv = require('json2csv').parse;
						const posts = require('../posts.json');
						const csvString = json2csv(dbresponse.recordsets[0]);
						res.setHeader('Content-disposition', 'attachment; filename=shifts-report.csv');
						res.set('Content-Type', 'text/csv');
						res.status(200).send(csvString);
                 }
             });
         }
     });
 }