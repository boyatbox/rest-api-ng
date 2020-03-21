//Initiallising node modules
//var expressValidator = require("express-validator");
var express = require("express");
var bodyParser = require("body-parser");
var sql = require("mssql/msnodesqlv8");
var app = express();
const port = 8080;
//Configure middleware
app.set('port', process.env.port || port); // set express to use this port
app.use(bodyParser.json());
app.use(function (req, res, next) {
    //Enabling CORS
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
    next();
});
app.listen(port, () => { console.log("Server running on port:" + port); });
//Initiallising connection string
var dbConfig = {
    driver: 'msnodesqlv8',
    connectionString: 'Driver={SQL Server Native Client 11.0};Server=DESKTOP-OVIBE68;Database=Testdb;Trusted_Connection=yes;',
};
//Connect to database
sql.connect(dbConfig, function (err) {
    if (err) {
        console.log("Error while connecting database :- " + err);
        res.send(err);
    } else {
        console.log("Connected to database");
    }
});
//execute query
function executeQuery(res, query) {
    var request = new sql.Request();
    request.query(query, function (err, responseResult) {
        if (err) {
            console.log("Error while executing query :- " + err);
            res.send(err);
        } else {
            console.log("Execute query: success");
            res.send(JSON.stringify(responseResult.recordsets[0]));
        }
    });
}
function executeSql(query) {
    var rc = null;
    var request = new sql.Request();
    request.query(query, function (err, responseResult) {
        if (err) {
            console.log("Error while executing query :- " + err);
            res.send(err);
        } else {
            console.log("Execute query: success");
            console.log(responseResult.recordsets[0]);
            rc = responseResult.recordsets[0].total
            console.log(rc);
        }
    });
    return rc;
}
//GET API
app.get("/api/build", function (req, res) {
    var query = "select * from Testdb.dbo.BuildList";
    executeQuery(res, query);
});
app.get("/api/portfolio", function (req, res) {
    var query = "select Portfolio_ID AS id, Portfolio_Name AS itemName from Testdb.dbo.Portfolio";
    executeQuery(res, query);
});
app.get("/", function (req, res) {
    res.send("App running on port: 8080");
    //var query = "select * from Testdb.dbo.BuildList";
    //executeQuery(res, query);
});
//http://localhost:8080/api/builds?start=1&end=5
//URI,Fandler function
/* app.get("/api/builds", function (req, res) {
                //start = req.query.start;
    //end = req.query.end;
                var startrow=req.query.start;
                var endrow=req.query.end;
                var query = "SELECT * FROM ( SELECT ROW_NUMBER() OVER (ORDER BY Build_ID ) AS RowNum, *  FROM BuildList) AS RowConstrainedResult WHERE RowNum >="+startrow+" AND RowNum <"+endrow+" ORDER BY RowNum";
                executeQuery(res, query);
}); */
//http://localhost:8080/api/pages?page=1&limit=5
app.get("/api/pages", function (req, res) {
    //SELECT * FROM table OFFSET 10 LIMIT 10;
    var page = parseInt(req.query.page, 10);
    if (isNaN(page) || page < 1) {
        page = 1;
    }
    var limit = parseInt(req.query.limit, 10);
    if (isNaN(limit)) {
        limit = 5;
    } else if (limit > 10) {
        limit = 10;
    } else if (limit < 1) {
        limit = 5;
    }
    var query = "SELECT COUNT(Build_ID) AS total FROM BuildList";
    console.log(query);
    var _recordCount = null;
    var request = new sql.Request();
    request.query(query, function (err, responseResult) {
        if (err) {
            console.log("Error while executing query :- " + err);
            res.send(err);
        } else {
            console.log("Execute query: success");
            console.log(responseResult.recordsets[0]);
            _recordCount = responseResult.total;
            console.log(_recordCount);
        }
    });
    //var _recordCount=parseInt(executeSql(query),10);
    console.log("Record count: " + _recordCount);
});
//POST API
//app.post("/api/builds", function (req, res) {
//            var query = "INSERT INTO [user] (Name,Email,Password) VALUES (req.body.Name,req.body.Email,req.body.Password)";
//            executeQuery(res, query);
//});
//PUT API
app.put("/api/builds/:id", function (req, res) {
    var query = "UPDATE [user] SET Name= " + req.body.Name + " , Email=  " + req.body.Email + "  WHERE Id= " + req.params.id;
    executeQuery(res, query);
});
// DELETE API
app.delete("/api/builds/:id", function (req, res) {
    var query = "DELETE FROM [user] WHERE Id=" + req.params.id;
    executeQuery(res, query);
});
app.get("/api/csv", function (req, res) {
    var query = "select * from Testdb.dbo.BuildList";
    executeQueryCsv(res, query);
});
app.post("/api/update", function (req, res) {
    console.log("/api/update");
    var buildId = req.body.id;
    var rca = req.body.rca;
    var query = "UPDATE [Testdb].[dbo].[BuildList] SET Actual_RCA =\'" + rca + "\' WHERE Build_ID = \'" + buildId + "\'";
    console.log(query);
    executeQuery(res, query);
    // for (index = 0; index < build_ids.length; index++) {
    //   buildId=build_ids[index];
    //   if(buildId){
    //     rca=actual_rcas[index];
    //     console.log(rca);
    //     var query="UPDATE [Testdb].[dbo].[BuildList] SET Actual_RCA ="+rca+" WHERE Build_ID = "+ buildId+"";
    //     console.log(query);
    //     //executeQuery (res, query);
    //   }
    //}
});
app.post("/api/approve", function (req, res) {
    console.log("/api/approve");
    var buildId = req.body.id;
    console.log("/api/approve::" + buildId);
    //var query="UPDATE [Testdb].[dbo].[BuildList] SET Actual_RCA =\'"+rca+"\' WHERE Build_ID = \'"+ buildId+"\'";
    var query = "UPDATE [Testdb].[dbo].[BuildList] SET Actual_RCA=(SELECT Predicted_RCA FROM [Testdb].[dbo].[BuildList] WHERE Build_ID=\'" + buildId + "\'), RCA_Review_Status = 'Approved' WHERE Build_ID=\'" + buildId + "\'";
    console.log(query);
    executeQuery(res, query);
    // for (index = 0; index < build_ids.length; index++) {
    //   buildId=build_ids[index];
    //   if(buildId){
    //     rca=actual_rcas[index];
    //     console.log(rca);
    //     var query="UPDATE [Testdb].[dbo].[BuildList] SET Actual_RCA ="+rca+" WHERE Build_ID = "+ buildId+"";
    //     console.log(query);
    //     //executeQuery (res, query);
    //   }
    //}
});
//http://localhost:8080/api/page/?sort=Build_ID&order=asc&pg=2&sz=3
//   app.get("/api/builds", function(req, res) {
//     var page=req.query.pg;
//     var itemsPerPage=req.query.sz;
//     var orderByCol=req.query.sort;
//     var sortOrder=req.query.order;
//     if(sortOrder.toUpperCase() === "DESC"){
//         sortOrder="DESC";
//     }else{
//         sortOrder="ASC";
//     }
//     console.log(itemsPerPage);
//     var offset = (page - 1) * itemsPerPage;
//     console.log("page:"+page+", size:"+itemsPerPage+", offset:"+offset);
//     var query = "SELECT *,COUNT(*) OVER () AS total_count FROM [Testdb].[dbo].[BuildList] ORDER BY "+orderByCol+" "+sortOrder+" OFFSET "+offset+" ROWS FETCH NEXT "+itemsPerPage+" ROWS ONLY;"
//     executeQueryBuilds(res, query);
//  });
app.get("/api/apps", function (req, res) {
    var query = "SELECT pf.Portfolio_ID,vsam.ValueStream_ID,ci.CI_Application_ID,pf.Portfolio_Name,vs.ValueStream_Name,ci.CI_Application_Name\
                FROM CI_Application ci, VS_CI_Application_Map vsam, ValueStream vs, Portfolio pf,Portfolio_VS_Map pvm\
                WHERE vsam.CI_Application_ID = ci.CI_Application_ID\
                AND vs.ValueStream_ID=vsam.ValueStream_ID\
                AND vs.ValueStream_ID=pvm.ValueStream_ID\
                AND pvm.Portfolio_ID=pf.Portfolio_ID";
    sql.connect(dbConfig, function (err) {
        if (err) {
            console.log("Error while connecting database :- " + err);
            res.send(err);
        } else {
            console.log("db connection: success");
            var request = new sql.Request();
            request.query(query, function (err, dbresponse) {
                if (err) {
                    console.log("Error while querying database :- " + err);
                    res.send(err);
                } else {
                    console.log("Exec query: success");
                    var treeData = {};
                    dbresponse = dbresponse.recordsets[0];
                    for (var i in dbresponse) {
                        var pf = dbresponse[i].Portfolio_Name;
                        var vsData = {};
                        for (var j in dbresponse) {
                            if ((pf === dbresponse[j].Portfolio_Name)) {
                                var vs = dbresponse[j].ValueStream_Name;
                                var appData = {};
                                for (var k in dbresponse) {
                                    if ((pf === dbresponse[k].Portfolio_Name) && (vs === dbresponse[k].ValueStream_Name)) {
                                        var app = dbresponse[k].CI_Application_Name;
                                        appData[app] = app;
                                    }
                                }
                                vsData[vs] = appData
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
var executeQueryCsv = function (res, query) {
    sql.connect(dbConfig, function (err) {
        if (err) {
            console.log("Error while connecting database :- " + err);
            res.send(err);
        } else {
            console.log("db connection: success");
            var request = new sql.Request();
            request.query(query, function (err, dbresponse) {
                if (err) {
                    console.log("Error while querying database :- " + err);
                    res.send(err);
                } else {
                    console.log("Exec query: success");
                    const json2csv = require('json2csv').parse;
                    //const posts = require('../posts.json');
                    const csvString = json2csv(dbresponse.recordsets[0]);
                    res.setHeader('Content-disposition', 'attachment; filename=\"' + Date.now() + '.csv\"');
                    res.set('Content-Type', 'text/csv');
                    res.status(200).send(csvString);
                }
            });
        }
    });
}
var executeQueryBuilds = function (res, query) {
    sql.connect(dbConfig, function (err) {
        if (err) {
            console.log("Error while connecting database :- " + err);
            res.send(err);
        } else {
            console.log("db connection: success");
            var request = new sql.Request();
            request.query(query, function (err, dbresponse) {
                if (err) {
                    console.log("Error while querying database :- " + err);
                    res.send(err);
                } else {
                    console.log("Exec query leng: success");
                    //if (dbresponse.length > 0) {
                    if (dbresponse) {
                        jsonArry = dbresponse.recordsets[0];
                        console.log("jsonArry.length: " + jsonArry.length);
                        if (jsonArry.length > 0) {
                            var buildData = {};
                            buildData.total_count = jsonArry[0]['total_count'];
                            for (var i = 0; i < jsonArry.length; i++) {
                                delete jsonArry[i]['total_count'];
                            }
                            buildData.builds = jsonArry;
                            res.send(JSON.stringify(buildData));
                        } else {
                            res.send(JSON.stringify(err));
                        }
                    }
                    //}
                }
            });
        }
    });
}
app.get("/api/builds", function (req, res) {
    console.log("/api/page:" + app);
    var page = req.query.pg;
    var itemsPerPage = req.query.sz;
    var orderByCol = req.query.sort;
    var sortOrder = req.query.order;
    var apps = req.query.app;
    var dateFrom = req.query.dtfrm;
    var dateTo = req.query.dtto;
    var predictedRCA = req.query.prc;
    var buildStatus = req.query.st;
    if (sortOrder.toUpperCase() === "DESC") {
        sortOrder = "DESC";
    } else {
        sortOrder = "ASC";
    }
    var offset = (page - 1) * itemsPerPage;
    console.log("page:" + page + ", size:" + itemsPerPage + ", offset:" + offset);
    console.log("dateFrom:" + dateFrom + ", predictedRCA:" + predictedRCA + ", buildStatus:" + buildStatus);
    var whereClause = "";
    if (apps) {
        var appsin = '\'' + apps.split(',').join('\',\'') + '\'';
        whereClause = "CI_Application_Name IN (" + appsin + ")";
    }
    if (dateFrom && dateTo) {
        whereClause = whereClause + " AND Start_DateTimeStamp BETWEEN \'" + dateFrom + "\' AND \'" + dateTo + "\'";
    }
    if (predictedRCA) {
        var predictedRcaIn = '\'' + predictedRCA.split(',').join('\',\'') + '\'';
        whereClause = whereClause + " AND Predicted_RCA IN (" + predictedRcaIn + ")";
    }

    if (buildStatus) {
        var buildStatusIn = '\'' + buildStatus.split(',').join('\',\'') + '\'';
        whereClause = whereClause + " AND Build_Status IN (" + buildStatusIn + ")";
    }
    if (whereClause.substring(1, 5).trim() === "AND") {
        var whereClause = whereClause.substring(5, whereClause.length).trim();
    }
    //console.log("whereClause1: "+whereClause);
    if (whereClause) {
        whereClause = "WHERE " + whereClause;
    }
    //console.log("whereClause2: "+whereClause);//
    var sql_query = `SELECT *,COUNT(*) OVER () AS total_count FROM [testdb].[dbo].[BuildList] ${whereClause} ORDER BY ${orderByCol} ${sortOrder} OFFSET ${offset} ROWS FETCH NEXT ${itemsPerPage} ROWS ONLY;`
    console.log(sql_query);
    executeQueryBuilds(res, sql_query);
    //http://localhost:8080/api/builds/?sort=Build_ID&order=ASC&pg=1&sz=3&app=CIApplication-AAA&dtfrm=2019-11-01&dtto=2019-11-30&prc=a,b&st=passed,failed
});