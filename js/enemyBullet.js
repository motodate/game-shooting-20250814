const ENEMY_BULLET_TYPES = {
    STRAIGHT: 'straight',    // 直線弾
    HOMING: 'homing',        // 自機狙い弾
    SPREAD: 'spread'         // 弾幕
};

class EnemyBullet {
    constructor(x = 0, y = 0, type = ENEMY_BULLET_TYPES.STRAIGHT) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.vx = 0;
        this.vy = 0;
        this.speed = 0.1; // pixel/ms
        this.angle = 0; // radians
        this.width = 6;
        this.height = 6;
        this.active = false;
        this.createdAt = Date.now();
        
        // ホーミング用
        this.homingStrength = 0.002;
        this.maxTurnRate = 0.05;
        this.homingDuration = 2000; // 2秒間のみ追跡
        this.homingElapsed = 0; // 追跡経過時間
        this.wasHoming = false; // 元々ホーミング弾だったかの記録
    }

    update(deltaTime, playerX = null, playerY = null) {
        if (!this.active) return;

        // ホーミング時間を追跡
        if (this.wasHoming) {
            this.homingElapsed += deltaTime;
            
            // ホーミング時間が過ぎたら直線弾に変更
            if (this.homingElapsed >= this.homingDuration && this.type === ENEMY_BULLET_TYPES.HOMING) {
                this.type = ENEMY_BULLET_TYPES.STRAIGHT;
                console.log('ホーミング弾が直線弾に切り替わりました');
            }
        }

        if (this.type === ENEMY_BULLET_TYPES.HOMING && playerX !== null && playerY !== null) {
            this.updateHoming(deltaTime, playerX, playerY);
        } else {
            // 通常の直線移動
            this.x += this.vx * deltaTime;
            this.y += this.vy * deltaTime;
        }

        this.checkBounds();
    }

    updateHoming(deltaTime, playerX, playerY) {
        // プレイヤーへの角度を計算
        const targetAngle = Math.atan2(playerY - this.y, playerX - this.x);
        
        // 角度差を計算
        let angleDiff = targetAngle - this.angle;
        
        // 角度を -π から π の範囲に正規化
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
        // 最大回転速度で制限
        const turnAmount = Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), this.maxTurnRate * deltaTime);
        this.angle += turnAmount;
        
        // 速度ベクトルを更新
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        
        // 位置を更新
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
    }

    setVelocity(vx, vy) {
        this.vx = vx;
        this.vy = vy;
        this.angle = Math.atan2(vy, vx);
    }

    setAngleAndSpeed(angle, speed) {
        this.angle = angle;
        this.speed = speed;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        // ホーミング弾の場合はフラグを立てる
        if (this.type === ENEMY_BULLET_TYPES.HOMING) {
            this.wasHoming = true;
        }
    }

    checkBounds() {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) return;

        const margin = 50;
        if (this.x < -margin || 
            this.x > canvas.width + margin || 
            this.y < -margin || 
            this.y > canvas.height + margin) {
            this.destroy();
        }
    }

    destroy() {
        this.active = false;
    }

    reset() {
        this.active = true;
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.angle = 0;
        this.speed = 0.1;
        this.createdAt = Date.now();
        this.homingElapsed = 0;
        this.wasHoming = false;
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
        if (!this.active) return;

        ctx.save();
        this.drawBullet(ctx);
        ctx.restore();
    }

    drawBullet(ctx) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        // マゼンタ系のネオン色
        ctx.shadowColor = '#ff3399';
        ctx.shadowBlur = 6;

        // 弾タイプによって色を変える
        switch (this.type) {
            case ENEMY_BULLET_TYPES.HOMING:
                // ホーミング中は明るい色、直線に変わったら少し暗く
                ctx.fillStyle = this.wasHoming && this.homingElapsed < this.homingDuration ? '#ff0066' : '#ff1177';
                if (this.wasHoming && this.homingElapsed < this.homingDuration) {
                    // ホーミング中はより強い光沢
                    ctx.shadowBlur = 10;
                }
                break;
            case ENEMY_BULLET_TYPES.SPREAD:
                ctx.fillStyle = '#ff3399';
                break;
            default:
                ctx.fillStyle = '#ff5599';
                break;
        }

        // 円形の弾
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.width / 2, 0, Math.PI * 2);
        ctx.fill();

        // 内側のハイライト
        ctx.fillStyle = '#ffaadd';
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.width / 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
    }
}