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

class MediumEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, ENEMY_TYPES.MEDIUM);
        this.hp = 5;
        this.maxHp = 5;
        this.width = 24;
        this.height = 24;
        this.vy = 0.08; // 小型機より遅い
        
        // 攻撃関連
        this.shootTimer = 0;
        this.shootInterval = 2000; // 2秒間隔
        this.lastShotTime = 0;
    }

    reset() {
        super.reset();
        // MediumEnemy固有の設定を再適用
        this.vy = 0.08;
        this.width = 24;
        this.height = 24;
        this.hp = 5;
        this.maxHp = 5;
        this.shootTimer = 0;
        this.lastShotTime = 0;
        this.shootInterval = Math.random() * 1000 + 1500; // 1.5-2.5秒のランダム間隔
    }

    update(deltaTime, enemyBulletManager = null, playerX = null, playerY = null) {
        super.update(deltaTime);
        
        // 攻撃処理
        this.updateShooting(deltaTime, enemyBulletManager, playerX, playerY);
    }

    updateShooting(deltaTime, enemyBulletManager, playerX, playerY) {
        if (!this.active || this.destroyed || !enemyBulletManager) return;
        if (playerX === null || playerY === null) return;
        
        const currentTime = performance.now();
        
        if (currentTime - this.lastShotTime >= this.shootInterval) {
            this.shootAtPlayer(enemyBulletManager, playerX, playerY);
            this.lastShotTime = currentTime;
            this.shootInterval = Math.random() * 1000 + 1500; // 次の発射間隔をランダム化
        }
    }

    shootAtPlayer(enemyBulletManager, playerX, playerY) {
        const bulletX = this.x + this.width / 2;
        const bulletY = this.y + this.height;
        
        // プレイヤーへの角度を計算
        const angle = Math.atan2(playerY - bulletY, playerX - bulletX);
        
        // 自機狙い弾を発射
        const bullet = enemyBulletManager.createHomingBullet(bulletX, bulletY, angle, 0.08);
        
        if (bullet) {
            console.log(`MediumEnemy shot at player: angle=${angle.toFixed(2)}`);
        }
    }

    drawEnemy(ctx) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        ctx.shadowColor = '#ff6600';
        ctx.shadowBlur = 10;

        // メイン機体（オレンジ系）
        ctx.fillStyle = '#ff4400';
        ctx.fillRect(this.x + 2, this.y, this.width - 4, this.height);

        ctx.fillStyle = '#ff6622';
        ctx.fillRect(this.x, this.y + 4, this.width, this.height - 8);

        // ウィング
        ctx.fillStyle = '#ff8844';
        ctx.fillRect(this.x - 4, this.y + 8, 6, this.height - 16);
        ctx.fillRect(this.x + this.width - 2, this.y + 8, 6, this.height - 16);

        // エンジン
        ctx.fillStyle = '#ffaa66';
        const engineSize = 6;
        ctx.fillRect(centerX - engineSize / 2, this.y + this.height, engineSize, 8);

        // HPインジケーター
        const hpRatio = this.hp / this.maxHp;
        if (hpRatio < 1) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
            ctx.fillRect(this.x, this.y - 6, this.width, 2);
            ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
            ctx.fillRect(this.x, this.y - 6, this.width * hpRatio, 2);
        }

        ctx.shadowBlur = 0;
    }
}

class LargeEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, ENEMY_TYPES.LARGE);
        this.hp = 15;
        this.maxHp = 15;
        this.width = 36;
        this.height = 36;
        this.vy = 0.05; // 最も遅い
        
        // 攻撃関連
        this.shootTimer = 0;
        this.shootInterval = 3000; // 3秒間隔
        this.lastShotTime = 0;
        this.burstCount = 0;
        this.burstMax = 3; // 3回連射
        this.burstDelay = 300; // 連射間隔
    }

    reset() {
        super.reset();
        // LargeEnemy固有の設定を再適用
        this.vy = 0.05;
        this.width = 36;
        this.height = 36;
        this.hp = 15;
        this.maxHp = 15;
        this.shootTimer = 0;
        this.lastShotTime = 0;
        this.burstCount = 0;
        this.shootInterval = Math.random() * 1000 + 2500; // 2.5-3.5秒のランダム間隔
    }

    update(deltaTime, enemyBulletManager = null, playerX = null, playerY = null) {
        super.update(deltaTime);
        
        // 攻撃処理
        this.updateShooting(deltaTime, enemyBulletManager, playerX, playerY);
    }

    updateShooting(deltaTime, enemyBulletManager, playerX, playerY) {
        if (!this.active || this.destroyed || !enemyBulletManager) return;
        
        const currentTime = performance.now();
        
        if (currentTime - this.lastShotTime >= this.shootInterval) {
            this.shootSpread(enemyBulletManager, playerX, playerY);
            this.lastShotTime = currentTime;
            this.shootInterval = Math.random() * 1000 + 2500;
        }
    }

    shootSpread(enemyBulletManager, playerX, playerY) {
        const bulletX = this.x + this.width / 2;
        const bulletY = this.y + this.height;
        
        // プレイヤーへの角度を基準とした扇状弾幕
        let centerAngle = Math.PI / 2; // デフォルトは下方向
        
        if (playerX !== null && playerY !== null) {
            centerAngle = Math.atan2(playerY - bulletY, playerX - bulletX);
        }
        
        // 5発の扇状弾幕
        const bullets = enemyBulletManager.createSpreadPattern(
            bulletX, bulletY, 
            centerAngle, 
            Math.PI / 3, // 60度の広がり
            5, 
            0.1
        );
        
        if (bullets.length > 0) {
            console.log(`LargeEnemy fired spread pattern: ${bullets.length} bullets`);
        }
    }

    drawEnemy(ctx) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        ctx.shadowColor = '#aa00aa';
        ctx.shadowBlur = 12;

        // メイン機体（紫系）
        ctx.fillStyle = '#880088';
        ctx.fillRect(this.x + 3, this.y, this.width - 6, this.height);

        ctx.fillStyle = '#aa00aa';
        ctx.fillRect(this.x, this.y + 6, this.width, this.height - 12);

        // 大型ウィング
        ctx.fillStyle = '#cc22cc';
        ctx.fillRect(this.x - 8, this.y + 12, 10, this.height - 24);
        ctx.fillRect(this.x + this.width - 2, this.y + 12, 10, this.height - 24);

        // 複数エンジン
        ctx.fillStyle = '#dd44dd';
        const engineSize = 8;
        ctx.fillRect(centerX - engineSize, this.y + this.height, engineSize, 10);
        ctx.fillRect(centerX, this.y + this.height, engineSize, 10);

        // コア部分
        ctx.fillStyle = '#ff66ff';
        ctx.fillRect(centerX - 6, centerY - 6, 12, 12);

        // HPインジケーター
        const hpRatio = this.hp / this.maxHp;
        if (hpRatio < 1) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
            ctx.fillRect(this.x, this.y - 8, this.width, 3);
            ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
            ctx.fillRect(this.x, this.y - 8, this.width * hpRatio, 3);
        }

        ctx.shadowBlur = 0;
    }
}