const express = require('express');
const user = express.Router();
const con = require('../config');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const roles = require('../roles');


function getRole (user) {
    if(user.idaccount !== 3)
        return 'student';
    else 
        return 'admin';
}

user.use(cors());

process.env.SECRET_KEY = 'hello';

user.post('/register', (req , res) => {
   con.query('INSERT INTO account(first_name,last_name,email,password) VALUES (?,?,?,?)',[req.body.first_name,req.body.last_name,req.body.email,req.body.password] , (err, rows, fields) => {
       if(!err) {
           console.log('success');
           res.status(201).json({
               message: "success"
           })
           con.query(`CREATE USER '${req.body.email}'@'localhost' IDENTIFIED BY '${req.body.password}'`,(err,row) => {;
                con.query(`GRANT SELECT ON test1.account TO '${req.body.email}'@'localhost'`,(err,row) => {
                    con.query('FLUSH PRIVILEGES');
                    console.log('success grant');
                });
           })
       } else {
           console.log(err);
       }
   });
});

user.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    con.query('SELECT * FROM account WHERE email = ?',[email], (err, rows, fields) => {
        if(err) {
            res.status(400).json({
                "message": "Error Occured"
            })
            console.log(err);
        } else {
            if(rows.length > 0) {
                console.log(rows[0]);
                if(rows[0].password == password) {
                    const token = jwt.sign({idaccount: rows[0].idaccount, email: rows[0].email, first_name: rows[0].first_name},process.env.SECRET_KEY,{
                        expiresIn: 5000
                    })
                    res.status(200).json({
                        message: 'success',
                        accessToken: token
                    });
                } else {
                    res.status(204).json({
                        message: 'Email or password does not match'
                    })
                }
            } else {
                res.status(204).json({
                    message: "Email does not exists!"
                });
            }
        }
    })
});

function verify(req,res, next) {
    const token =  req.body.token || req.headers['token'];
    if(token) {
        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
            if(err){
                return res.status(500).json({
                 message: "token is invalid"
                })
            } else { 
                console.log(decoded);
                req.data=decoded;
                next();
            }
        });
    } else {
        return res.status(403).json({
            message: "Please send a token"
        })
    }
}

user.get('/getUser',verify, (req,res,next) =>{

    try{
        const role = getRole(req.data.idaccount);
        const value = roles.getRoleRoutePrivilegeValue(role, "/users/getUser", "GET");
        console.log(role);
        console.log(value);
        if(value){
            con.query('SELECT * FROM account WHERE idaccount = ?', req.data.idaccount , (err, rows , feilds)=>{
                if(!err){
                    res.status(200).json(rows);
                } else {
                    res.json(204).json({
                        message: "No data found"
                    });
                }
            })
        } else {
            throw "invalid user roles";
        }
    } catch(error){
        throw error;
    }
})

user.put('/update/:fname/:lname',verify, (req,res,next) => {
    try{
        const role = getRole(req.data.idaccount);
        const value = roles.getRoleRoutePrivilegeValue(role, "/users/update/:fname/:lname", "PUT");
        console.log(value);
        console.log(role);
        if(value){
            con.query(`UPDATE account SET last_name = '${req.params.lname}', first_name = '${req.params.first_name}' WHERE idaccount = '${req.data.idaccount}'`, (err,row, feilds) => {
                if(!err) {
                    res.status(200).json(row);
                } else {
                    console.log(err);
                }
            });
        } else {
            throw 'invalid user roles'
        }
    } catch (error){
        console.log(error);
    }
})




module.exports = user;