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

//Function to connect to database and execute query
 var executeQueryBuilds = function(res, query) {
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
                    console.log("Exec query leng: success");
                    //if (dbresponse.length > 0) {
                        if (dbresponse){
                            jsonArry=dbresponse.recordsets[0];
                            console.log("jsonArry.length: "+jsonArry.length);
                            if (jsonArry.length>0){
                                var buildData = {};
                                buildData.total_count=jsonArry[0]['total_count'];
                                for(var i = 0; i < jsonArry.length; i++) {
                                    delete jsonArry[i]['total_count'];
                                }
                                buildData.builds=jsonArry;
                                res.send(JSON.stringify(buildData));
                            }else{
                                res.send(JSON.stringify(err));
                            }
                        }
                    //}
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

 app.get("/api/builds", function(req, res) {
     var query = "select * from testdb.dbo.BuildList";
     executeQuery(res, query);
 });

//pg,sz
 //POST API
 //localhost:8080/api/page/?sort=columnname&order=asc&pg=2&sz=3
 //http://localhost:8080/api/page/?sort=Build_ID&order=asc&pg=2&sz=3
 app.get("/api/page", function(req, res) {
    console.log("/api/page:"+app);
    var page=req.query.pg;
    var itemsPerPage=req.query.sz;
    var orderByCol=req.query.sort;
    var sortOrder=req.query.order;
    var apps=req.query.app;
    var dateFrom=req.query.dtfrm;
    var dateTo=req.query.dtto;
    if(sortOrder.toUpperCase() === "DESC"){
        sortOrder="DESC";
    }else{
        sortOrder="ASC";
    }
    var offset = (page - 1) * itemsPerPage;
    console.log("page:"+page+", size:"+itemsPerPage+", offset:"+offset);

    var whereClause="";
    if(apps){
        var appsin = '\'' + apps.split(',').join('\',\'') + '\'';
        whereClause="WHERE CI_Application_Name IN ("+appsin+")";
    }

    if(dateFrom && dateTo){
        if(apps){
            whereClause=whereClause+" AND Start_DateTimeStamp BETWEEN \'"+dateFrom+"\' AND \'"+dateTo+"\'";
        }else{
            whereClause="WHERE Start_DateTimeStamp BETWEEN \'"+dateFrom+"\' AND \'"+dateTo+"\'";
        }
    }

    var _query = "SELECT *,COUNT(*) OVER () AS total_count FROM [testdb].[dbo].[BuildList] #CONDITION# ORDER BY "+orderByCol+" "+sortOrder+" OFFSET "+offset+" ROWS FETCH NEXT "+itemsPerPage+" ROWS ONLY;"    
    var query = _query.replace("#CONDITION#", whereClause);
    console.log("query:"+query);
    executeQueryBuilds(res, query);
    //http://localhost:8080/api/page/?sort=Build_ID&order=ASC&pg=1&sz=3&app=CIApplication-AAA&dtfrm=2019-11-01&dtto=2019-11-30
 });

app.get("/api/json", function(req, res) {
    
    var query = "SELECT pf.Portfolio_ID,vsam.ValueStream_ID,ci.CI_Application_ID,pf.Portfolio_Name,vs.ValueStream_Name,ci.CI_Application_Name\
                FROM CI_Application ci, VS_CI_Application_Map vsam, ValueStream vs, Portfolio pf,Portfolio_VS_Map pvm\
                WHERE vsam.CI_Application_ID = ci.CI_Application_ID\
                AND vs.ValueStream_ID=vsam.ValueStream_ID\
                AND vs.ValueStream_ID=pvm.ValueStream_ID\
                AND pvm.Portfolio_ID=pf.Portfolio_ID";

 


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
                var treeData = {};
                dbresponse=dbresponse.recordsets[0];
                for (var i in dbresponse) {
                    var pf = dbresponse[i].Portfolio_Name;
                    var vsData = {};
                    for (var j in dbresponse) {
                        if((pf===dbresponse[j].Portfolio_Name)){
                            var vs = dbresponse[j].ValueStream_Name;
                            var appData = {};
                            for (var k in dbresponse) {
                                if((pf===dbresponse[k].Portfolio_Name) && (vs===dbresponse[k].ValueStream_Name)){
                                    var app = dbresponse[k].CI_Application_Name;
                                    appData[app]=app;
                                }
                            }
                            vsData[vs]=appData
                        }
                    }
                    treeData[pf] = vsData; 
                }
                res.send(treeData);
                //console.log(treeData);
             }
         });
     }
    });




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