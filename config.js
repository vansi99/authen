const mysql = require('mysql');

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: '865121',
    database: "test1"
});

con.connect(err => {
    if(err) {
        console.log(err);
    }
    else {
        console.log('connected!')
    }
})

module.exports = con;