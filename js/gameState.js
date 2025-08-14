class GameState {
    constructor() {
        // Game states
        this.states = {
            MENU: 'menu',
            PLAYING: 'playing',
            PAUSED: 'paused',
            GAMEOVER: 'gameover',
            CLEAR: 'clear'
        };
        
        this.currentState = this.states.MENU;
        this.previousState = null;
        
        // Game data
        this.score = 0;
        this.highScore = 0;
        this.level = 1;
        this.lives = 3;
        this.maxLives = 3;
        
        // Experience and level up system
        this.experience = 0;
        this.experienceToNext = 100;
        this.maxLevel = 5;
        
        // Time slow system
        this.timeSlowGauge = 0;
        this.maxTimeSlowGauge = 100;
        this.isTimeSlowActive = false;
        this.timeSlowDuration = 0;
        this.maxTimeSlowDuration = 5000; // 5 seconds
        
        // Stage management
        this.currentStage = 1;
        this.maxStages = 3;
        this.stageTimeElapsed = 0;
        this.stageDuration = 60000; // 60 seconds per stage
        
        // Load saved data
        this.loadSaveData();
        
        console.log('GameState initialized');
    }
    
    // State management
    setState(newState) {
        if (this.states[newState] || Object.values(this.states).includes(newState)) {
            this.previousState = this.currentState;
            this.currentState = newState;
            console.log(`State changed: ${this.previousState} -> ${this.currentState}`);
        } else {
            console.error(`Invalid state: ${newState}`);
        }
    }
    
    getCurrentState() {
        return this.currentState;
    }
    
    isState(state) {
        return this.currentState === state;
    }
    
    // Game lifecycle methods
    startGame() {
        this.resetGame();
        this.setState(this.states.PLAYING);
    }
    
    pauseGame() {
        if (this.isState(this.states.PLAYING)) {
            this.setState(this.states.PAUSED);
        }
    }
    
    resumeGame() {
        if (this.isState(this.states.PAUSED)) {
            this.setState(this.states.PLAYING);
        }
    }
    
    gameOver() {
        this.setState(this.states.GAMEOVER);
        this.updateHighScore();
        this.saveData();
    }
    
    gameClear() {
        this.setState(this.states.CLEAR);
        this.updateHighScore();
        this.saveData();
    }
    
    resetGame() {
        this.score = 0;
        this.level = 1;
        this.lives = this.maxLives;
        this.experience = 0;
        this.timeSlowGauge = 0;
        this.isTimeSlowActive = false;
        this.timeSlowDuration = 0;
        this.currentStage = 1;
        this.stageTimeElapsed = 0;
        
        console.log('Game reset');
    }
    
    // Score management
    addScore(points) {
        this.score += points;
        console.log(`Score added: ${points}, Total: ${this.score}`);
    }
    
    updateHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            console.log(`New high score: ${this.highScore}`);
        }
    }
    
    // Lives management
    loseLife() {
        if (this.lives > 0) {
            this.lives--;
            console.log(`Life lost, remaining: ${this.lives}`);
            
            if (this.lives <= 0) {
                this.gameOver();
            }
        }
    }
    
    gainLife() {
        if (this.lives < this.maxLives) {
            this.lives++;
            console.log(`Life gained, total: ${this.lives}`);
        }
    }
    
    // Experience and leveling
    addExperience(exp) {
        this.experience += exp;
        
        // Check for level up
        while (this.experience >= this.experienceToNext && this.level < this.maxLevel) {
            this.levelUp();
        }
    }
    
    levelUp() {
        if (this.level >= this.maxLevel) return;
        
        this.experience -= this.experienceToNext;
        this.level++;
        
        // Increase experience requirement for next level
        this.experienceToNext = Math.floor(this.experienceToNext * 1.2);
        
        console.log(`Level up! Now level ${this.level}`);
    }
    
    getExperiencePercentage() {
        return (this.experience / this.experienceToNext) * 100;
    }
    
    // Time slow system
    addTimeSlowGauge(amount) {
        this.timeSlowGauge = Math.min(this.timeSlowGauge + amount, this.maxTimeSlowGauge);
    }
    
    canActivateTimeSlow() {
        return this.timeSlowGauge >= this.maxTimeSlowGauge && !this.isTimeSlowActive;
    }
    
    activateTimeSlow() {
        if (this.canActivateTimeSlow()) {
            this.isTimeSlowActive = true;
            this.timeSlowDuration = this.maxTimeSlowDuration;
            console.log('Time slow activated');
            return true;
        }
        return false;
    }
    
    deactivateTimeSlow() {
        if (this.isTimeSlowActive) {
            this.isTimeSlowActive = false;
            this.timeSlowDuration = 0;
            this.timeSlowGauge = 0;
            console.log('Time slow deactivated');
        }
    }
    
    getTimeSlowPercentage() {
        if (this.isTimeSlowActive) {
            return (this.timeSlowDuration / this.maxTimeSlowDuration) * 100;
        } else {
            return (this.timeSlowGauge / this.maxTimeSlowGauge) * 100;
        }
    }
    
    // Stage management
    updateStage(deltaTime) {
        if (!this.isState(this.states.PLAYING)) return;
        
        this.stageTimeElapsed += deltaTime;
        
        // Check for stage completion
        if (this.stageTimeElapsed >= this.stageDuration) {
            this.nextStage();
        }
    }
    
    nextStage() {
        if (this.currentStage < this.maxStages) {
            this.currentStage++;
            this.stageTimeElapsed = 0;
            console.log(`Stage ${this.currentStage} started`);
        } else {
            // All stages completed, start boss battle
            console.log('Boss battle begins');
        }
    }
    
    getStageProgress() {
        return (this.stageTimeElapsed / this.stageDuration) * 100;
    }
    
    // Update method called every frame
    update(deltaTime) {
        if (this.isState(this.states.PLAYING)) {
            // Update time slow duration
            if (this.isTimeSlowActive) {
                this.timeSlowDuration -= deltaTime;
                if (this.timeSlowDuration <= 0) {
                    this.deactivateTimeSlow();
                }
            }
            
            // Update stage timer
            this.updateStage(deltaTime);
        }
    }
    
    // Save/Load system
    saveData() {
        const saveData = {
            highScore: this.highScore
        };
        
        try {
            localStorage.setItem('cyberpunk-shooter-save', JSON.stringify(saveData));
        } catch (error) {
            console.warn('Could not save data:', error);
        }
    }
    
    loadSaveData() {
        try {
            const saveData = localStorage.getItem('cyberpunk-shooter-save');
            if (saveData) {
                const data = JSON.parse(saveData);
                this.highScore = data.highScore || 0;
                console.log(`Loaded high score: ${this.highScore}`);
            }
        } catch (error) {
            console.warn('Could not load save data:', error);
        }
    }
    
    // Debug methods
    getDebugInfo() {
        return {
            state: this.currentState,
            score: this.score,
            highScore: this.highScore,
            level: this.level,
            lives: this.lives,
            experience: this.experience,
            experienceToNext: this.experienceToNext,
            timeSlowGauge: this.timeSlowGauge,
            isTimeSlowActive: this.isTimeSlowActive,
            currentStage: this.currentStage,
            stageProgress: this.getStageProgress()
        };
    }
}

// Global game state instance
window.gameState = new GameState();