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
        // タッチ/マウス追従移動
        this.updatePointerFollowing(deltaTime);
        
        // キーボード移動（次のコミットで実装）
        this.updateKeyboardMovement(deltaTime);
    }
    
    updatePointerFollowing(deltaTime) {
        if (!window.inputManager) return;
        
        const input = window.inputManager;
        
        // タッチ/マウスが押されているかチェック
        if (input.isPointerDown()) {
            const pointerPos = input.getPointerPosition();
            this.targetX = pointerPos.x;
            this.targetY = pointerPos.y;
            this.followingPointer = true;
        } else {
            this.followingPointer = false;
        }
        
        // 追従移動の実行
        if (this.followingPointer) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // 目標地点に十分近ければ移動を停止
            if (distance > 5) {
                const normalizedDx = dx / distance;
                const normalizedDy = dy / distance;
                
                // スムーズな追従移動
                const moveSpeed = this.followSpeed * (deltaTime / 16.67); // 60FPS基準で正規化
                this.x += normalizedDx * moveSpeed;
                this.y += normalizedDy * moveSpeed;
            }
        }
    }
    
    updateKeyboardMovement(deltaTime) {
        if (!window.inputManager) return;
        
        const input = window.inputManager;
        
        // 移動ベクトルを取得（inputManagerの機能を活用）
        const movementVector = input.getMovementVector();
        
        // キーボード移動の適用
        if (movementVector.x !== 0 || movementVector.y !== 0) {
            // デルタタイム基準での移動量計算
            const deltaSeconds = deltaTime / 1000;
            const moveDistance = this.keyboardSpeed * deltaSeconds;
            
            // 移動の実行
            this.x += movementVector.x * moveDistance;
            this.y += movementVector.y * moveDistance;
        }
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
        
        this.renderShip(ctx);
        this.renderDebug(ctx);
    }
    
    renderShip(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // メインボディ（三角形）
        this.renderMainBody(ctx);
        
        // サイドウィング
        this.renderWings(ctx);
        
        // コアエンジン
        this.renderCore(ctx);
        
        ctx.restore();
    }
    
    renderMainBody(ctx) {
        // グラデーション作成
        const gradient = ctx.createLinearGradient(0, -16, 0, 16);
        gradient.addColorStop(0, '#00ffff');
        gradient.addColorStop(0.3, '#0099ff');
        gradient.addColorStop(0.7, '#0066cc');
        gradient.addColorStop(1, '#003399');
        
        // 発光エフェクト
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 15;
        
        // メインボディ描画
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, -16);      // 上端
        ctx.lineTo(-8, 12);      // 左下
        ctx.lineTo(8, 12);       // 右下
        ctx.closePath();
        ctx.fill();
        
        // アウトライン
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#66ffff';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    renderWings(ctx) {
        // 左ウィング
        const wingGradient = ctx.createLinearGradient(-12, 0, -6, 0);
        wingGradient.addColorStop(0, '#ff0088');
        wingGradient.addColorStop(1, '#ff4499');
        
        ctx.shadowColor = '#ff0088';
        ctx.shadowBlur = 8;
        
        ctx.fillStyle = wingGradient;
        ctx.beginPath();
        ctx.moveTo(-8, 8);
        ctx.lineTo(-12, 4);
        ctx.lineTo(-12, 12);
        ctx.closePath();
        ctx.fill();
        
        // 右ウィング
        const wingGradient2 = ctx.createLinearGradient(12, 0, 6, 0);
        wingGradient2.addColorStop(0, '#ff0088');
        wingGradient2.addColorStop(1, '#ff4499');
        
        ctx.fillStyle = wingGradient2;
        ctx.beginPath();
        ctx.moveTo(8, 8);
        ctx.lineTo(12, 4);
        ctx.lineTo(12, 12);
        ctx.closePath();
        ctx.fill();
        
        ctx.shadowBlur = 0;
    }
    
    renderCore(ctx) {
        // コアの発光エフェクト
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 12;
        
        // コア本体
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(0, 4, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // 内側のハイライト
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 4, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // エンジン排気エフェクト
        this.renderEngineTrail(ctx);
    }
    
    renderEngineTrail(ctx) {
        // エンジン排気の描画
        const trailGradient = ctx.createLinearGradient(0, 12, 0, 20);
        trailGradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
        trailGradient.addColorStop(0.5, 'rgba(0, 200, 255, 0.4)');
        trailGradient.addColorStop(1, 'rgba(0, 150, 255, 0)');
        
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 6;
        
        ctx.fillStyle = trailGradient;
        ctx.beginPath();
        ctx.moveTo(-2, 12);
        ctx.lineTo(0, 20);
        ctx.lineTo(2, 12);
        ctx.closePath();
        ctx.fill();
        
        ctx.shadowBlur = 0;
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