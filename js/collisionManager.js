class CollisionManager {
    constructor() {
        // 衝突タイプの定義
        this.COLLISION_TYPES = {
            PLAYER_BULLET_ENEMY: 'playerBulletEnemy',
            ENEMY_BULLET_PLAYER: 'enemyBulletPlayer',
            PLAYER_ENEMY: 'playerEnemy'
        };
        
        // デバッグモード
        this.debugMode = false;
        
        // 衝突検出の統計情報（パフォーマンス監視用）
        this.stats = {
            checksPerFrame: 0,
            collisionsPerFrame: 0,
            totalChecks: 0,
            totalCollisions: 0
        };
        
        console.log('CollisionManager initialized');
    }
    
    /**
     * メインの衝突チェックループ
     * 全ての衝突タイプをチェックする
     */
    checkCollisions(player, bulletManager, enemyManager, enemyBulletManager, deltaTime) {
        // フレームの開始時に統計をリセット
        this.stats.checksPerFrame = 0;
        this.stats.collisionsPerFrame = 0;
        
        if (!player || !bulletManager || !enemyManager || !enemyBulletManager) {
            return;
        }
        
        // 各種衝突チェック
        this.checkPlayerBulletsVsEnemies(bulletManager, enemyManager);
        this.checkEnemyBulletsVsPlayer(enemyBulletManager, player);
        this.checkPlayerVsEnemies(player, enemyManager);
        
        // 統計情報を更新
        this.stats.totalChecks += this.stats.checksPerFrame;
        this.stats.totalCollisions += this.stats.collisionsPerFrame;
    }
    
    /**
     * プレイヤー弾と敵の衝突チェック（未実装）
     */
    checkPlayerBulletsVsEnemies(bulletManager, enemyManager) {
        // 次のコミットで実装予定
    }
    
    /**
     * 敵弾とプレイヤーの衝突チェック（未実装）
     */
    checkEnemyBulletsVsPlayer(enemyBulletManager, player) {
        // 次のコミットで実装予定
    }
    
    /**
     * プレイヤーと敵機体の衝突チェック（未実装）
     */
    checkPlayerVsEnemies(player, enemyManager) {
        // 次のコミットで実装予定
    }
    
    /**
     * 基本的な円形衝突判定
     * 距離の二乗を使用して平方根計算を避ける最適化
     */
    isCircleCollision(obj1, obj2, radius1, radius2) {
        if (!obj1 || !obj2) return false;
        
        // 中心点を計算
        const centerX1 = obj1.x + (obj1.width || 0) / 2;
        const centerY1 = obj1.y + (obj1.height || 0) / 2;
        const centerX2 = obj2.x + (obj2.width || 0) / 2;
        const centerY2 = obj2.y + (obj2.height || 0) / 2;
        
        // 距離の二乗を計算（平方根を避けてパフォーマンス向上）
        const dx = centerX1 - centerX2;
        const dy = centerY1 - centerY2;
        const distanceSquared = dx * dx + dy * dy;
        
        // 衝突半径の二乗
        const combinedRadius = radius1 + radius2;
        const radiusSquared = combinedRadius * combinedRadius;
        
        this.stats.checksPerFrame++;
        
        const isCollision = distanceSquared <= radiusSquared;
        if (isCollision) {
            this.stats.collisionsPerFrame++;
        }
        
        // デバッグモードの場合、衝突座標を記録
        if (this.debugMode && isCollision) {
            this.lastCollisionPoint = {
                x: (centerX1 + centerX2) / 2,
                y: (centerY1 + centerY2) / 2,
                distance: Math.sqrt(distanceSquared),
                combinedRadius
            };
        }
        
        return isCollision;
    }
    
    /**
     * オブジェクトの適切な衝突半径を取得
     */
    getCollisionRadius(obj) {
        // プレイヤーの場合はhitboxRadiusを優先
        if (obj.hitboxRadius !== undefined) {
            return obj.hitboxRadius;
        }
        
        // その他のオブジェクトは幅と高さの平均値の半分を使用
        if (obj.width !== undefined && obj.height !== undefined) {
            return Math.min(obj.width, obj.height) / 2;
        }
        
        // デフォルト値
        return 8;
    }
    
    /**
     * 衝突座標を取得
     */
    getCollisionPoint(obj1, obj2) {
        const centerX1 = obj1.x + (obj1.width || 0) / 2;
        const centerY1 = obj1.y + (obj1.height || 0) / 2;
        const centerX2 = obj2.x + (obj2.width || 0) / 2;
        const centerY2 = obj2.y + (obj2.height || 0) / 2;
        
        return {
            x: (centerX1 + centerX2) / 2,
            y: (centerY1 + centerY2) / 2
        };
    }
    
    /**
     * デバッグ情報の取得
     */
    getDebugInfo() {
        return {
            checksThisFrame: this.stats.checksPerFrame,
            collisionsThisFrame: this.stats.collisionsPerFrame,
            totalChecks: this.stats.totalChecks,
            totalCollisions: this.stats.totalCollisions,
            averageChecksPerFrame: this.stats.totalChecks > 0 ? 
                Math.round(this.stats.totalChecks / 60) : 0
        };
    }
    
    /**
     * デバッグモードの切り替え
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`CollisionManager debug mode: ${enabled}`);
    }
    
    /**
     * デバッグ描画
     * オブジェクトの当たり判定円と衝突点を表示
     */
    renderDebug(ctx, player, bulletManager, enemyManager, enemyBulletManager) {
        if (!this.debugMode) return;
        
        ctx.save();
        
        // プレイヤーの当たり判定円を描画
        if (player && player.alive) {
            this.drawHitCircle(ctx, player, this.getCollisionRadius(player), '#00ff00', 2);
        }
        
        // プレイヤー弾の当たり判定円を描画
        if (bulletManager && bulletManager.bullets) {
            bulletManager.bullets.forEach(bullet => {
                if (bullet.active) {
                    this.drawHitCircle(ctx, bullet, this.getCollisionRadius(bullet), '#00ffff', 1);
                }
            });
        }
        
        // 敵の当たり判定円を描画
        if (enemyManager && enemyManager.enemies) {
            enemyManager.enemies.forEach(enemy => {
                if (enemy.active && !enemy.destroyed) {
                    this.drawHitCircle(ctx, enemy, this.getCollisionRadius(enemy), '#ff0000', 2);
                }
            });
        }
        
        // 敵弾の当たり判定円を描画
        if (enemyBulletManager && enemyBulletManager.bullets) {
            enemyBulletManager.bullets.forEach(bullet => {
                if (bullet.active) {
                    this.drawHitCircle(ctx, bullet, this.getCollisionRadius(bullet), '#ffff00', 1);
                }
            });
        }
        
        // 最後の衝突点を描画
        if (this.lastCollisionPoint) {
            ctx.strokeStyle = '#ff00ff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(
                this.lastCollisionPoint.x, 
                this.lastCollisionPoint.y, 
                5, 
                0, 
                Math.PI * 2
            );
            ctx.stroke();
            
            // 衝突情報をテキストで表示
            ctx.fillStyle = '#ff00ff';
            ctx.font = '10px monospace';
            ctx.fillText(
                `Collision: ${this.lastCollisionPoint.distance.toFixed(1)} / ${this.lastCollisionPoint.combinedRadius}`,
                this.lastCollisionPoint.x + 10,
                this.lastCollisionPoint.y - 10
            );
        }
        
        ctx.restore();
    }
    
    /**
     * 個別オブジェクトの当たり判定円を描画
     */
    drawHitCircle(ctx, obj, radius, color, lineWidth) {
        const centerX = obj.x + (obj.width || 0) / 2;
        const centerY = obj.y + (obj.height || 0) / 2;
        
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.setLineDash([2, 2]); // 点線
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]); // 点線をリセット
    }
}