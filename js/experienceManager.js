class ExperienceManager {
    constructor() {
        // レベル関連
        this.currentLevel = 1;
        this.maxLevel = 5;
        
        // 経験値関連
        this.currentExp = 0;
        this.totalExp = 0;
        
        // レベルアップに必要な経験値テーブル
        this.expToNextLevel = {
            1: 10,  // Lv1→2: 10exp
            2: 30,  // Lv2→3: 30exp（累計40）
            3: 60,  // Lv3→4: 60exp（累計100）
            4: 100, // Lv4→5: 100exp（累計200）
            5: 0    // 最大レベル
        };
        
        // 敵タイプ別の経験値
        this.expValues = {
            'small': 1,
            'medium': 3,
            'large': 10
        };
        
        // レベルアップ時のコールバック
        this.onLevelUp = null;
        this.onExpGain = null;
        
        console.log('ExperienceManager initialized');
    }
    
    /**
     * 経験値を獲得
     */
    gainExp(amount, enemy = null) {
        if (this.currentLevel >= this.maxLevel) {
            return; // 最大レベル到達時は経験値を獲得しない
        }
        
        const oldLevel = this.currentLevel;
        this.currentExp += amount;
        this.totalExp += amount;
        
        console.log(`経験値獲得: +${amount} (現在: ${this.currentExp}/${this.getExpToNext()})`);
        
        // 経験値獲得コールバック
        if (this.onExpGain) {
            this.onExpGain(amount, this.currentExp, this.totalExp, enemy);
        }
        
        // レベルアップ判定
        this.checkLevelUp(oldLevel);
    }
    
    /**
     * 敵タイプ別の経験値獲得
     */
    gainExpFromEnemy(enemyType, enemy = null) {
        const expValue = this.expValues[enemyType] || 1;
        this.gainExp(expValue, enemy);
    }
    
    /**
     * レベルアップ判定
     */
    checkLevelUp(oldLevel) {
        while (this.currentLevel < this.maxLevel && 
               this.currentExp >= this.getExpToNext()) {
            
            // 次のレベルに必要な経験値を差し引く
            this.currentExp -= this.getExpToNext();
            this.currentLevel++;
            
            console.log(`レベルアップ！Lv.${oldLevel} → Lv.${this.currentLevel}`);
            
            // レベルアップコールバック
            if (this.onLevelUp) {
                this.onLevelUp(oldLevel, this.currentLevel);
            }
            
            oldLevel = this.currentLevel;
        }
    }
    
    /**
     * 次のレベルに必要な経験値を取得
     */
    getExpToNext() {
        return this.expToNextLevel[this.currentLevel] || 0;
    }
    
    /**
     * 現在のレベルでの進捗率（0.0-1.0）
     */
    getExpProgress() {
        const expToNext = this.getExpToNext();
        if (expToNext === 0) return 1.0; // 最大レベル
        return this.currentExp / expToNext;
    }
    
    /**
     * レベルアップ可能かどうか
     */
    canLevelUp() {
        return this.currentLevel < this.maxLevel && 
               this.currentExp >= this.getExpToNext();
    }
    
    /**
     * 最大レベルに到達しているか
     */
    isMaxLevel() {
        return this.currentLevel >= this.maxLevel;
    }
    
    /**
     * 現在の状態を取得
     */
    getStatus() {
        return {
            level: this.currentLevel,
            currentExp: this.currentExp,
            totalExp: this.totalExp,
            expToNext: this.getExpToNext(),
            progress: this.getExpProgress(),
            isMaxLevel: this.isMaxLevel()
        };
    }
    
    /**
     * レベルアップコールバックを設定
     */
    setOnLevelUp(callback) {
        this.onLevelUp = callback;
    }
    
    /**
     * 経験値獲得コールバックを設定
     */
    setOnExpGain(callback) {
        this.onExpGain = callback;
    }
    
    /**
     * デバッグ情報
     */
    getDebugInfo() {
        return {
            level: this.currentLevel,
            currentExp: this.currentExp,
            totalExp: this.totalExp,
            expToNext: this.getExpToNext(),
            progress: Math.round(this.getExpProgress() * 100),
            maxLevel: this.isMaxLevel()
        };
    }
    
    /**
     * リセット（デバッグ用）
     */
    reset() {
        this.currentLevel = 1;
        this.currentExp = 0;
        this.totalExp = 0;
        console.log('Experience reset to Level 1');
    }
}