class Game {
    constructor() {
        this.board = document.getElementById('board');

        this.board.innerHTML = '';

        this.you = null;

        this.start = false;
    }

    init(total_row, data, socket) {
        console.log('new-game');

        this.socket = socket;

        this.start = true;

        this.player1 = data.player1;
        this.player2 = data.player2;

        this.setPlayer();

        this.room_id = data.room_id;

        this.total_row = total_row;

        this.maxValue = 1;
        this.draggableTotal = 1;
        this.turn = 1;

        this.rotate = 0;

        this.board.innerHTML = `<div class="draggable-hexagon rotate-0"></div>`;

        this.data = [];

        this.draggable = [];

        this.drawBoard();
        this.generateDraggableHexagon();

        this.initSocket();
    }

    setPlayer(player = null, damage = 0) {
        if (player && damage) {
            if (player === 1) this.player1.lifepoints -= damage;
            if (player === 2) this.player2.lifepoints -= damage;
        }

        if (this.player1) {
            let player1 = document.querySelector('.player-1');
            document.querySelector('.player-1 .username').innerHTML = this.player1.username;
            document.querySelector('.player-1 .lifepoints').innerHTML = this.player1.lifepoints;
            player1.classList.remove('hide');
            player1.classList.remove('lost');
        }

        if (this.player2) {
            let player2 = document.querySelector('.player-2');
            document.querySelector('.player-2 .username').innerHTML = this.player2.username;
            document.querySelector('.player-2 .lifepoints').innerHTML = this.player2.lifepoints;
            player2.classList.remove('hide');
            player2.classList.remove('lost');
        }

        if (this.player1.lifepoints < 0 && this.start) this.gameOver(1);
        if (this.player2.lifepoints < 0 && this.start) this.gameOver(2);

        // if (update) {
        //     this.socket.emit('update-player', {
        //         player1: this.player1,
        //         player2: this.player2,
        //     });
        // }
    }

    initSocket() {
        this.socket.on('drop', (data) => {
            if (this.maxValue > 1) {
                this.draggableTotal = 2;
            }

            for (let i = 0; i < data.data.length; i++) {
                let datum = data.data[i];
                let el = document.querySelector(`.hexagon[data-row="${datum.row}"][data-col="${datum.col}"]`);
                el.classList.remove('hover');
                el.setAttribute('data-value', datum.value);

                this.data[datum.row][datum.col].value = datum.value;
            }

            if (data.player === this.you) {
                this.check(data.player);
            }
            this.turn++;

            let draggableHexagon = document.querySelector('.draggable-hexagon');

            switch (this.turn % 2) {
                case 0:
                    draggableHexagon.style.top = '50%';
                    draggableHexagon.style.right = '40px';
                    draggableHexagon.style.left = 'unset';
                    break;
                case 1:
                    draggableHexagon.style.top = '50%';
                    draggableHexagon.style.left = '40px';
                    break;
            }

            this.draggable = data.draggable;

            this.generateDraggableHexagon(data.draggable);
        });

        this.socket.on('update-max-value', (data) => {
            this.maxValue = data.maxValue;
            this.generateDraggableHexagon(this.draggable);
        });

        this.socket.on('update-tiles', (data) => {
            for (let i = 0; i < data.data.length; i++) {
                let datum = data.data[i];

                for (let j = 0; j < datum.length; j++) {
                    let item = datum[j];

                    if (item && item.row != null && item.col != null)
                        this.drawHexagon(item.row, item.col, false, item.value);
                }
            }
        });

        // this.socket.on('update-player', (data) => {
        //     this.player1 = data.player1;
        //     this.player2 = data.player2;
        //
        //     if (this.player1.lifepoints < 0) this.gameOver(1);
        //     if (this.player2.lifepoints < 0) this.gameOver(2);
        // });

        this.socket.on('new-star', (data) => {
            new Star(data.x, data.y, data.target, data.damage, data.player);
        });

        this.socket.emit('start-game', this.data);
    }

    drawBoard() {
        let row = this.total_row;

        let minCol = parseInt(row / 2);
        let maxCol = parseInt(row / 2);

        for (let i = 0; i < row; i++) {
            for (let j = 0; j < 20; j++) if (j >= minCol && j <= maxCol) this.drawHexagon(i, j - 3);

            if (i <= 5) {
                if (i % 2) minCol--;
                else maxCol++;
            } else {
                if (i % 2) maxCol--;
                else minCol++;
            }
        }
    }

