const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const server = express();
const PORT = 3004;
const account = require('./account');
const dotenv = require('dotenv');
dotenv.config();

server.use(bodyParser.json());
server.use(morgan('dev'));
server.use('/', account);



server.listen(PORT, (err) => {
    if (err) throw err;
    console.log('server running on port: 3004');
});