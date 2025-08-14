class Game {
    constructor() {
        this.isRunning = false;
        this.lastFrameTime = 0;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
        this.deltaTime = 0;
        
        // FPS tracking
        this.fps = 0;
        this.frameCount = 0;
        this.fpsUpdateTime = 0;
        
        // Debug mode
        this.debugMode = true;
        
        this.init();
    }
    
    init() {
        console.log('Game initializing...');
        
        // Wait for all managers to be ready
        if (!window.canvasManager) {
            setTimeout(() => this.init(), 100);
            return;
        }
        
        this.setupGame();
        this.start();
    }
    
    setupGame() {
        // Initialize bullet manager
        this.bulletManager = new BulletManager();
        
        // Initialize enemy bullet manager
        this.enemyBulletManager = new EnemyBulletManager();
        
        // Initialize player
        this.player = new Player();
        
        // Initialize enemy manager
        this.enemyManager = new EnemyManager();
        
        // Initialize collision manager
        this.collisionManager = new CollisionManager();
        if (this.debugMode) {
            this.collisionManager.setDebugMode(true);
        }
        
        // Initialize effects manager
        this.effectsManager = new EffectsManager();
        
        // Initialize experience manager
        this.experienceManager = new ExperienceManager();
        
        // Initialize UI manager
        this.uiManager = new UIManager();
        
        // Set up experience callbacks
        this.setupExperienceCallbacks();
        
        // Configure collision system
        this.configureCollisions();
        
        // Initialize game objects and managers here
        // This will be expanded in later tickets
        
        console.log('Game setup complete');
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.gameLoop(this.lastFrameTime);
        
        console.log('Game started');
    }
    
    stop() {
        this.isRunning = false;
        console.log('Game stopped');
    }
    
    gameLoop(currentTime) {
        if (!this.isRunning) return;
        
        // Calculate delta time
        this.deltaTime = currentTime - this.lastFrameTime;
        
        // Only update if enough time has passed (60 FPS cap)
        if (this.deltaTime >= this.frameInterval) {
            this.update(this.deltaTime);
            this.render();
            
            this.updateFPS(currentTime);
            this.lastFrameTime = currentTime - (this.deltaTime % this.frameInterval);
        }
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        // Update game state managers
        if (window.gameState) {
            window.gameState.update(deltaTime);
        }
        
        if (window.inputManager) {
            window.inputManager.update();
            
            // デバッグモード切り替え（Dキーで切り替え）
            if (window.inputManager.isActionJustPressed && 
                window.inputManager.isActionJustPressed('debug')) {
                this.toggleDebugMode();
            }
        }
        
        // Update UI manager
        if (this.uiManager) {
            this.uiManager.update(deltaTime);
        }
        
        // Update game objects
        if (this.player) {
            this.player.update(deltaTime);
            
            // Handle shooting input
            this.handleShooting(deltaTime);
        }
        
        // Update bullet manager
        if (this.bulletManager) {
            this.bulletManager.update(deltaTime);
        }
        
        // Update enemy manager
        if (this.enemyManager) {
            const playerX = this.player ? this.player.x + this.player.width / 2 : null;
            const playerY = this.player ? this.player.y + this.player.height / 2 : null;
            this.enemyManager.update(deltaTime, performance.now(), this.enemyBulletManager, playerX, playerY);
        }
        
        // Update enemy bullets
        if (this.enemyBulletManager) {
            const playerX = this.player ? this.player.x + this.player.width / 2 : null;
            const playerY = this.player ? this.player.y + this.player.height / 2 : null;
            this.enemyBulletManager.update(deltaTime, playerX, playerY);
        }
        
        // Collision detection
        if (this.collisionManager) {
            this.collisionManager.checkCollisions(
                this.player, 
                this.bulletManager, 
                this.enemyManager, 
                this.enemyBulletManager, 
                deltaTime,
                this.effectsManager,
                this.experienceManager
            );
        }
        
        // Update effects
        if (this.effectsManager) {
            this.effectsManager.update(deltaTime);
        }
        
        // Future updates will be added in later tickets
    }
    
    render() {
        if (!window.canvasManager) return;
        
        const ctx = window.canvasManager.ctx;
        
        // Clear and draw background
        window.canvasManager.clear();
        window.canvasManager.drawBackground();
        
        // Render game objects
        if (this.player) {
            this.player.render(ctx);
        }
        
        // Render bullets
        if (this.bulletManager) {
            this.bulletManager.render(ctx);
        }
        
        // Render enemies
        if (this.enemyManager) {
            this.enemyManager.draw(ctx);
        }
        
        // Render enemy bullets
        if (this.enemyBulletManager) {
            this.enemyBulletManager.render(ctx);
        }
        
        // Render effects
        if (this.effectsManager) {
            this.effectsManager.render(ctx);
        }
        
        // Future renders will be added in later tickets
        
        // Render collision debug info
        if (this.collisionManager && this.debugMode) {
            this.collisionManager.renderDebug(
                ctx, 
                this.player, 
                this.bulletManager, 
                this.enemyManager, 
                this.enemyBulletManager
            );
        }
        
        // Render UI
        if (this.uiManager) {
            this.uiManager.render(ctx);
        }
        
        // Debug rendering
        if (this.debugMode) {
            this.renderDebug(ctx);
        }
    }
    
    renderDebug(ctx) {
        // Draw debug info on canvas if needed
        ctx.fillStyle = '#00ff00';
        ctx.font = '12px Courier New';
        ctx.fillText(`Canvas FPS: ${this.fps}`, window.canvasManager.width - 120, window.canvasManager.height - 20);
        
        // Add more debug info as needed
        ctx.fillText(`Delta: ${this.deltaTime.toFixed(1)}ms`, window.canvasManager.width - 120, window.canvasManager.height - 40);
        
        // Enemy debug info
        if (this.enemyManager) {
            const enemyDebug = this.enemyManager.getDebugInfo();
            ctx.fillText(`Enemies: ${enemyDebug.activeEnemies}/${enemyDebug.maxActiveEnemies}`, window.canvasManager.width - 120, window.canvasManager.height - 60);
            
            // Show enemy type counts
            const typeCounts = enemyDebug.enemyTypeCounts;
            let yOffset = 80;
            for (const [type, count] of Object.entries(typeCounts)) {
                ctx.fillText(`${type}: ${count}`, window.canvasManager.width - 120, window.canvasManager.height - yOffset);
                yOffset += 15;
            }
        }
        
        // Enemy bullet debug info
        if (this.enemyBulletManager) {
            const bulletDebug = this.enemyBulletManager.getDebugInfo();
            ctx.fillText(`E-Bullets: ${bulletDebug.activeBullets}/${bulletDebug.maxActiveBullets}`, window.canvasManager.width - 120, window.canvasManager.height - 140);
        }
        
        // Collision debug info
        if (this.collisionManager) {
            const collisionDebug = this.collisionManager.getDebugInfo();
            ctx.fillText(`Collisions: ${collisionDebug.collisionsThisFrame} (${collisionDebug.checksThisFrame} checks, ${collisionDebug.skippedChecks} skipped)`, window.canvasManager.width - 380, window.canvasManager.height - 20);
        }
        
        // Effects debug info
        if (this.effectsManager) {
            const effectsDebug = this.effectsManager.getDebugInfo();
            ctx.fillText(`Effects: ${effectsDebug.activeEffects}/${effectsDebug.totalEffectsInUse}`, window.canvasManager.width - 120, window.canvasManager.height - 160);
        }
        
        // Collision system status
        if (this.collisionManager) {
            const optimizationInfo = this.collisionManager.getDebugInfo().optimizationEnabled;
            ctx.fillText(`Collision optimized: ${optimizationInfo.useScreenBounds ? 'ON' : 'OFF'}`, window.canvasManager.width - 200, window.canvasManager.height - 180);
        }
        
        // Experience debug info
        if (this.experienceManager) {
            const expDebug = this.experienceManager.getDebugInfo();
            ctx.fillText(`Level: ${expDebug.level} (${expDebug.currentExp}/${expDebug.expToNext}) ${expDebug.progress}%`, window.canvasManager.width - 250, window.canvasManager.height - 200);
        }
    }
    
    updateFPS(currentTime) {
        this.frameCount++;
        
        if (currentTime >= this.fpsUpdateTime + 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.fpsUpdateTime));
            this.frameCount = 0;
            this.fpsUpdateTime = currentTime;
            
            // Update HTML FPS counter
            const fpsElement = document.getElementById('fps');
            if (fpsElement) {
                fpsElement.textContent = `FPS: ${this.fps}`;
            }
        }
    }
    
    // Shooting input handling
    handleShooting(deltaTime) {
        if (!this.player || !this.bulletManager || !window.inputManager) return;
        
        // プレイヤーが生きているかチェック
        if (!this.player.alive) {
            this.bulletManager.stopAutoFire();
            return;
        }
        
        // タップ/クリック、またはスペースキーで自動連射
        const shouldShoot = window.inputManager.isPointerDown() || 
                          window.inputManager.isActionDown('shoot');
        
        if (shouldShoot) {
            if (!this.bulletManager.autoFiring) {
                this.bulletManager.startAutoFire();
            }
            // プレイヤー位置から弾を自動発射
            this.bulletManager.updateAutoFire(this.player.x, this.player.y);
        } else {
            this.bulletManager.stopAutoFire();
        }
    }

    // Debug methods
    toggleDebugMode() {
        this.debugMode = !this.debugMode;
        
        if (this.collisionManager) {
            this.collisionManager.setDebugMode(this.debugMode);
        }
        
        console.log(`Debug mode: ${this.debugMode ? 'ON' : 'OFF'}`);
        
        // UI notification
        if (window.uiManager) {
            window.uiManager.showMessage(
                `DEBUG: ${this.debugMode ? 'ON' : 'OFF'}`, 
                1000, 
                this.debugMode ? 'var(--neon-green)' : 'var(--neon-red)'
            );
        }
    }
    
    // Collision system configuration
    configureCollisions() {
        if (!this.collisionManager) return;
        
        // デフォルトの衝突システム設定
        this.collisionManager.setOptimization({
            useScreenBounds: true,
            earlyReturn: true,
            maxChecksPerFrame: 500, // 調整されたフレーム当たりの最大チェック数
            spatialOptimization: true
        });
        
        console.log('Collision system configured with balanced settings');
    }
    
    // Experience system setup
    setupExperienceCallbacks() {
        if (!this.experienceManager) return;
        
        // レベルアップ時のコールバック
        this.experienceManager.setOnLevelUp((oldLevel, newLevel) => {
            console.log(`レベルアップ！Lv.${oldLevel} → Lv.${newLevel}`);
            
            // ショットパターンの更新
            this.updateShotPattern(newLevel);
            
            // レベルアップエフェクト
            this.showLevelUpEffect(newLevel);
            
            // UI通知とアニメーション
            if (this.uiManager) {
                this.uiManager.showMessage(
                    `LEVEL UP! ${newLevel}`,
                    2000,
                    '#00ff00'
                );
                this.uiManager.startLevelUpAnimation(newLevel);
            }
        });
        
        // 経験値獲得時のコールバック
        this.experienceManager.setOnExpGain((amount, currentExp, totalExp, enemy) => {
            console.log(`経験値 +${amount} (現在: ${currentExp})`);
            
            // 敵の位置で経験値獲得アニメーションを表示
            if (this.uiManager && enemy) {
                const enemyX = enemy.x + (enemy.width || 0) / 2;
                const enemyY = enemy.y + (enemy.height || 0) / 2;
                this.uiManager.startExpGainAnimation(enemyX, enemyY, amount);
            }
        });
    }
    
    // ショットパターン更新
    updateShotPattern(level) {
        if (!this.bulletManager) return;
        
        this.bulletManager.setLevel(level);
        console.log(`ショットパターンをレベル${level}に更新`);
    }
    
    // レベルアップエフェクト表示（後で実装）
    showLevelUpEffect(level) {
        // 現在はプレースホルダー
        console.log(`レベル${level}アップエフェクト表示（未実装）`);
    }
    
    // Game state methods
    pause() {
        // Will be implemented with GameState manager
        console.log('Game paused');
    }
    
    resume() {
        // Will be implemented with GameState manager
        console.log('Game resumed');
    }
    
    reset() {
        // Reset game to initial state
        console.log('Game reset');
    }
    
    // Error handling
    handleError(error) {
        console.error('Game error:', error);
        this.stop();
        
        // Display error to user
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 8px;
            font-family: monospace;
            z-index: 1000;
        `;
        errorDiv.textContent = `Game Error: ${error.message}`;
        document.body.appendChild(errorDiv);
    }
}

// Global error handling
window.addEventListener('error', (event) => {
    if (window.game) {
        window.game.handleError(event.error);
    }
});

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.game = new Game();
    } catch (error) {
        console.error('Failed to initialize game:', error);
    }
});