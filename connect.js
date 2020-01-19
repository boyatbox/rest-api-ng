var Connection = require('tedious').Connection;
var config = {
    server: 'localhost',
    authentication: {
        type: 'default',
        options: {
            userName: 'SA',
            password: 'Sqlserver#1'
        }
    },
    options: {
        database: 'testdb',
        rowCollectionOnDone: true,
        useColumnNames: false
    }
}
var connection = new Connection(config);
connection.on('connect', function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log('Connected');
    }
});
module.exports = connection;
