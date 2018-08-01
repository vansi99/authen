const express = require('express');
const router = express.Router();
const con = require('./database');
const jwt = require('jsonwebtoken');
const verifyPrivileges = require('./verifyPrivileges');

function verify(req, res, next) {
    const token = req.headers['token'] || req.body.token;
    console.log(token);
    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(500).json({
                    message: "token is invalid"
                })
            } else {
                req.tokenData = decoded;
                console.log(decoded);
                next();
            }
        })
    } else {
        return res.status(403).json({
            message: "please send a token"
        })
    }
}



router.post('/register', (req, res) => {
    con.query('SELECT * FROM account WHERE user = ?', req.body.user, (err, rows) => {
        if (err) throw err;
        if (rows.length == 0) {
            con.query('INSERT INTO account(id,user,password) VALUES (?,?,?)', [req.body.id, req.body.user, req.body.password], (err, result, feilds) => {
                if (!err) {
                    console.log('success');
                    res.status(201).json({
                        success: true
                    });
                } else {
                    console.log(err);
                }
            });
        } else {
            res.json({
                message: "Your user existed"
            });
        }
    });
});

router.post('/login', (req, res) => {
    const user = req.body.user;
    const password = req.body.password;
    console.log(req);
    con.query('SELECT * FROM account WHERE user = ?', [user], (err, rows, fields) => {
        if (err) {
            res.status(400).json({
                "message": "Error Occured"
            })
            console.log(err);
        } else {
            if (rows.length > 0) {
                console.log(rows[0]);
                if (rows[0].password === password) {
                    const token = jwt.sign({ idaccount: rows[0].id, role: rows[0].role_id }, process.env.SECRET_KEY, {
                        expiresIn: 5000
                    })
                    res.status(200).json({
                        success: true,
                        accessToken: token
                    });
                } else {
                    console.log('false');
                    res.json({
                        success: false,
                        message: 'Tài khoản hoặc mật khẩu không chính xác'
                    });
                }
            } else {
                res.status(204).json({
                    message: "user does not exists!"
                });
            }
        }
    })
})

router.put('/update', verifyPrivileges('sua thong tin nguoi dung'), (req, res) => {
    const email = req.body.email;
    const name = req.body.name;
    console.log(req.tokenData);
    if (req.hasPrivilege) {
        const sql = `UPDATE account SET email = "${email}", full_name = "${name}" WHERE id = 1`;
        con.query(sql, (err, result) => {
            if (err) throw err;
            res.json({
                success: true
            });
        });
    } else {
        res.json({
            success: false,
            message: "tài khoản của bạn không được dùng chức năng này"
        })
    }
})

router.delete('/delete/:id', verifyPrivileges('xoá thông tin'), (req, res) => {
    if (req.hasPrivilege) {
        con.query('DELETE FROM account WHERE id = ?', [req.params.id], (err, result) => {
            if (err) throw err;
            res.json({
                success: true
            })
        })
    } else {
        res.json({
            success: false,
            message: "tài khoản của bạn không được dùng chức năng này"
        })
    }
})

router.get('/userinfor', (req, res) => {
    if (req.method == 'GET') {
        con.query('SELECT * FROM account WHERE id = 1', (err, rows) => {
            if (err) throw err;
            res.json({
                infor: rows
            });
        })
    }
})

module.exports = router;