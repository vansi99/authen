const mysql = require('mysql');

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '865121',
    database: 'qldv'
});

con.connect(function(err) {
    // in case of error
    if (err) {
        console.log(err.code);
        console.log(err.fatal);
    } else {
        console.log('connected!');
    }
});

module.exports = con;