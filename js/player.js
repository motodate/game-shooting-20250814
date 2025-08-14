class Player {
    constructor() {
        // 位置とサイズ
        this.x = 0;
        this.y = 0;
        this.width = 24;
        this.height = 32;
        
        // 移動関連
        this.speed = 300; // ピクセル/秒
        this.keyboardSpeed = 200; // キーボード移動速度
        this.followSpeed = 8; // タッチ追従速度（1-10, 10が最速）
        
        // 当たり判定
        this.hitboxRadius = 8; // 機体より小さい円形当たり判定
        
        // プレイヤー状態
        this.alive = true;
        this.lives = 3;
        this.invincible = false;
        this.invincibleTime = 0;
        this.invincibleDuration = 2000; // 2秒間無敵
        
        // 点滅エフェクト
        this.blinkTime = 0;
        this.blinkInterval = 100; // ミリ秒
        this.visible = true;
        
        // 移動制御フラグ
        this.followingPointer = false;
        this.targetX = 0;
        this.targetY = 0;
        
        this.init();
    }
    
    init() {
        // 初期位置を画面下部中央に設定
        if (window.canvasManager) {
            this.x = window.canvasManager.width / 2;
            this.y = window.canvasManager.height - 80;
            this.targetX = this.x;
            this.targetY = this.y;
        }
        
        console.log('Player initialized at:', this.x, this.y);
    }
    
    update(deltaTime) {
        if (!this.alive) return;
        
        // 無敵時間の処理
        if (this.invincible) {
            this.invincibleTime -= deltaTime;
            this.blinkTime += deltaTime;
            
            // 点滅処理
            if (this.blinkTime >= this.blinkInterval) {
                this.visible = !this.visible;
                this.blinkTime = 0;
            }
            
            // 無敵時間終了
            if (this.invincibleTime <= 0) {
                this.invincible = false;
                this.visible = true;
            }
        }
        
        // 移動処理は後のコミットで実装
        this.updateMovement(deltaTime);
        
        // 画面境界制限は後のコミットで実装
        this.constrainToScreen();
    }
    
    updateMovement(deltaTime) {
        // 移動処理のプレースホルダー
        // 後のコミットで実装予定
    }
    
    constrainToScreen() {
        // 画面境界制限のプレースホルダー
        // 後のコミットで実装予定
        if (!window.canvasManager) return;
        
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        
        if (this.x < halfWidth) this.x = halfWidth;
        if (this.x > window.canvasManager.width - halfWidth) {
            this.x = window.canvasManager.width - halfWidth;
        }
        if (this.y < halfHeight) this.y = halfHeight;
        if (this.y > window.canvasManager.height - halfHeight) {
            this.y = window.canvasManager.height - halfHeight;
        }
    }
    
    render(ctx) {
        if (!this.alive || !this.visible) return;
        
        // 描画処理のプレースホルダー
        // 次のコミットで実装予定
        this.renderDebug(ctx);
    }
    
    renderDebug(ctx) {
        if (!window.game || !window.game.debugMode) return;
        
        // デバッグ用の簡単な表示
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        
        // 当たり判定領域の表示
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.hitboxRadius, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // ダメージ処理
    takeDamage() {
        if (this.invincible || !this.alive) return false;
        
        this.lives--;
        
        if (this.lives <= 0) {
            this.alive = false;
            console.log('Player died');
            return true;
        }
        
        // 無敵時間開始
        this.invincible = true;
        this.invincibleTime = this.invincibleDuration;
        this.blinkTime = 0;
        
        console.log('Player took damage, lives remaining:', this.lives);
        return false;
    }
    
    // 復活処理
    revive() {
        this.alive = true;
        this.lives = 3;
        this.invincible = false;
        this.visible = true;
        this.init(); // 位置リセット
        
        console.log('Player revived');
    }
    
    // 当たり判定領域の取得
    getHitbox() {
        return {
            x: this.x,
            y: this.y,
            radius: this.hitboxRadius
        };
    }
    
    // プレイヤー情報の取得
    getStatus() {
        return {
            alive: this.alive,
            lives: this.lives,
            invincible: this.invincible,
            x: this.x,
            y: this.y
        };
    }
}