class Game {
    constructor() {
        this.board = document.getElementById('board');
    }

    init(total_row) {
        this.total_row = total_row;

        this.maxValue = 2;
        this.turn = 1;

        this.rotate = 0;

        this.board.innerHTML = `<div class="draggable-hexagon rotate-0"></div>`;

        this.data = [];

        this.drawBoard();
        this.generateDraggableHexagon();
    }

    drawBoard() {
        let row = this.total_row;

        let minCol = parseInt(row / 2);
        let maxCol = parseInt(row / 2);

        for (let i = 0; i < row; i++) {
            for (let j = 0; j < 20; j++) {
                if (j >= minCol && j <= maxCol)
                    this.drawHexagon(i, j - 3);
            }
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

    drawHexagon(row, col, value = null) {
        let position = this.calculateHexagon(row, col);

        let div = document.querySelector(`.hexagon[data-row="${row}"][data-col="${col}"]`)
            || document.createElement('div');
        div.className = 'hexagon';
        div.setAttribute('data-row', row);
        div.setAttribute('data-col', col);
        div.removeAttribute('data-value');
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
            this.data[row][col].value = value;
        }

        this.board.append(div);
    }

    generateDraggableHexagon() {
        let div = document.querySelector('.draggable-hexagon');

        div.innerHTML = '';

        div = this.addDraggableHexagon(div, 1);

        // if (this.maxValue > 1)
        div = this.addDraggableHexagon(div, 2);
    }

    addDraggableHexagon(item, value) {
        let rand = Math.floor(Math.random() * this.maxValue) + 1;
        item.innerHTML += `<div class="hexagon draggable-hexagon-item" data-value="${value}" data-item="${value}"><div class="hexagon-1"><div class="hexagon-2"></div></div></div>`;
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

        if (this.maxValue === 1) {
            drop.classList.add('hover');
            drop.setAttribute('data-value', drag.getAttribute('data-value'));
        }

        if (this.maxValue > 1 && drop && drop2 && !drop.getAttribute('data-value') && !drop2.getAttribute('data-value')) {
            drop.classList.add('hover');
            drop.setAttribute('data-value', drag.getAttribute('data-value'));

            drop2.classList.add('hover');
            drop2.setAttribute('data-value', document.querySelector(`.draggable-hexagon .hexagon:not([data-item="${draggedItem}"])`).getAttribute('data-value'));
        }
    }

    check() {
        for (let i = 0; i < this.data.length; i++) {
            let data = this.data[i];
            for (let j = 0; j < data.length; j++) {
                let datum = data[j];

                if (datum && datum.value) {
                    let res = this.searchData(datum, i, j, [], []);

                    if (res.length >= 3) {
                        this.merge(res);
                        this.check();
                        return true;
                    }
                }
            }
        }
        return false;
    }

    merge(res) {
        this.animating = true;

        let value = res[0].value + 1;

        for (let i = 0; i < res.length; i++) {
            let data = res[i];

            document.querySelector(`.hexagon[data-row="${data.row}"][data-col="${data.col}"]`).removeAttribute('data-value');

            this.data[data.row][data.col].value = 0;
        }

        let rand = Math.floor(Math.random() * res.length);

        rand = res[rand];

        setTimeout(() => {
            if (value < 6) this.drawHexagon(rand.row, rand.col, value);
            setTimeout(() => {
                if (!this.check()) this.animating = false;
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
                res = this.searchData(nextData, row - 1, col - 1, res, gatheredData);
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
}