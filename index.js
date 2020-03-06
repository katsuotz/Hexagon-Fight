const express = require("express");
const app = express();

const http = require('http').createServer(app);

const io = require('socket.io')(http);

app.use(express.static(__dirname + '/frontend'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/frontend/index.html');
});

let gameData = {};

io.on('connection', function (socket) {
    console.log('user connected');

    socket.on('join', function (msg) {
        console.log('join room', gameData);

        let room_id = msg.room_id;

        if (!gameData[room_id]) {
            gameData[room_id] = {
                room_id: room_id,
                ready: false,
                player1: null,
                player2: null,
                data: [],
            }
        } else {
            let data = gameData[room_id];

            if (data && data.player1 && data.player2)
                return socket.emit('error-msg', {
                    message: 'The room is full',
                });
        }

        socket.join(msg.room_id);
        socket.room_id = msg.room_id;

        let data = gameData[socket.room_id];

        let player_data = {
            id: this.id,
            username: msg.username,
            client_id: msg.client_id,
            lifepoints: 4000
        };

        if (!data.player1 && !data.player2) {
            let rand = Math.floor(Math.random() * 2) + 1;

            if (rand === 1) {
                player_data.player = 1;
                data.player1 = player_data;
            }
            if (rand === 2) {
                player_data.player = 2;
                data.player2 = player_data;
            }
        } else {
            if (!data.player1) {
                player_data.player = 1;
                data.player1 = player_data;
            } else if (!data.player2) {
                player_data.player = 2;
                data.player2 = player_data;
            }
        }

        if (data.player1 && data.player2) data.ready = true;

        io.to(socket.room_id).emit('start-game', gameData[socket.room_id]);
    });

    socket.on('start-game', function (msg) {
        gameData[socket.room_id].data = msg.data;
    });

    socket.on('update-tiles', function (msg) {
        gameData[socket.room_id].data = msg.data;
        io.to(socket.room_id).emit('update-tiles', gameData[socket.room_id]);
    });

    socket.on('update-player', function (msg) {
        gameData[socket.room_id].player1 = msg.player1;
        gameData[socket.room_id].player2 = msg.player2;

        io.to(socket.room_id).emit('update-player', gameData[socket.room_id]);
    });

    socket.on('drop', function (msg) {
        io.to(socket.room_id).emit('drop', msg);
    });

    socket.on('update-max-value', function (msg) {
        io.to(socket.room_id).emit('update-max-value', msg);
    });

    socket.on('new-star', function (msg) {
        io.to(socket.room_id).emit('new-star', msg);
    });

    socket.on('delete-room', function () {
        console.log('before', gameData);

        if (socket.room_id && gameData[socket.room_id]) {
            delete gameData[socket.room_id];

            socket.leave(socket.room_id);
            delete socket.room_id;
            console.log('after', gameData);
        }
    });

    socket.on('disconnect', function () {
        console.log('user disconnected');

        let data = gameData[socket.room_id];

        if (data) {
            if (data.ready) {
                if (data.player1.id === this.id) data.player1.lifepoints = 0;
                if (data.player2.id === this.id) data.player2.lifepoints = 0;

                io.to(socket.room_id).emit('update-player', gameData[socket.room_id]);

                delete gameData[socket.room_id];
            } else {
                if (data.player1 && data.player1.id === this.id) data.player1 = null;
                if (data.player2 && data.player2.id === this.id) data.player2 = null;
            }
        }
    });
});

http.listen(3000, function () {
    console.log('Listen to 3000');
});
