const jwt = require('jsonwebtoken');
const con = require('./database');

function verifyPrivileges(privilege) {
    return (req, res, next) => {
        const token = req.headers['token'] || req.body.token;
        if (token) {
            jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
                if (err) throw err;
                console.log(decoded);
                const sql = `SELECT privileges.name, privileges.alias FROM roles_privileges JOIN privileges on roles_privileges.privileges_id = privileges.id JOIN roles on roles_privileges.role_id = roles.id WHERE roles_privileges.role_id = ${decoded.role} AND privileges.alias = '${req.method}' AND privileges.name = '${privilege}'`;
                con.query(sql, (err, rows) => {
                    if (err) throw err;
                    if (rows.length > 0) {
                        req.hasPrivilege = true;
                        req.tokenData = decoded;
                        next();
                    } else {
                        req.hasPrivilege = false;
                        next();
                    }
                });
            })
        }
    }
}
module.exports = verifyPrivileges;