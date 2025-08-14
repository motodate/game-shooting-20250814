class EnemyManager {
    constructor() {
        this.enemies = [];
        this.enemyPool = [];
        this.maxEnemies = 20;
        this.spawnTimer = 0;
        this.spawnInterval = 2000;
        this.lastSpawnTime = 0;
        this.maxActiveEnemies = 8;
        
        this.initializePool();
    }

    initializePool() {
        for (let i = 0; i < this.maxEnemies; i++) {
            this.enemyPool.push(new SmallEnemy(0, 0));
        }
    }

    getFromPool() {
        for (let i = 0; i < this.enemyPool.length; i++) {
            const enemy = this.enemyPool[i];
            if (!enemy.active) {
                enemy.reset();
                return enemy;
            }
        }
        return null;
    }

    spawnEnemy(x, y) {
        const enemy = this.getFromPool();
        if (enemy && this.getActiveEnemyCount() < this.maxActiveEnemies) {
            enemy.x = x;
            enemy.y = y;
            enemy.active = true;
            this.enemies.push(enemy);
            return enemy;
        }
        return null;
    }

    spawnRandomEnemy() {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) return null;

        const margin = 20;
        const x = Math.random() * (canvas.width - margin * 2) + margin;
        const y = -20;
        
        return this.spawnEnemy(x, y);
    }

    update(deltaTime, currentTime) {
        this.updateSpawning(currentTime);
        this.updateEnemies(deltaTime);
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

    updateEnemies(deltaTime) {
        for (let i = 0; i < this.enemies.length; i++) {
            const enemy = this.enemies[i];
            if (enemy.active) {
                enemy.update(deltaTime);
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
        return {
            activeEnemies: this.getActiveEnemyCount(),
            totalEnemies: this.enemies.length,
            poolSize: this.enemyPool.length,
            maxActiveEnemies: this.maxActiveEnemies,
            spawnInterval: this.spawnInterval
        };
    }
}