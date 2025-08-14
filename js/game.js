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
        
        // Initialize player
        this.player = new Player();
        
        // Initialize enemy manager
        this.enemyManager = new EnemyManager();
        
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
        }
        
        if (window.uiManager) {
            window.uiManager.update();
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
            this.enemyManager.update(deltaTime, performance.now());
        }
        
        // Future updates will be added in later tickets
        // - Collision detection
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
        
        // Future renders will be added in later tickets
        // - Effect renders
        
        // Render UI
        if (window.uiManager) {
            window.uiManager.render(ctx);
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
            const activeEnemies = this.enemyManager.getActiveEnemies();
            ctx.fillText(`Enemies: ${enemyDebug.activeEnemies}/${enemyDebug.maxActiveEnemies}`, window.canvasManager.width - 120, window.canvasManager.height - 60);
            
            // Show positions of first 3 active enemies
            for (let i = 0; i < Math.min(3, activeEnemies.length); i++) {
                const enemy = activeEnemies[i];
                ctx.fillText(`E${i}: (${enemy.x.toFixed(0)}, ${enemy.y.toFixed(0)})`, window.canvasManager.width - 120, window.canvasManager.height - 80 - (i * 15));
            }
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