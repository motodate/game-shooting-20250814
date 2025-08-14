class BulletManager {
    constructor() {
        // オブジェクトプール設定
        this.poolSize = 100; // プール内の弾の最大数
        this.bulletPool = []; // 非アクティブな弾のプール
        this.activeBullets = []; // アクティブな弾のリスト
        
        // 発射制御
        this.fireRate = 200; // ミリ秒間隔（5発/秒）
        this.lastFireTime = 0;
        this.autoFiring = false;
        
        // 統計情報
        this.totalBulletsCreated = 0;
        this.totalBulletsFired = 0;
        this.bulletsRecycled = 0;
        
        // レベル関連
        this.currentLevel = 1;
        this.shotPatterns = this.setupShotPatterns();
        
        this.init();
    }
    
    init() {
        // オブジェクトプールを初期化
        this.createBulletPool();
        console.log(`BulletManager initialized with pool size: ${this.poolSize}`);
    }
    
    // ショットパターンの設定
    setupShotPatterns() {
        return {
            1: { // Lv1: 前方に1発
                bullets: [
                    { offsetX: 0, offsetY: -10, vx: 0, vy: -400 }
                ]
            },
            2: { // Lv2: 前方に2発を並行発射
                bullets: [
                    { offsetX: -6, offsetY: -10, vx: 0, vy: -400 },
                    { offsetX: 6, offsetY: -10, vx: 0, vy: -400 }
                ]
            },
            3: { // Lv3: 前方に3発を扇状発射
                bullets: [
                    { offsetX: 0, offsetY: -10, vx: 0, vy: -400 },           // 中央
                    { offsetX: -8, offsetY: -10, vx: -60, vy: -400 },       // 左斜め
                    { offsetX: 8, offsetY: -10, vx: 60, vy: -400 }          // 右斜め
                ]
            },
            4: { // Lv4: Lv3の弾を大型化（サイズ1.5倍、速度向上）
                bullets: [
                    { offsetX: 0, offsetY: -10, vx: 0, vy: -450, size: 1.5 },
                    { offsetX: -8, offsetY: -10, vx: -70, vy: -450, size: 1.5 },
                    { offsetX: 8, offsetY: -10, vx: 70, vy: -450, size: 1.5 }
                ]
            },
            5: { // Lv5: Lv4 + 後方に1発追加
                bullets: [
                    { offsetX: 0, offsetY: -10, vx: 0, vy: -450, size: 1.5 },    // 前方中央
                    { offsetX: -8, offsetY: -10, vx: -70, vy: -450, size: 1.5 },  // 前方左
                    { offsetX: 8, offsetY: -10, vx: 70, vy: -450, size: 1.5 },   // 前方右
                    { offsetX: 0, offsetY: 10, vx: 0, vy: 300, size: 1.2 }       // 後方
                ]
            }
        };
    }
    
    // オブジェクトプールの作成
    createBulletPool() {
        for (let i = 0; i < this.poolSize; i++) {
            const bullet = new Bullet();
            bullet.pooled = true;
            this.bulletPool.push(bullet);
            this.totalBulletsCreated++;
        }
    }
    
    // 弾の発射
    fireBullet(x, y, vx = 0, vy = -400) {
        const currentTime = Date.now();
        
        // 発射間隔チェック
        if (currentTime - this.lastFireTime < this.fireRate) {
            return null;
        }
        
        // プールから弾を取得
        const bullet = this.getBulletFromPool();
        if (!bullet) {
            console.warn('Bullet pool exhausted!');
            return null;
        }
        
        // 弾の初期化と発射
        bullet.init(x, y, vx, vy);
        this.activeBullets.push(bullet);
        this.lastFireTime = currentTime;
        this.totalBulletsFired++;
        
        return bullet;
    }
    
    // プールから弾を取得
    getBulletFromPool() {
        if (this.bulletPool.length === 0) {
            // プールが空の場合、新しい弾を作成
            const bullet = new Bullet();
            this.totalBulletsCreated++;
            return bullet;
        }
        
        const bullet = this.bulletPool.pop();
        bullet.pooled = false;
        return bullet;
    }
    
    // 弾をプールに戻す
    returnBulletToPool(bullet) {
        if (!bullet || bullet.pooled) return;
        
        bullet.deactivate();
        bullet.pooled = true;
        
        // プールサイズを制限
        if (this.bulletPool.length < this.poolSize) {
            this.bulletPool.push(bullet);
            this.bulletsRecycled++;
        }
    }
    
    // 自動発射の開始
    startAutoFire() {
        this.autoFiring = true;
    }
    
    // 自動発射の停止
    stopAutoFire() {
        this.autoFiring = false;
    }
    
    // 自動発射の状態切り替え
    toggleAutoFire() {
        this.autoFiring = !this.autoFiring;
    }
    
    // 発射間隔の設定
    setFireRate(rateMs) {
        this.fireRate = Math.max(50, rateMs); // 最低50ms間隔
    }
    
    // 発射位置からの自動発射処理
    updateAutoFire(x, y) {
        if (!this.autoFiring) return;
        
        // レベル別ショットパターンで発射
        this.fireByPattern(x, y);
    }
    
    // レベル別パターン発射
    fireByPattern(x, y) {
        const pattern = this.shotPatterns[this.currentLevel];
        if (!pattern || pattern.bullets.length === 0) {
            // フォールバック: レベル1パターン
            this.fireBullet(x, y - 10);
            return;
        }
        
        const currentTime = Date.now();
        
        // 発射間隔チェック
        if (currentTime - this.lastFireTime < this.fireRate) {
            return;
        }
        
        // パターンに従って複数弾を発射
        let firedCount = 0;
        pattern.bullets.forEach(bulletData => {
            const bullet = this.getBulletFromPool();
            if (bullet) {
                const fireX = x + bulletData.offsetX;
                const fireY = y + bulletData.offsetY;
                bullet.init(fireX, fireY, bulletData.vx, bulletData.vy);
                
                // サイズ調整（Lv4以上）
                if (bulletData.size && bulletData.size > 1) {
                    bullet.width = Math.round(bullet.width * bulletData.size);
                    bullet.height = Math.round(bullet.height * bulletData.size);
                }
                
                this.activeBullets.push(bullet);
                firedCount++;
            }
        });
        
        if (firedCount > 0) {
            this.lastFireTime = currentTime;
            this.totalBulletsFired += firedCount;
            console.log(`Level ${this.currentLevel} pattern fired: ${firedCount} bullets`);
        }
    }
    
    // 弾の更新処理
    update(deltaTime) {
        // アクティブな弾を逆順で処理（削除時の配列操作のため）
        for (let i = this.activeBullets.length - 1; i >= 0; i--) {
            const bullet = this.activeBullets[i];
            
            if (!bullet.active) {
                // 非アクティブになった弾をプールに戻す
                this.returnBulletToPool(bullet);
                this.activeBullets.splice(i, 1);
                continue;
            }
            
            // 弾の更新
            bullet.update(deltaTime);
        }
    }
    
    // 弾の描画
    render(ctx) {
        // アクティブな弾を描画
        for (const bullet of this.activeBullets) {
            bullet.render(ctx);
            
            // デバッグモードでのデバッグ情報表示
            if (window.game && window.game.debugMode) {
                bullet.renderDebug(ctx);
            }
        }
        
        // デバッグ情報の表示
        this.renderDebugInfo(ctx);
    }
    
    // デバッグ情報の描画
    renderDebugInfo(ctx) {
        if (!window.game || !window.game.debugMode) return;
        
        const info = [
            `Active Bullets: ${this.activeBullets.length}`,
            `Pool Size: ${this.bulletPool.length}`,
            `Auto Fire: ${this.autoFiring ? 'ON' : 'OFF'}`,
            `Fire Rate: ${this.fireRate}ms`,
            `Total Fired: ${this.totalBulletsFired}`,
            `Recycled: ${this.bulletsRecycled}`
        ];
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        
        const startY = 110; // プレイヤー情報の下に表示
        info.forEach((text, index) => {
            ctx.fillText(text, 10, startY + (index * 12));
        });
    }
    
    // 指定した弾の削除
    removeBullet(bullet) {
        const index = this.activeBullets.indexOf(bullet);
        if (index !== -1) {
            this.returnBulletToPool(bullet);
            this.activeBullets.splice(index, 1);
        }
    }
    
    // すべての弾をクリア
    clear() {
        // すべての弾をプールに戻す
        for (const bullet of this.activeBullets) {
            this.returnBulletToPool(bullet);
        }
        this.activeBullets = [];
        this.autoFiring = false;
    }
    
    // アクティブな弾のリストを取得
    getActiveBullets() {
        return [...this.activeBullets]; // コピーを返す
    }
    
    // 弾の数を取得
    getBulletCount() {
        return {
            active: this.activeBullets.length,
            pooled: this.bulletPool.length,
            total: this.totalBulletsCreated
        };
    }
    
    // 統計情報の取得
    getStats() {
        return {
            totalBulletsCreated: this.totalBulletsCreated,
            totalBulletsFired: this.totalBulletsFired,
            bulletsRecycled: this.bulletsRecycled,
            activeBullets: this.activeBullets.length,
            pooledBullets: this.bulletPool.length,
            poolUtilization: ((this.poolSize - this.bulletPool.length) / this.poolSize * 100).toFixed(1) + '%'
        };
    }
    
    // メモリ使用量の最適化
    optimizeMemory() {
        // 必要以上にプールサイズが大きくなった場合の調整
        const maxPoolSize = this.poolSize;
        const currentPoolSize = this.bulletPool.length;
        
        if (currentPoolSize > maxPoolSize) {
            const excess = currentPoolSize - maxPoolSize;
            this.bulletPool.splice(maxPoolSize, excess);
            console.log(`Pool optimized: removed ${excess} bullets`);
        }
    }
    
    // 設定の更新
    updateSettings(settings) {
        if (settings.fireRate !== undefined) {
            this.setFireRate(settings.fireRate);
        }
        
        if (settings.poolSize !== undefined) {
            this.poolSize = Math.max(50, settings.poolSize);
        }
    }
    
    // レベル設定
    setLevel(level) {
        const oldLevel = this.currentLevel;
        this.currentLevel = Math.max(1, Math.min(5, level));
        
        if (oldLevel !== this.currentLevel) {
            console.log(`BulletManager level changed: ${oldLevel} → ${this.currentLevel}`);
            
            // レベルに応じた発射間隔の調整（高レベルほど速く撃てる）
            const fireRates = {
                1: 200, // 5発/秒
                2: 180, // 5.5発/秒
                3: 160, // 6.25発/秒
                4: 140, // 7発/秒
                5: 120  // 8.3発/秒
            };
            this.setFireRate(fireRates[this.currentLevel] || 200);
        }
    }
    
    // 現在のレベル取得
    getLevel() {
        return this.currentLevel;
    }
}