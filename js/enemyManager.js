class EnemyManager {
    constructor() {
        this.enemies = [];
        this.enemyPools = {
            [ENEMY_TYPES.SMALL]: [],
            [ENEMY_TYPES.MEDIUM]: [],
            [ENEMY_TYPES.LARGE]: []
        };
        this.maxEnemies = {
            [ENEMY_TYPES.SMALL]: 15,
            [ENEMY_TYPES.MEDIUM]: 8,
            [ENEMY_TYPES.LARGE]: 3
        };
        this.spawnTimer = 0;
        this.spawnInterval = 2000;
        this.lastSpawnTime = 0;
        this.maxActiveEnemies = 10;
        
        // 敵タイプ別出現確率（重み）
        this.spawnWeights = {
            [ENEMY_TYPES.SMALL]: 70,    // 70%
            [ENEMY_TYPES.MEDIUM]: 25,   // 25%
            [ENEMY_TYPES.LARGE]: 5      // 5%
        };
        
        this.initializePools();
    }

    initializePools() {
        // 小型機プール
        for (let i = 0; i < this.maxEnemies[ENEMY_TYPES.SMALL]; i++) {
            this.enemyPools[ENEMY_TYPES.SMALL].push(new SmallEnemy(0, 0));
        }
        
        // 中型機プール
        for (let i = 0; i < this.maxEnemies[ENEMY_TYPES.MEDIUM]; i++) {
            this.enemyPools[ENEMY_TYPES.MEDIUM].push(new MediumEnemy(0, 0));
        }
        
        // 大型機プール
        for (let i = 0; i < this.maxEnemies[ENEMY_TYPES.LARGE]; i++) {
            this.enemyPools[ENEMY_TYPES.LARGE].push(new LargeEnemy(0, 0));
        }
    }

    getFromPool(enemyType) {
        const pool = this.enemyPools[enemyType];
        if (!pool) return null;
        
        for (let i = 0; i < pool.length; i++) {
            const enemy = pool[i];
            if (!enemy.active) {
                enemy.reset();
                return enemy;
            }
        }
        return null;
    }

    selectRandomEnemyType() {
        const totalWeight = Object.values(this.spawnWeights).reduce((sum, weight) => sum + weight, 0);
        const random = Math.random() * totalWeight;
        
        let currentWeight = 0;
        for (const [type, weight] of Object.entries(this.spawnWeights)) {
            currentWeight += weight;
            if (random <= currentWeight) {
                return type;
            }
        }
        
        return ENEMY_TYPES.SMALL; // フォールバック
    }

    spawnEnemy(x, y, enemyType = null) {
        if (!enemyType) {
            enemyType = this.selectRandomEnemyType();
        }
        
        const enemy = this.getFromPool(enemyType);
        
        if (enemy && this.getActiveEnemyCount() < this.maxActiveEnemies) {
            enemy.x = x;
            enemy.y = y;
            enemy.active = true;
            this.enemies.push(enemy);
            console.log(`${enemyType} spawned at (${x.toFixed(1)}, ${y.toFixed(1)}), Active: ${this.getActiveEnemyCount()}`);
            return enemy;
        }
        return null;
    }

    spawnRandomEnemy() {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) return null;

        const margin = 40;
        const x = Math.random() * (canvas.width - margin * 2) + margin;
        const y = -40;
        
        return this.spawnEnemy(x, y);
    }

    update(deltaTime, currentTime, enemyBulletManager = null, playerX = null, playerY = null) {
        this.updateSpawning(currentTime);
        this.updateEnemies(deltaTime, enemyBulletManager, playerX, playerY);
        this.cleanupEnemies();
    }

    updateSpawning(currentTime) {
        if (currentTime - this.lastSpawnTime >= this.spawnInterval) {
            if (this.getActiveEnemyCount() < this.maxActiveEnemies) {
                this.spawnRandomEnemy();
                this.lastSpawnTime = currentTime;
                
                this.spawnInterval = Math.random() * 1500 + 800;
            }
        }
    }

    updateEnemies(deltaTime, enemyBulletManager, playerX, playerY) {
        for (let i = 0; i < this.enemies.length; i++) {
            const enemy = this.enemies[i];
            if (enemy.active) {
                // 中型機・大型機の場合は攻撃処理も含める
                if (enemy.type === ENEMY_TYPES.MEDIUM || enemy.type === ENEMY_TYPES.LARGE) {
                    enemy.update(deltaTime, enemyBulletManager, playerX, playerY);
                } else {
                    enemy.update(deltaTime);
                }
            }
        }
    }

    cleanupEnemies() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (enemy.destroyed || !enemy.active) {
                this.enemies.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        for (let i = 0; i < this.enemies.length; i++) {
            const enemy = this.enemies[i];
            if (enemy.active) {
                enemy.draw(ctx);
            }
        }
    }

    getActiveEnemies() {
        return this.enemies.filter(enemy => enemy.active && !enemy.destroyed);
    }

    getActiveEnemyCount() {
        return this.getActiveEnemies().length;
    }

    destroyAllEnemies() {
        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].destroy();
        }
        this.enemies = [];
    }

    reset() {
        this.destroyAllEnemies();
        this.spawnTimer = 0;
        this.lastSpawnTime = 0;
        this.spawnInterval = 2000;
    }

    getDebugInfo() {
        const enemyTypeCounts = {};
        this.enemies.forEach(enemy => {
            if (enemy.active) {
                enemyTypeCounts[enemy.type] = (enemyTypeCounts[enemy.type] || 0) + 1;
            }
        });
        
        return {
            activeEnemies: this.getActiveEnemyCount(),
            totalEnemies: this.enemies.length,
            enemyTypeCounts: enemyTypeCounts,
            maxActiveEnemies: this.maxActiveEnemies,
            spawnInterval: this.spawnInterval,
            poolSizes: {
                small: this.enemyPools[ENEMY_TYPES.SMALL].length,
                medium: this.enemyPools[ENEMY_TYPES.MEDIUM].length,
                large: this.enemyPools[ENEMY_TYPES.LARGE].length
            }
        };
    }
}