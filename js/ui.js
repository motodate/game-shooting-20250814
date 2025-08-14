class UIManager {
    constructor() {
        this.elements = {
            score: document.getElementById('score'),
            level: document.getElementById('level'),
            lives: document.getElementById('lives'),
            expGauge: document.getElementById('exp-gauge'),
            timeSlowGauge: document.getElementById('timeslow-gauge'),
            timeSlowBtn: document.getElementById('timeslow-btn'),
            fps: document.getElementById('fps')
        };
        
        // Animation states
        this.scoreAnimation = 0;
        this.levelUpAnimation = 0;
        
        // Experience system animations
        this.expGainAnimations = [];
        this.levelUpEffectAnimation = {
            active: false,
            duration: 2000,
            startTime: 0
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateAll();
        console.log('UIManager initialized');
    }
    
    bindEvents() {
        // Time slow button
        if (this.elements.timeSlowBtn) {
            this.elements.timeSlowBtn.addEventListener('click', () => {
                if (window.gameState && window.gameState.canActivateTimeSlow()) {
                    window.gameState.activateTimeSlow();
                }
            });
        }
    }
    
    updateAll() {
        if (!window.gameState) return;
        
        this.updateScore();
        this.updateLevel();
        this.updateLives();
        this.updateGauges();
        this.updateTimeSlowButton();
    }
    
    updateScore() {
        if (this.elements.score && window.gameState) {
            const score = window.gameState.score.toLocaleString();
            this.elements.score.textContent = `SCORE: ${score}`;
            
            // High score indicator
            if (window.gameState.score > window.gameState.highScore) {
                this.elements.score.style.color = 'var(--neon-yellow)';
                this.elements.score.style.textShadow = '0 0 15px var(--neon-yellow)';
            } else {
                this.elements.score.style.color = 'var(--neon-cyan)';
                this.elements.score.style.textShadow = '0 0 10px var(--neon-cyan)';
            }
        }
    }
    
    updateLevel() {
        if (this.elements.level && window.game?.experienceManager) {
            try {
                const currentLevel = window.game.experienceManager.currentLevel;
                this.elements.level.textContent = `LEVEL: ${currentLevel}`;
                
                // Level up animation
                if (this.levelUpAnimation > 0) {
                    this.levelUpAnimation -= 2;
                    const intensity = this.levelUpAnimation / 30;
                    this.elements.level.style.color = `rgba(255, 255, 0, ${intensity})`;
                    this.elements.level.style.textShadow = `0 0 ${20 * intensity}px var(--neon-yellow)`;
                } else {
                    this.elements.level.style.color = 'var(--neon-cyan)';
                    this.elements.level.style.textShadow = '0 0 10px var(--neon-cyan)';
                }
            } catch (error) {
                console.warn('Error updating level:', error);
                this.elements.level.textContent = 'LEVEL: 1';
            }
        }
    }
    
    updateLives() {
        if (this.elements.lives && window.gameState) {
            const livesContainer = this.elements.lives;
            livesContainer.innerHTML = '';
            
            // Create life icons
            for (let i = 0; i < window.gameState.maxLives; i++) {
                const lifeIcon = document.createElement('span');
                lifeIcon.className = 'life-icon';
                
                if (i < window.gameState.lives) {
                    lifeIcon.textContent = '❤️';
                    lifeIcon.style.opacity = '1';
                } else {
                    lifeIcon.textContent = '💔';
                    lifeIcon.style.opacity = '0.3';
                }
                
                livesContainer.appendChild(lifeIcon);
            }
        }
    }
    
    // プレイヤー専用のライフ更新メソッド
    updatePlayerLives(currentLives, maxLives) {
        if (this.elements.lives) {
            const livesContainer = this.elements.lives;
            livesContainer.innerHTML = '';
            
            // プレイヤーのライフアイコンを作成
            for (let i = 0; i < maxLives; i++) {
                const lifeIcon = document.createElement('span');
                lifeIcon.className = 'life-icon';
                
                if (i < currentLives) {
                    lifeIcon.textContent = '❤️';
                    lifeIcon.style.opacity = '1';
                    lifeIcon.style.filter = 'drop-shadow(0 0 3px #ff0080)';
                } else {
                    lifeIcon.textContent = '💔';
                    lifeIcon.style.opacity = '0.3';
                    lifeIcon.style.filter = 'grayscale(100%)';
                }
                
                livesContainer.appendChild(lifeIcon);
            }
        }
    }
    
    updateGauges() {
        // Experience gauge
        if (this.elements.expGauge && window.game?.experienceManager) {
            try {
                const expManager = window.game.experienceManager;
                const expProgress = expManager.getExpProgress();
                const expPercent = Math.floor(expProgress * 100);
                
                this.elements.expGauge.style.width = `${expPercent}%`;
                
                // Full gauge glow effect
                if (expPercent >= 100) {
                    this.elements.expGauge.style.boxShadow = '0 0 20px var(--neon-yellow)';
                } else {
                    this.elements.expGauge.style.boxShadow = '0 0 10px currentColor';
                }
            } catch (error) {
                console.warn('Error updating experience gauge:', error);
            }
        }
        
        // Time slow gauge
        if (this.elements.timeSlowGauge && window.gameState) {
            try {
                const timeSlowPercent = window.gameState.getTimeSlowPercentage ? 
                    window.gameState.getTimeSlowPercentage() : 0;
                this.elements.timeSlowGauge.style.width = `${timeSlowPercent}%`;
                
                // Change color based on state
                if (window.gameState.isTimeSlowActive) {
                    this.elements.timeSlowGauge.style.background = 
                        'linear-gradient(90deg, var(--neon-red), var(--neon-yellow))';
                    this.elements.timeSlowGauge.style.boxShadow = '0 0 15px var(--neon-red)';
                } else if (timeSlowPercent >= 100) {
                    this.elements.timeSlowGauge.style.background = 
                        'linear-gradient(90deg, var(--neon-cyan), var(--neon-magenta))';
                    this.elements.timeSlowGauge.style.boxShadow = '0 0 20px var(--neon-cyan)';
                } else {
                    this.elements.timeSlowGauge.style.background = 
                        'linear-gradient(90deg, var(--neon-cyan), var(--neon-magenta))';
                    this.elements.timeSlowGauge.style.boxShadow = '0 0 10px currentColor';
                }
            } catch (error) {
                console.warn('Error updating time slow gauge:', error);
                // Set default appearance on error
                this.elements.timeSlowGauge.style.width = '0%';
                this.elements.timeSlowGauge.style.background = 
                    'linear-gradient(90deg, var(--neon-cyan), var(--neon-magenta))';
                this.elements.timeSlowGauge.style.boxShadow = '0 0 10px currentColor';
            }
        }
    }
    
    updateTimeSlowButton() {
        if (this.elements.timeSlowBtn && window.gameState) {
            const canActivate = window.gameState.canActivateTimeSlow();
            
            this.elements.timeSlowBtn.disabled = !canActivate;
            
            if (window.gameState.isTimeSlowActive) {
                this.elements.timeSlowBtn.textContent = 'ACTIVE';
                this.elements.timeSlowBtn.style.backgroundColor = 'var(--neon-red)';
                this.elements.timeSlowBtn.style.color = 'var(--dark-bg)';
                this.elements.timeSlowBtn.style.boxShadow = '0 0 20px var(--neon-red)';
            } else if (canActivate) {
                this.elements.timeSlowBtn.textContent = 'TIME SLOW';
                this.elements.timeSlowBtn.style.backgroundColor = 'var(--neon-cyan)';
                this.elements.timeSlowBtn.style.color = 'var(--dark-bg)';
                this.elements.timeSlowBtn.style.boxShadow = '0 0 20px var(--neon-cyan)';
            } else {
                this.elements.timeSlowBtn.textContent = 'TIME SLOW';
                this.elements.timeSlowBtn.style.backgroundColor = 'var(--dark-panel)';
                this.elements.timeSlowBtn.style.color = 'var(--neon-cyan)';
                this.elements.timeSlowBtn.style.boxShadow = '0 0 5px var(--neon-cyan)';
            }
        }
    }
    
    // Animation triggers
    triggerScoreAnimation() {
        this.scoreAnimation = 30; // frames
    }
    
    triggerLevelUpAnimation() {
        this.levelUpAnimation = 60; // frames
        console.log('Level up animation triggered');
    }
    
    // Canvas-based UI rendering (for in-game overlays)
    render(ctx) {
        if (!window.gameState || !ctx) return;
        
        // Render canvas-based UI elements here if needed
        // For now, we use HTML-based UI, but this can be extended
        
        this.renderDebugInfo(ctx);
    }
    
    renderDebugInfo(ctx) {
        if (!window.game || !window.game.debugMode) return;
        
        ctx.save();
        ctx.fillStyle = '#00ff00';
        ctx.font = '10px Courier New';
        
        const debugInfo = [
            `State: ${window.gameState.currentState}`,
            `Stage: ${window.gameState.currentStage}`,
            `Lives: ${window.gameState.lives}`,
            `Exp: ${Math.floor(window.gameState.getExperiencePercentage())}%`
        ];
        
        debugInfo.forEach((info, index) => {
            ctx.fillText(info, 10, window.canvasManager.height - 120 + (index * 12));
        });
        
        ctx.restore();
    }
    
    // Show temporary messages
    showMessage(message, duration = 2000, color = 'var(--neon-cyan)') {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: ${color};
            padding: 20px 40px;
            border: 2px solid ${color};
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 24px;
            font-weight: bold;
            text-shadow: 0 0 10px currentColor;
            box-shadow: 0 0 20px ${color};
            z-index: 1000;
            pointer-events: none;
        `;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        // Remove after duration
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, duration);
    }
    
    // Handle screen transitions
    showScreen(screen) {
        // Hide all screens first
        const screens = ['start-screen', 'game-screen', 'pause-screen', 'gameover-screen', 'clear-screen'];
        screens.forEach(screenId => {
            const element = document.getElementById(screenId);
            if (element) {
                element.style.display = 'none';
            }
        });
        
        // Show requested screen
        const targetScreen = document.getElementById(screen);
        if (targetScreen) {
            targetScreen.style.display = 'block';
        }
    }
    
    // Update method called every frame
    update() {
        this.updateAll();
        
        // Update animations
        if (this.scoreAnimation > 0) {
            this.scoreAnimation--;
        }
        
        if (this.levelUpAnimation > 0) {
            this.levelUpAnimation--;
        }
        
        // Update experience animations
        this.updateExpGainAnimations();
        this.updateLevelUpEffectAnimation();
    }
    
    // Experience system methods
    startLevelUpAnimation(level) {
        this.levelUpAnimation = 60; // フレーム数
        this.levelUpEffectAnimation = {
            active: true,
            level: level,
            duration: 2000,
            startTime: Date.now()
        };
        
        // Show level up message
        this.showMessage(`LEVEL UP! ${level}`, 2000, 'var(--neon-green)');
        console.log(`Level up animation started for level ${level}`);
    }
    
    startExpGainAnimation(x, y, amount) {
        const animation = {
            id: Date.now() + Math.random(),
            x: x,
            y: y,
            amount: amount,
            startTime: Date.now(),
            duration: 1500,
            opacity: 1
        };
        
        this.expGainAnimations.push(animation);
        
        // Limit number of animations
        if (this.expGainAnimations.length > 10) {
            this.expGainAnimations.shift();
        }
    }
    
    updateExpGainAnimations() {
        for (let i = this.expGainAnimations.length - 1; i >= 0; i--) {
            const animation = this.expGainAnimations[i];
            const elapsed = Date.now() - animation.startTime;
            const progress = elapsed / animation.duration;
            
            if (progress >= 1) {
                this.expGainAnimations.splice(i, 1);
                continue;
            }
            
            // Update animation properties
            animation.opacity = 1 - progress;
        }
    }
    
    updateLevelUpEffectAnimation() {
        if (!this.levelUpEffectAnimation.active) return;
        
        const elapsed = Date.now() - this.levelUpEffectAnimation.startTime;
        if (elapsed >= this.levelUpEffectAnimation.duration) {
            this.levelUpEffectAnimation.active = false;
        }
    }
    
    // Canvas rendering for experience animations
    renderExpAnimations(ctx) {
        if (!ctx || this.expGainAnimations.length === 0) return;
        
        ctx.save();
        
        this.expGainAnimations.forEach(animation => {
            if (animation.opacity <= 0) return;
            
            ctx.globalAlpha = animation.opacity;
            ctx.fillStyle = '#ffff00';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            
            // Shadow effect
            ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = 8;
            
            const elapsed = Date.now() - animation.startTime;
            const progress = elapsed / animation.duration;
            const offsetY = progress * 40; // Move up
            
            ctx.fillText(`+${animation.amount} EXP`, animation.x, animation.y - offsetY);
        });
        
        ctx.restore();
    }
}

// Global UI manager instance
window.uiManager = new UIManager();