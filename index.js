const express = require("express");
const app = express();

const http = require('http').createServer(app);

app.use(express.static(__dirname + '/frontend'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/frontend/index.html');
});

http.listen(3000, function () {
    console.log('Listen to 3000');
});