    calculateHexagon(row, col) {
        let hexRectHeight = 58;
        let hexRectWidth = 67;
        let hexRadius = hexRectWidth / 2;
        let sideLength = 38;
        // let hexHeight = (hexRectHeight - sideLength) / 2;

        let totalHeight = this.total_row * hexRectHeight + hexRectHeight - sideLength;
        let totalWidth = parseInt(this.total_row / 2) * hexRectWidth + hexRectWidth;

        let marginTop = (this.board.offsetHeight - totalHeight) / 2;
        let marginLeft = (this.board.offsetWidth - totalWidth) / 2;

        return {
            x: hexRectWidth * col + ((row + 1) % 2) * hexRadius + marginLeft,
            y: hexRectHeight * row + marginTop,
        }
    }

    drawHexagon(row, col, update = false, value = null) {
        let position = this.calculateHexagon(row, col);

        let div = document.querySelector(`.hexagon[data-row="${row}"][data-col="${col}"]`)
            || document.createElement('div');

        div.className = 'hexagon';
        div.setAttribute('data-row', row);
        div.setAttribute('data-col', col);
        div.innerHTML = `<div class="hexagon-1"><div class="hexagon-2"></div></div>`;
        div.style.left = position.x + 'px';
        div.style.top = position.y + 'px';

        if (!this.data[row]) this.data[row] = [];
        this.data[row][col] = {
            row: row,
            col: col,
            value: 0,
        };

        if (value) {
            div.setAttribute('data-value', value);
        } else {
            div.removeAttribute('data-value');
        }

        this.data[row][col].value = value;

        this.board.append(div);

        if (update && this.start) {
            this.socket.emit('update-tiles', {
                data: this.data,
                player: this.you,
            });
        }
    }

    generateDraggableHexagon(data = [1, 1]) {
        let div = document.querySelector('.draggable-hexagon');

        div.innerHTML = '';

        div = this.addDraggableHexagon(div, 1, data[0]);

        if (this.maxValue > 1) {
            this.draggableTotal = 2;
            div = this.addDraggableHexagon(div, 2, data[1]);
        }
    }

    randomHexagon() {
        let res = [];

        res = [Math.floor(Math.random() * this.maxValue) + 1];
        res.push(Math.floor(Math.random() * this.maxValue) + 1);

        if (this.maxValue > 1) {
            this.draggableTotal = 2;
        }

        return res;
    }

    addDraggableHexagon(item, count, value = null) {
        item.innerHTML += `<div class="hexagon draggable-hexagon-item" data-value="${value}" data-item="${count}"><div class="hexagon-1"><div class="hexagon-2"></div></div></div>`;
        return item;
    }

    rotateHexagon() {
        let draggableHexagon = document.querySelector('.draggable-hexagon');

        switch (this.rotate) {
            case 0:
                draggableHexagon.classList.remove('rotate-0');
                draggableHexagon.classList.add('rotate-1');
                break;
            case 1:
                draggableHexagon.classList.remove('rotate-1');
                draggableHexagon.classList.add('rotate-2');
                break;
            case 2:
                draggableHexagon.classList.remove('rotate-2');
                draggableHexagon.classList.add('rotate-0');

                let draggableHexa0 = document.querySelectorAll('.draggable-hexagon .hexagon')[0];
                let draggableHexa1 = document.querySelectorAll('.draggable-hexagon .hexagon')[1];

                draggableHexa0.setAttribute('data-item', 2);
                draggableHexa1.setAttribute('data-item', 1);

                draggableHexagon.innerHTML = '';
                draggableHexagon.append(draggableHexa1);
                draggableHexagon.append(draggableHexa0);

                this.rotate = -1;
                break;
        }

        this.rotate++;
    }

    showDropArea(drop, drag) {
        let draggedItem = parseInt(drag.getAttribute('data-item'));

        let row1 = parseInt(drop.getAttribute('data-row'));
        let col1 = parseInt(drop.getAttribute('data-col'));
        let row2, col2;

        switch (this.rotate) {
            case 0:
                col2 = draggedItem % 2 ? col1 + 1 : col1 - 1;
                row2 = row1;
                break;
            case 1:
                col2 = draggedItem % 2 ? (row1 % 2 ? col1 : col1 + 1) : (row1 % 2 ? col1 - 1 : col1);
                row2 = draggedItem % 2 ? row1 + 1 : row1 - 1;
                break;
            case 2:
                col2 = draggedItem % 2 ? (row1 % 2 ? col1 - 1 : col1) : (row1 % 2 ? col1 : col1 + 1);
                row2 = draggedItem % 2 ? row1 + 1 : row1 - 1;
                break;
        }

        let drop2 = document.querySelector(`.hexagon[data-row="${row2}"][data-col="${col2}"]`);

        if (this.draggableTotal === 1 && !drop.getAttribute('data-value')) {
            drop.classList.add('hover');
            drop.setAttribute('data-value', drag.getAttribute('data-value'));
        }

        if (this.draggableTotal > 1 && drop && drop2 && !drop.getAttribute('data-value') && !drop2.getAttribute('data-value')) {
            drop.classList.add('hover');
            drop.setAttribute('data-value', drag.getAttribute('data-value'));

            drop2.classList.add('hover');
            drop2.setAttribute('data-value', document.querySelector(`.draggable-hexagon .hexagon:not([data-item="${draggedItem}"])`).getAttribute('data-value'));
        }
    }

