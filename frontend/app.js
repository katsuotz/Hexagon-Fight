const game = new Game();

const hasClass = (item, classes) => {
    return item.classList.contains(classes);
};

(function () {
    game.init(13);

    document.addEventListener('keyup', function (e) {
        if (e.key === 'z') game.rotateHexagon();
    });

    let action;

    document.addEventListener('mousedown', function (e) {
        let el = e.target;

        if (hasClass(el, 'hexagon-2') && !game.animating) {
            let parent = el.parentElement.parentElement.parentElement;

            if (hasClass(parent, 'draggable-hexagon')) {
                parent.classList.add('dragging');

                document.onmousemove = drag;
                document.onmouseup = cancelDrag;

                let x1 = e.clientX;
                let y1 = e.clientY;
                let x2, y2;

                function drag(e) {
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

                    if (hasClass(e.target, 'hexagon-2')) {
                        game.showDropArea(e.target.parentElement.parentElement, el.parentElement.parentElement);
                    }
                }

                function cancelDrag() {
                    document.onmousemove = null;
                    document.onmouseup = null;

                    parent.classList.remove('dragging');

                    let hovered = document.querySelectorAll('.hover');

                    if (hovered.length) {
                        for (let i = 0; i < hovered.length; i++) {
                            hovered[i].classList.remove('hover');
                            game.data[hovered[i].getAttribute('data-row')][hovered[i].getAttribute('data-col')].value = parseInt(hovered[i].getAttribute('data-value'));
                        }
                        game.check();

                        game.turn++;
                    }

                    switch (game.turn % 2) {
                        case 0:
                            parent.style.top = '50%';
                            parent.style.right = '40px';
                            parent.style.left = 'unset';
                            break;
                        case 1:
                            parent.style.top = '50%';
                            parent.style.left = '40px';
                            break;
                    }
                }
            }
        }
    });
})();