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
     * プレイヤー弾と敵の衝突チェック
     */
    checkPlayerBulletsVsEnemies(bulletManager, enemyManager) {
        if (!bulletManager || !enemyManager) return;
        if (!bulletManager.activeBullets || !enemyManager.enemies) return;
        
        const bulletsToRemove = [];
        const enemiesToDestroy = [];
        
        // 全ての弾について敵との衝突をチェック
        for (let i = 0; i < bulletManager.activeBullets.length; i++) {
            const bullet = bulletManager.activeBullets[i];
            if (!bullet.active) continue;
            
            // 画面外チェック（最適化）
            if (bullet.y < 0) {
                bulletsToRemove.push(bullet);
                continue;
            }
            
            const bulletRadius = this.getCollisionRadius(bullet);
            let bulletHit = false;
            
            // 全ての敵について衝突をチェック
            for (let j = 0; j < enemyManager.enemies.length; j++) {
                const enemy = enemyManager.enemies[j];
                if (!enemy.active || enemy.destroyed) continue;
                
                const enemyRadius = this.getCollisionRadius(enemy);
                
                // 衝突判定
                if (this.isCircleCollision(bullet, enemy, bulletRadius, enemyRadius)) {
                    // 敵にダメージを与える
                    const isDestroyed = enemy.takeDamage(bullet.damage || 1);
                    
                    if (isDestroyed) {
                        enemiesToDestroy.push(enemy);
                        console.log(`Enemy destroyed by bullet at (${enemy.x.toFixed(0)}, ${enemy.y.toFixed(0)})`);
                    }
                    
                    // 弾を削除対象に追加
                    bulletsToRemove.push(bullet);
                    bulletHit = true;
                    
                    // デバッグモードで衝突点を記録
                    if (this.debugMode) {
                        this.lastCollisionPoint = this.getCollisionPoint(bullet, enemy);
                        this.lastCollisionPoint.distance = Math.sqrt(
                            Math.pow(this.lastCollisionPoint.x - (bullet.x + bullet.width/2), 2) +
                            Math.pow(this.lastCollisionPoint.y - (bullet.y + bullet.height/2), 2)
                        );
                        this.lastCollisionPoint.combinedRadius = bulletRadius + enemyRadius;
                    }
                    
                    break; // この弾は1つの敵にしか当たらない
                }
            }
        }
        
        // 衝突した弾を削除
        bulletsToRemove.forEach(bullet => {
            this.removeBullet(bulletManager, bullet);
        });
        
        // 破壊された敵の処理は敵側で自動的に処理される（takeDamageで既に処理済み）
        
        // 衝突があった場合のみログ出力
        if (bulletsToRemove.length > 0 || enemiesToDestroy.length > 0) {
            console.log(`Player bullets hit: ${bulletsToRemove.length}, Enemies destroyed: ${enemiesToDestroy.length}`);
        }
    }
    
    /**
     * 弾をマネージャーから削除
     */
    removeBullet(bulletManager, bullet) {
        if (!bullet || !bullet.active) return;
        
        // 弾を非アクティブにしてプールに戻す
        bullet.active = false;
        bullet.pooled = true;
        
        // activeBullets配列から削除
        const index = bulletManager.activeBullets.indexOf(bullet);
        if (index !== -1) {
            bulletManager.activeBullets.splice(index, 1);
        }
        
        // プールに戻す
        if (bulletManager.bulletPool && bulletManager.bulletPool.length < bulletManager.poolSize) {
            bulletManager.bulletPool.push(bullet);
            bulletManager.bulletsRecycled++;
        }
    }
    
    /**
     * 敵弾とプレイヤーの衝突チェック
     */
    checkEnemyBulletsVsPlayer(enemyBulletManager, player) {
        if (!enemyBulletManager || !player) return;
        if (!enemyBulletManager.bullets || !player.alive) return;
        
        // 無敵時間中は衝突チェックをスキップ
        if (player.invincible) return;
        
        const bulletsToRemove = [];
        let playerHit = false;
        
        const playerRadius = this.getCollisionRadius(player);
        
        // 全ての敵弾について衝突をチェック
        for (let i = 0; i < enemyBulletManager.bullets.length; i++) {
            const bullet = enemyBulletManager.bullets[i];
            if (!bullet.active) continue;
            
            // 画面外チェック（最適化）
            if (bullet.y > window.canvasManager?.height + bullet.height ||
                bullet.x < -bullet.width ||
                bullet.x > window.canvasManager?.width + bullet.width) {
                bulletsToRemove.push(bullet);
                continue;
            }
            
            const bulletRadius = this.getCollisionRadius(bullet);
            
            // プレイヤーとの衝突判定
            if (this.isCircleCollision(bullet, player, bulletRadius, playerRadius)) {
                // プレイヤーにダメージを与える
                const isDead = player.takeDamage();
                
                console.log(`Player hit by enemy bullet at (${player.x.toFixed(0)}, ${player.y.toFixed(0)})`);
                
                if (isDead) {
                    console.log('Player died from enemy bullet');
                }
                
                // 敵弾を削除対象に追加
                bulletsToRemove.push(bullet);
                playerHit = true;
                
                // デバッグモードで衝突点を記録
                if (this.debugMode) {
                    this.lastCollisionPoint = this.getCollisionPoint(bullet, player);
                    this.lastCollisionPoint.distance = Math.sqrt(
                        Math.pow(this.lastCollisionPoint.x - (bullet.x + bullet.width/2), 2) +
                        Math.pow(this.lastCollisionPoint.y - (bullet.y + bullet.height/2), 2)
                    );
                    this.lastCollisionPoint.combinedRadius = bulletRadius + playerRadius;
                }
                
                // プレイヤーは複数の弾に同時に当たらない（無敵時間があるため）
                break;
            }
        }
        
        // 衝突した弾を削除
        bulletsToRemove.forEach(bullet => {
            this.removeEnemyBullet(enemyBulletManager, bullet);
        });
        
        // 衝突があった場合のみログ出力
        if (playerHit || bulletsToRemove.length > 0) {
            console.log(`Enemy bullets removed: ${bulletsToRemove.length}, Player hit: ${playerHit}`);
        }
    }
    
    /**
     * 敵弾をマネージャーから削除
     */
    removeEnemyBullet(enemyBulletManager, bullet) {
        if (!bullet || !bullet.active) return;
        
        // 弾を非アクティブにする
        bullet.active = false;
        
        // bullets配列から削除
        const index = enemyBulletManager.bullets.indexOf(bullet);
        if (index !== -1) {
            enemyBulletManager.bullets.splice(index, 1);
        }
        
        // プールに戻す処理は敵弾マネージャー側で管理される
    }
    
    /**
     * プレイヤーと敵機体の衝突チェック
     */
    checkPlayerVsEnemies(player, enemyManager) {
        if (!player || !enemyManager) return;
        if (!enemyManager.enemies || !player.alive) return;
        
        // 無敵時間中は衝突チェックをスキップ
        if (player.invincible) return;
        
        const enemiesToDestroy = [];
        let playerHit = false;
        
        const playerRadius = this.getCollisionRadius(player);
        
        // 全ての敵機体について衝突をチェック
        for (let i = 0; i < enemyManager.enemies.length; i++) {
            const enemy = enemyManager.enemies[i];
            if (!enemy.active || enemy.destroyed) continue;
            
            const enemyRadius = this.getCollisionRadius(enemy);
            
            // プレイヤーとの衝突判定
            if (this.isCircleCollision(player, enemy, playerRadius, enemyRadius)) {
                // プレイヤーにダメージを与える（接触ダメージ）
                const isDead = player.takeDamage();
                
                console.log(`Player collided with ${enemy.type} enemy at (${enemy.x.toFixed(0)}, ${enemy.y.toFixed(0)})`);
                
                if (isDead) {
                    console.log('Player died from enemy collision');
                }
                
                playerHit = true;
                
                // 敵の種類に応じた処理
                if (enemy.type === 'small') {
                    // 小型機は即座に破壊
                    enemy.destroy();
                    enemiesToDestroy.push(enemy);
                    console.log('Small enemy destroyed by collision');
                } else {
                    // 中型・大型機はダメージのみ（接触してもそのまま残る）
                    console.log(`${enemy.type} enemy collision - no destruction`);
                }
                
                // デバッグモードで衝突点を記録
                if (this.debugMode) {
                    this.lastCollisionPoint = this.getCollisionPoint(player, enemy);
                    this.lastCollisionPoint.distance = Math.sqrt(
                        Math.pow(this.lastCollisionPoint.x - (player.x + player.width/2), 2) +
                        Math.pow(this.lastCollisionPoint.y - (player.y + player.height/2), 2)
                    );
                    this.lastCollisionPoint.combinedRadius = playerRadius + enemyRadius;
                }
                
                // プレイヤーは複数の敵に同時に当たらない（無敵時間があるため）
                break;
            }
        }
        
        // 衝突があった場合のみログ出力
        if (playerHit || enemiesToDestroy.length > 0) {
            console.log(`Player-enemy collision: ${enemiesToDestroy.length} small enemies destroyed, Player hit: ${playerHit}`);
        }
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
        if (bulletManager && bulletManager.activeBullets) {
            bulletManager.activeBullets.forEach(bullet => {
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