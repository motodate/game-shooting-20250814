class EnemyBulletManager {
    constructor() {
        this.bullets = [];
        this.bulletPool = [];
        this.maxBullets = 200;
        this.maxActiveBullets = 100;
        
        this.initializePool();
    }

    initializePool() {
        for (let i = 0; i < this.maxBullets; i++) {
            this.bulletPool.push(new EnemyBullet());
        }
    }

    getFromPool() {
        for (let i = 0; i < this.bulletPool.length; i++) {
            const bullet = this.bulletPool[i];
            if (!bullet.active) {
                bullet.reset();
                return bullet;
            }
        }
        return null;
    }

    createBullet(x, y, type = ENEMY_BULLET_TYPES.STRAIGHT) {
        const bullet = this.getFromPool();
        
        if (bullet && this.getActiveBulletCount() < this.maxActiveBullets) {
            bullet.x = x;
            bullet.y = y;
            bullet.type = type;
            bullet.active = true;
            this.bullets.push(bullet);
            return bullet;
        }
        return null;
    }

    createStraightBullet(x, y, vx, vy) {
        const bullet = this.createBullet(x, y, ENEMY_BULLET_TYPES.STRAIGHT);
        if (bullet) {
            bullet.setVelocity(vx, vy);
        }
        return bullet;
    }

    createHomingBullet(x, y, angle, speed = 0.08) {
        const bullet = this.createBullet(x, y, ENEMY_BULLET_TYPES.HOMING);
        if (bullet) {
            bullet.setAngleAndSpeed(angle, speed);
            bullet.wasHoming = true; // ホーミング弾フラグを設定
        }
        return bullet;
    }

    createSpreadBullet(x, y, angle, speed = 0.1) {
        const bullet = this.createBullet(x, y, ENEMY_BULLET_TYPES.SPREAD);
        if (bullet) {
            bullet.setAngleAndSpeed(angle, speed);
        }
        return bullet;
    }

    // 扇状弾幕を作成
    createSpreadPattern(x, y, centerAngle, spreadAngle, bulletCount, speed = 0.1) {
        const bullets = [];
        const angleStep = spreadAngle / (bulletCount - 1);
        const startAngle = centerAngle - spreadAngle / 2;
        
        for (let i = 0; i < bulletCount; i++) {
            const angle = startAngle + (angleStep * i);
            const bullet = this.createSpreadBullet(x, y, angle, speed);
            if (bullet) {
                bullets.push(bullet);
            }
        }
        
        return bullets;
    }

    // 円形弾幕を作成
    createCirclePattern(x, y, bulletCount, speed = 0.1) {
        const bullets = [];
        const angleStep = (Math.PI * 2) / bulletCount;
        
        for (let i = 0; i < bulletCount; i++) {
            const angle = angleStep * i;
            const bullet = this.createSpreadBullet(x, y, angle, speed);
            if (bullet) {
                bullets.push(bullet);
            }
        }
        
        return bullets;
    }

    update(deltaTime, playerX = null, playerY = null) {
        this.updateBullets(deltaTime, playerX, playerY);
        this.cleanupBullets();
    }

    updateBullets(deltaTime, playerX, playerY) {
        for (let i = 0; i < this.bullets.length; i++) {
            const bullet = this.bullets[i];
            if (bullet.active) {
                bullet.update(deltaTime, playerX, playerY);
            }
        }
    }

    cleanupBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            if (!bullet.active) {
                this.bullets.splice(i, 1);
            }
        }
    }

    render(ctx) {
        for (let i = 0; i < this.bullets.length; i++) {
            const bullet = this.bullets[i];
            if (bullet.active) {
                bullet.draw(ctx);
            }
        }
    }

    getActiveBullets() {
        return this.bullets.filter(bullet => bullet.active);
    }

    getActiveBulletCount() {
        return this.getActiveBullets().length;
    }

    destroyAllBullets() {
        for (let i = 0; i < this.bullets.length; i++) {
            this.bullets[i].destroy();
        }
        this.bullets = [];
    }

    reset() {
        this.destroyAllBullets();
    }

    getDebugInfo() {
        return {
            activeBullets: this.getActiveBulletCount(),
            totalBullets: this.bullets.length,
            poolSize: this.bulletPool.length,
            maxActiveBullets: this.maxActiveBullets
        };
    }
}