// エフェクトタイプの定義
const EFFECT_TYPES = {
    EXPLOSION: 'explosion',
    DAMAGE: 'damage',
    PARTICLE: 'particle'
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
        
        // パーティクルの更新
        this.particles.forEach(particle => {
            particle.x += particle.vx * deltaSeconds;
            particle.y += particle.vy * deltaSeconds;
            particle.life = Math.max(0, particle.life - particle.decay * deltaSeconds);
            particle.size = particle.maxSize * particle.life;
            
            // 重力効果（爆発エフェクトのみ）
            if (this.type === EFFECT_TYPES.EXPLOSION) {
                particle.vy += 100 * deltaSeconds; // 下向きに加速
            }
        });
    }
    
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        
        this.particles.forEach(particle => {
            if (particle.life <= 0) return;
            
            const alpha = particle.life;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = particle.color;
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
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