    check(player) {
        for (let i = 0; i < this.data.length; i++) {
            let data = this.data[i];
            for (let j = 0; j < data.length; j++) {
                let datum = data[j];

                if (datum && datum.value) {
                    let res = this.searchData(datum, i, j, [], []);

                    if (res.length >= 3) {
                        this.merge(res, player);
                        this.check(player);
                        return true;
                    }
                }
            }
        }
        return false;
    }

    merge(res, player) {
        this.animating = true;

        let value = res[0].value;

        let damage = 100 * value;

        // if (player === 1) this.player2.lifepoints -= damage;
        // if (player === 2) this.player1.lifepoints -= damage;

        value++;

        let oldValue = this.maxValue;

        this.maxValue = value < 6 ? value : this.maxValue;

        if (oldValue !== this.maxValue) {
            this.socket.emit('update-max-value', {
                maxValue: this.maxValue,
            })
        }

        for (let i = 0; i < res.length; i++) {
            let data = res[i];

            let hexagon = document.querySelector(`.hexagon[data-row="${data.row}"][data-col="${data.col}"]`);
            hexagon.removeAttribute('data-value');

            let x2, y2;

            let lifepoints = document.querySelector(`.player-${player === 1 ? 2 : 1} .lifepoints`);

            x2 = lifepoints.offsetLeft + lifepoints.parentElement.offsetLeft;
            y2 = lifepoints.offsetTop + lifepoints.parentElement.offsetTop;

            let target = {
                x: x2,
                y: y2,
                width: lifepoints.offsetWidth,
                height: lifepoints.offsetHeight,
            };

            this.socket.emit('new-star', {
                x: hexagon.offsetLeft,
                y: hexagon.offsetTop,
                target: target,
                damage: damage,
                player: player === 1 ? 2 : 1,
            });

            this.data[data.row][data.col].value = 0;
        }

        let rand = Math.floor(Math.random() * res.length);

        rand = res[rand];

        setTimeout(() => {
            this.drawHexagon(rand.row, rand.col, true, value < 6 ? value : null);
            setTimeout(() => {
                if (!this.check(player)) this.animating = false;
            }, 500);
        }, 500);
    }

    getNextData(row, col) {
        let data = this.data[row];
        if (data) data = data[col];
        return data;
    }

    filterData(data, item) {
        for (let i = 0; i < data.length; i++) {
            let datum = data[i];
            if (datum.row === item.row && datum.col === item.col) return true;
        }
        return false;
    }

    searchData(currentData, row, col, res = [], gatheredData = []) {
        let nextData = this.getNextData(row, col);
        if (!nextData || !nextData.value) return res;

        if (this.filterData(gatheredData, nextData)) return res;

        if (currentData.value === nextData.value) {
            res.push(nextData);
            gatheredData.push({
                row: row,
                col: col,
            });
        } else return res;

        res = this.searchData(nextData, row, col + 1, res, gatheredData);
        res = this.searchData(nextData, row, col - 1, res, gatheredData);

        switch (row % 2) {
            case 0:
                res = this.searchData(nextData, row - 1, col + 1, res, gatheredData);
                res = this.searchData(nextData, row - 1, col, res, gatheredData);

                res = this.searchData(nextData, row + 1, col, res, gatheredData);
                res = this.searchData(nextData, row + 1, col + 1, res, gatheredData);

                break;
            case 1:
                res = this.searchData(nextData, row - 1, col - 1, res, gatheredData);
                res = this.searchData(nextData, row - 1, col, res, gatheredData);

                res = this.searchData(nextData, row + 1, col - 1, res, gatheredData);
                res = this.searchData(nextData, row + 1, col, res, gatheredData);

                break;
        }

        return res;
    }

    gameOver(player) {
        this.start = false;

        document.querySelector(`.player-${player}`).classList.add('lost');

        let modal = document.querySelector('#modal');
        alert(`${player === 1 ? this.player2.username : this.player1.username} Win!`);
        modal.classList.remove('hide');

        this.socket.emit('delete-room', {});

        game = new Game();
    }
}