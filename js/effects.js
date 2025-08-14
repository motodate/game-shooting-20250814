// エフェクトタイプの定義
const EFFECT_TYPES = {
    EXPLOSION: 'explosion',
    DAMAGE: 'damage',
    PARTICLE: 'particle',
    LEVELUP: 'levelup',
    SCREEN_FLASH: 'screenFlash'
};

class Effect {
    constructor(x, y, type = EFFECT_TYPES.EXPLOSION) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.active = false;
        this.startTime = 0;
        this.duration = 1000; // デフォルト1秒
        this.particles = [];
        
        // エフェクトタイプ別の初期化
        this.initByType();
    }
    
    initByType() {
        switch (this.type) {
            case EFFECT_TYPES.EXPLOSION:
                this.duration = 500;
                this.initExplosion();
                break;
            case EFFECT_TYPES.DAMAGE:
                this.duration = 300;
                this.initDamage();
                break;
            case EFFECT_TYPES.PARTICLE:
                this.duration = 800;
                this.initParticle();
                break;
            case EFFECT_TYPES.LEVELUP:
                this.duration = 1500;
                this.initLevelUp();
                break;
            case EFFECT_TYPES.SCREEN_FLASH:
                this.duration = 300;
                this.initScreenFlash();
                break;
        }
    }
    
    initExplosion() {
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 50 + Math.random() * 100;
            const size = 2 + Math.random() * 3;
            
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: size,
                maxSize: size,
                color: this.getExplosionColor(),
                life: 1.0,
                decay: 0.8 + Math.random() * 0.4
            });
        }
    }
    
    initDamage() {
        const particleCount = 4;
        for (let i = 0; i < particleCount; i++) {
            const angle = -Math.PI/2 + (Math.random() - 0.5) * Math.PI/4;
            const speed = 30 + Math.random() * 50;
            const size = 1 + Math.random() * 2;
            
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: size,
                maxSize: size,
                color: '#ff4444',
                life: 1.0,
                decay: 1.2
            });
        }
    }
    
    initParticle() {
        const particleCount = 6;
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 20 + Math.random() * 40;
            const size = 1 + Math.random() * 2;
            
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: size,
                maxSize: size,
                color: '#00ffff',
                life: 1.0,
                decay: 0.6
            });
        }
    }
    
    initLevelUp() {
        // レベルアップ時の華やかなパーティクルエフェクト
        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
            const speed = 80 + Math.random() * 120;
            const size = 3 + Math.random() * 5;
            
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: size,
                maxSize: size,
                color: this.getLevelUpColor(),
                life: 1.0,
                decay: 0.5,
                sparkle: Math.random() > 0.5 // きらめき効果フラグ
            });
        }
        
        // 中央の光る粒子
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: this.x + (Math.random() - 0.5) * 20,
                y: this.y + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 50,
                vy: -50 - Math.random() * 50, // 上向きに飛ぶ
                size: 4 + Math.random() * 4,
                maxSize: 4 + Math.random() * 4,
                color: '#ffffff',
                life: 1.0,
                decay: 0.3,
                glow: true
            });
        }
    }
    
    initScreenFlash() {
        // スクリーンフラッシュ用の特別な設定
        this.flashIntensity = 1.0;
        this.flashColor = '#00ff00';
    }
    
    getLevelUpColor() {
        const colors = ['#00ff00', '#00ffff', '#ffff00', '#ff00ff', '#ffffff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    getExplosionColor() {
        const colors = ['#ff4444', '#ff8844', '#ffaa44', '#ffff44'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    start() {
        this.active = true;
        this.startTime = Date.now();
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        const currentTime = Date.now();
        const elapsed = currentTime - this.startTime;
        
        if (elapsed >= this.duration) {
            this.active = false;
            return;
        }
        
        const progress = elapsed / this.duration;
        const deltaSeconds = deltaTime / 1000;
        
        // タイプ別の特殊更新処理
        if (this.type === EFFECT_TYPES.SCREEN_FLASH) {
            this.flashIntensity = 1.0 - progress;
        }
        
        // パーティクルの更新
        this.particles.forEach(particle => {
            particle.x += particle.vx * deltaSeconds;
            particle.y += particle.vy * deltaSeconds;
            particle.life = Math.max(0, particle.life - particle.decay * deltaSeconds);
            particle.size = particle.maxSize * particle.life;
            
            // タイプ別の物理効果
            if (this.type === EFFECT_TYPES.EXPLOSION) {
                // 重力効果（爆発エフェクトのみ）
                particle.vy += 100 * deltaSeconds; // 下向きに加速
            } else if (this.type === EFFECT_TYPES.LEVELUP) {
                // レベルアップエフェクトは重力なし、きらめき効果
                if (particle.sparkle) {
                    particle.sparklePhase = (particle.sparklePhase || 0) + deltaSeconds * 10;
                }
            }
        });
    }
    
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        
        // スクリーンフラッシュの描画
        if (this.type === EFFECT_TYPES.SCREEN_FLASH && this.flashIntensity > 0) {
            ctx.globalAlpha = this.flashIntensity * 0.3;
            ctx.fillStyle = this.flashColor;
            const canvas = window.canvasManager;
            if (canvas) {
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
        
        // パーティクルの描画
        this.particles.forEach(particle => {
            if (particle.life <= 0) return;
            
            const alpha = particle.life;
            ctx.globalAlpha = alpha;
            
            // 発光効果の設定
            if (particle.glow || this.type === EFFECT_TYPES.LEVELUP) {
                ctx.shadowColor = particle.color;
                ctx.shadowBlur = particle.size * 2;
            }
            
            // きらめき効果
            if (particle.sparkle && particle.sparklePhase) {
                const sparkleIntensity = Math.sin(particle.sparklePhase) * 0.5 + 0.5;
                ctx.globalAlpha = alpha * sparkleIntensity;
            }
            
            ctx.fillStyle = particle.color;
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            
            // グロー効果をリセット
            ctx.shadowBlur = 0;
        });
        
        ctx.restore();
    }
    
    isFinished() {
        return !this.active;
    }
}

class EffectsManager {
    constructor() {
        this.effects = [];
        this.effectPool = [];
        this.poolSize = 50;
        
        this.initPool();
        console.log('EffectsManager initialized');
    }
    
    initPool() {
        for (let i = 0; i < this.poolSize; i++) {
            this.effectPool.push(new Effect(0, 0));
        }
    }
    
    getFromPool(x, y, type) {
        for (let i = 0; i < this.effectPool.length; i++) {
            const effect = this.effectPool[i];
            if (!effect.active) {
                effect.x = x;
                effect.y = y;
                effect.type = type;
                effect.initByType();
                return effect;
            }
        }
        
        // プールが満杯の場合は新しく作成
        return new Effect(x, y, type);
    }
    
    createExplosion(x, y) {
        const effect = this.getFromPool(x, y, EFFECT_TYPES.EXPLOSION);
        effect.start();
        this.effects.push(effect);
        return effect;
    }
    
    createDamageEffect(x, y) {
        const effect = this.getFromPool(x, y, EFFECT_TYPES.DAMAGE);
        effect.start();
        this.effects.push(effect);
        return effect;
    }
    
    createParticleEffect(x, y) {
        const effect = this.getFromPool(x, y, EFFECT_TYPES.PARTICLE);
        effect.start();
        this.effects.push(effect);
        return effect;
    }
    
    createLevelUpEffect(x, y) {
        const effect = this.getFromPool(x, y, EFFECT_TYPES.LEVELUP);
        effect.start();
        this.effects.push(effect);
        console.log(`Level up effect created at (${x}, ${y})`);
        return effect;
    }
    
    createScreenFlash(color = '#00ff00') {
        const effect = this.getFromPool(0, 0, EFFECT_TYPES.SCREEN_FLASH);
        effect.flashColor = color;
        effect.start();
        this.effects.push(effect);
        console.log('Screen flash effect created');
        return effect;
    }
    
    update(deltaTime) {
        // エフェクトの更新
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            effect.update(deltaTime);
            
            if (effect.isFinished()) {
                this.effects.splice(i, 1);
                
                // プールに戻す
                if (this.effectPool.length < this.poolSize) {
                    this.effectPool.push(effect);
                }
            }
        }
    }
    
    render(ctx) {
        this.effects.forEach(effect => {
            effect.render(ctx);
        });
    }
    
    clear() {
        this.effects.forEach(effect => {
            effect.active = false;
        });
        this.effects = [];
    }
    
    getDebugInfo() {
        return {
            activeEffects: this.effects.length,
            poolSize: this.effectPool.length,
            totalEffectsInUse: this.poolSize - this.effectPool.length + this.effects.length
        };
    }
}