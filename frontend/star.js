class Star {
    constructor(x, y, target, damage, player) {
        this.id = `s_${Math.random().toString(36).substr(2, 9)}`;
        this.x = x;
        this.y = y;

        this.player = player;
        this.damage = damage;

        this.target = target;

        this.item = null;

        this.append();
    }

    append() {
        let div = document.createElement('div');
        div.className = 'star';
        div.id = this.id;

        div = this.setPosition(div);

        game.board.append(div);

        this.move();
    }

    setPosition(item) {
        item.style.left = this.x + 'px';
        item.style.top = this.y + 'px';

        return item;
    }

    move() {
        let item = document.getElementById(this.id);

        if (item) {
            let x = (this.target.x + this.target.width / 2) - this.x;
            let y = (this.target.y) - this.y;

            let radians = Math.atan2(y, x);

            let mx = Math.cos(radians) * 20;
            let my = Math.sin(radians) * 20;

            this.x += mx;
            this.y += my;

            item.style.left = this.x + 'px';
            item.style.top = this.y + 'px';

            if (
                this.x > this.target.x && this.x < this.target.x + this.target.width &&
                this.y > this.target.y && this.y < this.target.y + this.target.height
            ) {
                item.remove();
                game.setPlayer(this.player, this.damage);
            } else requestAnimationFrame(this.move.bind(this));
        }
    }
}