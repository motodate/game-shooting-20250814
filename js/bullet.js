class Bullet {
    constructor() {
        // 位置とサイズ（当てやすく調整）
        this.x = 0;
        this.y = 0;
        this.width = 6;
        this.height = 14;
        
        // 移動関連
        this.vx = 0;
        this.vy = -400; // 上方向に移動（ピクセル/秒）
        
        // 状態管理
        this.active = false;
        this.pooled = false; // オブジェクトプール用フラグ
        
        // 弾の種類（将来の拡張用）
        this.type = 'normal';
        this.damage = 1;
        
        // 描画関連
        this.color = '#00ffff'; // シアンカラー
        this.glowColor = '#66ffff';
        this.trailLength = 3; // 軌跡の長さ（フレーム数）
        this.trailPositions = []; // 軌跡用の位置履歴
    }
    
    // 弾の初期化（発射時に呼び出し）
    init(x, y, vx = 0, vy = -400) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.active = true;
        this.pooled = false;
        
        // サイズをデフォルトにリセット
        this.width = 6;
        this.height = 14;
        
        // 軌跡をリセット
        this.trailPositions = [];
        for (let i = 0; i < this.trailLength; i++) {
            this.trailPositions.push({ x: x, y: y });
        }
    }
    
    // 弾の更新処理
    update(deltaTime) {
        if (!this.active) return;
        
        // 軌跡位置の更新
        this.updateTrail();
        
        // 位置の更新
        const deltaSeconds = deltaTime / 1000;
        this.x += this.vx * deltaSeconds;
        this.y += this.vy * deltaSeconds;
        
        // 画面外判定
        this.checkBounds();
    }
    
    // 軌跡位置の更新
    updateTrail() {
        // 現在位置を軌跡の先頭に追加
        this.trailPositions.unshift({ x: this.x, y: this.y });
        
        // 軌跡の長さを制限
        if (this.trailPositions.length > this.trailLength) {
            this.trailPositions.pop();
        }
    }
    
    // 画面境界チェック
    checkBounds() {
        if (!window.canvasManager) return;
        
        const margin = 20; // 画面外での余裕
        
        // 上下左右の境界をチェック
        if (this.y < -margin || 
            this.y > window.canvasManager.height + margin ||
            this.x < -margin || 
            this.x > window.canvasManager.width + margin) {
            this.deactivate();
        }
    }
    
    // 弾の非アクティブ化
    deactivate() {
        this.active = false;
        this.pooled = false;
    }
    
    // 弾の描画
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        
        // 軌跡の描画
        this.renderTrail(ctx);
        
        // メインの弾を描画
        this.renderBullet(ctx);
        
        ctx.restore();
    }
    
    // 軌跡の描画
    renderTrail(ctx) {
        if (this.trailPositions.length < 2) return;
        
        for (let i = 1; i < this.trailPositions.length; i++) {
            const pos = this.trailPositions[i];
            const opacity = (this.trailLength - i) / this.trailLength * 0.6;
            const scale = (this.trailLength - i) / this.trailLength * 0.8;
            
            ctx.globalAlpha = opacity;
            ctx.fillStyle = this.glowColor;
            
            const size = this.width * scale;
            const height = this.height * scale * 0.6;
            
            ctx.fillRect(pos.x - size/2, pos.y - height/2, size, height);
        }
        
        ctx.globalAlpha = 1;
    }
    
    // メイン弾の描画
    renderBullet(ctx) {
        ctx.translate(this.x, this.y);
        
        // 発光エフェクト
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 12;
        
        // グラデーション作成
        const gradient = ctx.createLinearGradient(0, -this.height/2, 0, this.height/2);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, this.color);
        gradient.addColorStop(0.7, this.color);
        gradient.addColorStop(1, '#0088cc');
        
        // メイン弾体
        ctx.fillStyle = gradient;
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        
        // コア部分（明るいライン）
        ctx.shadowBlur = 6;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-1, -this.height/2, 2, this.height);
        
        // アウトライン
        ctx.shadowBlur = 0;
        ctx.strokeStyle = this.glowColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(-this.width/2, -this.height/2, this.width, this.height);
    }
    
    // 当たり判定用の矩形取得
    getHitbox() {
        return {
            x: this.x - this.width/2,
            y: this.y - this.height/2,
            width: this.width,
            height: this.height
        };
    }
    
    // 当たり判定用の中心点取得
    getCenter() {
        return {
            x: this.x,
            y: this.y
        };
    }
    
    // デバッグ情報の描画
    renderDebug(ctx) {
        if (!window.game || !window.game.debugMode) return;
        
        ctx.save();
        
        // 当たり判定ボックス
        const hitbox = this.getHitbox();
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
        ctx.setLineDash([]);
        
        // 中心点
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 速度ベクトル
        const vectorScale = 0.1;
        ctx.strokeStyle = '#00ff00';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.vx * vectorScale, this.y + this.vy * vectorScale);
        ctx.stroke();
        
        ctx.restore();
    }
    
    // 弾の情報取得
    getStatus() {
        return {
            x: this.x,
            y: this.y,
            vx: this.vx,
            vy: this.vy,
            active: this.active,
            type: this.type,
            damage: this.damage
        };
    }
}