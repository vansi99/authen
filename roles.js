const roles = require('user-groups-roles');

//roles
roles.createNewRole('admin');
roles.createNewRole('student');

//privileges
roles.createNewPrivileges(['/users/getUser', 'GET'], 'get infor of user', true);
roles.createNewPrivileges(['/users/login', 'POST'], 'user login', true);
roles.createNewPrivileges(['/users/update/:fname/:lname', 'PUT'], 'user update', false);
roles.createNewPrivileges(['/users/register', 'POST'], 'user register', true);

//admin
roles.addPrivilegeToRole('admin', ['/users/update/:fname/:lname', 'PUT'], true);

//student


module.exports = roles;
