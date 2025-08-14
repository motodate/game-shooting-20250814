class UIManager {
    constructor() {
        // メッセージ表示関連
        this.messages = [];
        this.messageId = 0;
        
        // 経験値UI関連
        this.showExpBar = true;
        this.expBarPosition = { x: 20, y: 50 };
        this.expBarSize = { width: 200, height: 12 };
        
        // レベルアップアニメーション
        this.levelUpAnimation = {
            active: false,
            duration: 2000, // 2秒
            startTime: 0,
            scale: 1,
            opacity: 1
        };
        
        // 経験値獲得アニメーション
        this.expGainAnimations = [];
        
        console.log('UIManager initialized');
    }
    
    /**
     * UI要素の更新
     */
    update(deltaTime) {
        // メッセージの更新
        this.updateMessages(deltaTime);
        
        // レベルアップアニメーションの更新
        this.updateLevelUpAnimation(deltaTime);
        
        // 経験値獲得アニメーションの更新
        this.updateExpGainAnimations(deltaTime);
    }
    
    /**
     * UI要素の描画
     */
    render(ctx) {
        if (!ctx) return;
        
        // 経験値バーの描画
        this.renderExpBar(ctx);
        
        // メッセージの描画
        this.renderMessages(ctx);
        
        // レベルアップアニメーションの描画
        this.renderLevelUpAnimation(ctx);
        
        // 経験値獲得アニメーションの描画
        this.renderExpGainAnimations(ctx);
    }
    
    /**
     * 経験値バーの描画
     */
    renderExpBar(ctx) {
        if (!this.showExpBar || !window.game?.experienceManager) return;
        
        const expManager = window.game.experienceManager;
        const expInfo = expManager.getDebugInfo();
        
        ctx.save();
        
        // 背景の描画
        const x = this.expBarPosition.x;
        const y = this.expBarPosition.y;
        const width = this.expBarSize.width;
        const height = this.expBarSize.height;
        
        // バー背景（暗い青）
        ctx.fillStyle = 'rgba(0, 50, 100, 0.8)';
        ctx.fillRect(x, y, width, height);
        
        // バー枠線
        ctx.strokeStyle = '#00aaff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        // 進捗バーの描画
        if (expInfo.expToNext > 0) {
            const progress = expInfo.currentExp / expInfo.expToNext;
            const progressWidth = width * progress;
            
            // グラデーション作成
            const gradient = ctx.createLinearGradient(x, y, x + progressWidth, y);
            gradient.addColorStop(0, '#00ffff');
            gradient.addColorStop(0.5, '#0088ff');
            gradient.addColorStop(1, '#0044cc');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, progressWidth, height);
            
            // 発光効果
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 8;
            ctx.fillRect(x, y, progressWidth, height);
            ctx.shadowBlur = 0;
        }
        
        // レベル表示
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Lv.${expInfo.level}`, x, y - 5);
        
        // 経験値数値表示
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        const expText = expInfo.level >= 5 ? 'MAX' : `${expInfo.currentExp}/${expInfo.expToNext}`;
        ctx.fillText(expText, x + width/2, y + height + 15);
        
        // 進捗パーセンテージ
        if (expInfo.level < 5) {
            ctx.font = '10px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(`${expInfo.progress}%`, x + width - 5, y + height - 2);
        }
        
        ctx.restore();
    }
    
    /**
     * メッセージ表示システム
     */
    showMessage(text, duration = 2000, color = '#ffffff') {
        const message = {
            id: this.messageId++,
            text: text,
            duration: duration,
            remainingTime: duration,
            color: color,
            opacity: 1,
            y: 100 + (this.messages.length * 25)
        };
        
        this.messages.push(message);
        
        // メッセージが多すぎる場合は古いものを削除
        if (this.messages.length > 5) {
            this.messages.shift();
        }
    }
    
    /**
     * メッセージの更新
     */
    updateMessages(deltaTime) {
        for (let i = this.messages.length - 1; i >= 0; i--) {
            const message = this.messages[i];
            message.remainingTime -= deltaTime;
            
            // フェードアウト効果
            if (message.remainingTime < 500) {
                message.opacity = message.remainingTime / 500;
            }
            
            // 時間切れのメッセージを削除
            if (message.remainingTime <= 0) {
                this.messages.splice(i, 1);
            }
        }
        
        // メッセージ位置を再調整
        this.messages.forEach((message, index) => {
            message.y = 100 + (index * 25);
        });
    }
    
    /**
     * メッセージの描画
     */
    renderMessages(ctx) {
        if (this.messages.length === 0) return;
        
        ctx.save();
        
        this.messages.forEach(message => {
            ctx.globalAlpha = message.opacity;
            ctx.fillStyle = message.color;
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            
            // 発光効果
            ctx.shadowColor = message.color;
            ctx.shadowBlur = 10;
            
            const x = window.canvasManager ? window.canvasManager.width / 2 : 400;
            ctx.fillText(message.text, x, message.y);
        });
        
        ctx.restore();
    }
    
    /**
     * レベルアップアニメーションの開始
     */
    startLevelUpAnimation(level) {
        this.levelUpAnimation = {
            active: true,
            level: level,
            duration: 2000,
            startTime: Date.now(),
            scale: 1,
            opacity: 1
        };
        
        console.log(`Level up animation started for level ${level}`);
    }
    
    /**
     * レベルアップアニメーションの更新
     */
    updateLevelUpAnimation(deltaTime) {
        if (!this.levelUpAnimation.active) return;
        
        const elapsed = Date.now() - this.levelUpAnimation.startTime;
        const progress = elapsed / this.levelUpAnimation.duration;
        
        if (progress >= 1) {
            this.levelUpAnimation.active = false;
            return;
        }
        
        // イージング関数（ease-out）
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        // スケールアニメーション（大きく→小さく）
        if (progress < 0.3) {
            this.levelUpAnimation.scale = 1 + (progress / 0.3) * 0.5; // 1.0 → 1.5
        } else {
            this.levelUpAnimation.scale = 1.5 - ((progress - 0.3) / 0.7) * 0.3; // 1.5 → 1.2
        }
        
        // フェードアウト
        if (progress > 0.7) {
            this.levelUpAnimation.opacity = 1 - ((progress - 0.7) / 0.3);
        } else {
            this.levelUpAnimation.opacity = 1;
        }
    }
    
    /**
     * レベルアップアニメーションの描画
     */
    renderLevelUpAnimation(ctx) {
        if (!this.levelUpAnimation.active) return;
        
        ctx.save();
        
        const centerX = window.canvasManager ? window.canvasManager.width / 2 : 400;
        const centerY = window.canvasManager ? window.canvasManager.height / 2 : 300;
        
        ctx.globalAlpha = this.levelUpAnimation.opacity;
        ctx.translate(centerX, centerY);
        ctx.scale(this.levelUpAnimation.scale, this.levelUpAnimation.scale);
        
        // 発光効果
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 20;
        
        // レベルアップテキスト
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('LEVEL UP!', 0, -20);
        
        // レベル数値
        ctx.font = 'bold 36px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`Level ${this.levelUpAnimation.level}`, 0, 30);
        
        ctx.restore();
    }
    
    /**
     * 経験値獲得アニメーション開始
     */
    startExpGainAnimation(x, y, amount) {
        const animation = {
            id: Date.now() + Math.random(),
            x: x,
            y: y,
            amount: amount,
            startY: y,
            duration: 1500,
            startTime: Date.now(),
            opacity: 1
        };
        
        this.expGainAnimations.push(animation);
        
        // アニメーション数を制限
        if (this.expGainAnimations.length > 10) {
            this.expGainAnimations.shift();
        }
    }
    
    /**
     * 経験値獲得アニメーションの更新
     */
    updateExpGainAnimations(deltaTime) {
        for (let i = this.expGainAnimations.length - 1; i >= 0; i--) {
            const animation = this.expGainAnimations[i];
            const elapsed = Date.now() - animation.startTime;
            const progress = elapsed / animation.duration;
            
            if (progress >= 1) {
                this.expGainAnimations.splice(i, 1);
                continue;
            }
            
            // 上昇アニメーション
            animation.y = animation.startY - (progress * 40);
            
            // フェードアウト
            animation.opacity = 1 - progress;
        }
    }
    
    /**
     * 経験値獲得アニメーションの描画
     */
    renderExpGainAnimations(ctx) {
        if (this.expGainAnimations.length === 0) return;
        
        ctx.save();
        
        this.expGainAnimations.forEach(animation => {
            ctx.globalAlpha = animation.opacity;
            ctx.fillStyle = '#ffff00';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            
            // 発光効果
            ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = 8;
            
            ctx.fillText(`+${animation.amount} EXP`, animation.x, animation.y);
        });
        
        ctx.restore();
    }
    
    /**
     * 経験値UI表示の切り替え
     */
    toggleExpBar() {
        this.showExpBar = !this.showExpBar;
        console.log(`Experience bar ${this.showExpBar ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * UI設定の更新
     */
    updateSettings(settings) {
        if (settings.expBarPosition) {
            this.expBarPosition = { ...this.expBarPosition, ...settings.expBarPosition };
        }
        
        if (settings.expBarSize) {
            this.expBarSize = { ...this.expBarSize, ...settings.expBarSize };
        }
        
        if (settings.showExpBar !== undefined) {
            this.showExpBar = settings.showExpBar;
        }
    }
    
    /**
     * デバッグ情報取得
     */
    getDebugInfo() {
        return {
            activeMessages: this.messages.length,
            expBarVisible: this.showExpBar,
            levelUpAnimationActive: this.levelUpAnimation.active,
            expGainAnimations: this.expGainAnimations.length
        };
    }
}