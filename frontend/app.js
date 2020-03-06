let game = new Game();

const board = document.getElementById('board');

const hasClass = (item, classes) => {
    return item.classList.contains(classes);
};

(function () {
    var socket = io();

    socket.on('error-msg', function (msg) {
        alert(msg.message);
    });

    let client_id = `client_${Math.random().toString(36).substr(2, 9)}`;

    //  Join Game

    document.getElementById('form-join').addEventListener('submit', function (e) {
        e.preventDefault();
        let username = document.getElementById('username').value;
        let room_id = document.getElementById('room_id').value;

        if (username && room_id) {
            socket.emit('join', {
                username: username,
                room_id: room_id,
                client_id: client_id,
            });
        }
    });

    //  User connected

    socket.on('start-game', function (data) {
        let modal = document.getElementById('modal');
        modal.classList.add('hide');

        board.innerHTML = 'Waiting for other player';

        if (!game.you) game.you = data.player1 && data.player1.client_id === client_id ? data.player1.player : data.player2.player;

        if (data.player1 && data.player2) game.init(13, data, socket);
    });

    //  Create game

    document.addEventListener('keyup', function (e) {
        if (e.key === 'z') game.rotateHexagon();
    });

    let action;

    document.addEventListener('mousedown', function (e) {
        let el = e.target;

        if (hasClass(el, 'hexagon-2') && game.start && !game.animating && game.turn % 2 === game.you % 2) {
            let parent = el.parentElement.parentElement.parentElement;

            if (hasClass(parent, 'draggable-hexagon')) {
                parent.classList.add('dragging');

                document.onmousemove = drag;
                document.onmouseup = cancelDrag;

                let x1 = e.clientX;
                let y1 = e.clientY;
                let x2, y2;

                function drag(e) {
                    e.preventDefault();

                    let hovered = document.querySelectorAll('.hover');

                    for (let i = 0; i < hovered.length; i++) {
                        hovered[i].classList.remove('hover');
                        hovered[i].removeAttribute('data-value');
                    }

                    e.preventDefault();

                    x2 = e.clientX - x1;
                    y2 = e.clientY - y1;

                    parent.style.left = x2 + parent.offsetLeft + 'px';
                    parent.style.top = y2 + parent.offsetTop + 'px';

                    x1 = e.clientX;
                    y1 = e.clientY;

                    if (hasClass(e.target, 'hexagon-2') && !e.target.getAttribute('data-value')) {
                        game.showDropArea(e.target.parentElement.parentElement, el.parentElement.parentElement);
                    }
                }

                function cancelDrag() {
                    document.onmousemove = null;
                    document.onmouseup = null;

                    parent.classList.remove('dragging');

                    let hovered = document.querySelectorAll('.hover');

                    if (hovered.length) {
                        let hovered_data = [];

                        for (let i = 0; i < hovered.length; i++) {
                            let row = hovered[i].getAttribute('data-row');
                            let col = hovered[i].getAttribute('data-col');
                            let value = parseInt(hovered[i].getAttribute('data-value'));

                            hovered_data.push({
                                row: row,
                                col: col,
                                value: value,
                            });
                        }

                        socket.emit('drop', {
                            draggable: game.randomHexagon(),
                            data: hovered_data,
                            player: game.you,
                        });
                    }
                }
            }
        }
    });
})();