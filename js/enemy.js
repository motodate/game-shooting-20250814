const ENEMY_TYPES = {
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large'
};

class Enemy {
    constructor(x, y, type = ENEMY_TYPES.SMALL) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.vx = 0;
        this.vy = 0;
        this.hp = 1;
        this.maxHp = 1;
        this.width = 20;
        this.height = 20;
        this.active = false;
        this.destroyed = false;
        this.createdAt = Date.now();
    }

    update(deltaTime) {
        if (!this.active || this.destroyed) return;

        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        this.checkBounds();
    }

    checkBounds() {
        const canvas = document.getElementById('game-canvas');
        if (canvas && this.y > canvas.height + this.height) {
            this.destroy();
        }
    }

    takeDamage(damage = 1) {
        if (!this.active || this.destroyed) return false;

        this.hp -= damage;
        if (this.hp <= 0) {
            this.destroy();
            return true;
        }
        return false;
    }

    destroy() {
        this.destroyed = true;
        this.active = false;
    }

    reset() {
        this.active = true;
        this.destroyed = false;
        this.hp = this.maxHp;
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.createdAt = Date.now();
    }

    getCollisionBox() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    draw(ctx) {
        if (!this.active || this.destroyed) return;

        ctx.save();
        this.drawEnemy(ctx);
        ctx.restore();
    }

    drawEnemy(ctx) {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class SmallEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, ENEMY_TYPES.SMALL);
        this.hp = 1;
        this.maxHp = 1;
        this.width = 16;
        this.height = 16;
        this.vy = 0.15; // pixel/ms (150 pixel/second)
    }

    reset() {
        super.reset();
        // SmallEnemy固有の設定を再適用
        this.vy = 0.15;
        this.width = 16;
        this.height = 16;
    }

    drawEnemy(ctx) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        ctx.shadowColor = '#ff3366';
        ctx.shadowBlur = 8;

        ctx.fillStyle = '#ff1133';
        ctx.fillRect(this.x + 2, this.y, this.width - 4, this.height);

        ctx.fillStyle = '#ff3366';
        ctx.fillRect(this.x, this.y + 4, this.width, this.height - 8);

        ctx.fillStyle = '#ff6699';
        const engineSize = 4;
        ctx.fillRect(centerX - engineSize / 2, this.y + this.height, engineSize, 6);

        ctx.shadowBlur = 0;
    }
}