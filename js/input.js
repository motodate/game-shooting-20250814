class InputManager {
    constructor() {
        // Input state
        this.keys = {};
        this.mouse = {
            x: 0,
            y: 0,
            pressed: false,
            justPressed: false,
            justReleased: false
        };
        this.touch = {
            x: 0,
            y: 0,
            pressed: false,
            justPressed: false,
            justReleased: false,
            identifier: null
        };
        
        // Previous frame state for "just pressed" detection
        this.prevKeys = {};
        this.prevMouse = { pressed: false };
        this.prevTouch = { pressed: false };
        
        // Input mapping
        this.keyBindings = {
            // Movement
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'KeyW': 'up',
            'KeyS': 'down',
            'KeyA': 'left',
            'KeyD': 'right',
            
            // Actions
            'Space': 'shoot',
            'KeyX': 'shoot',
            'KeyZ': 'timeslow',
            'ShiftLeft': 'timeslow',
            'ShiftRight': 'timeslow',
            
            // System
            'KeyP': 'pause',
            'Escape': 'pause',
            'KeyR': 'reset'
        };
        
        this.init();
    }
    
    init() {
        this.bindKeyboardEvents();
        this.bindMouseEvents();
        this.bindTouchEvents();
        
        console.log('InputManager initialized');
    }
    
    bindKeyboardEvents() {
        document.addEventListener('keydown', (event) => {
            event.preventDefault();
            this.keys[event.code] = true;
        });
        
        document.addEventListener('keyup', (event) => {
            event.preventDefault();
            this.keys[event.code] = false;
        });
        
        // Prevent context menu and other browser shortcuts
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space' || 
                event.code === 'F5' || 
                event.code === 'F11' ||
                event.code === 'F12') {
                event.preventDefault();
            }
        });
    }
    
    bindMouseEvents() {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) return;
        
        canvas.addEventListener('mousedown', (event) => {
            event.preventDefault();
            this.updateMousePosition(event);
            this.mouse.pressed = true;
        });
        
        canvas.addEventListener('mouseup', (event) => {
            event.preventDefault();
            this.updateMousePosition(event);
            this.mouse.pressed = false;
        });
        
        canvas.addEventListener('mousemove', (event) => {
            this.updateMousePosition(event);
        });
        
        canvas.addEventListener('mouseleave', () => {
            this.mouse.pressed = false;
        });
        
        // Disable right-click context menu
        canvas.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
    }
    
    bindTouchEvents() {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) return;
        
        canvas.addEventListener('touchstart', (event) => {
            event.preventDefault();
            if (event.touches.length > 0) {
                const touch = event.touches[0];
                this.updateTouchPosition(touch);
                this.touch.pressed = true;
                this.touch.identifier = touch.identifier;
            }
        }, { passive: false });
        
        canvas.addEventListener('touchend', (event) => {
            event.preventDefault();
            this.touch.pressed = false;
            this.touch.identifier = null;
        }, { passive: false });
        
        canvas.addEventListener('touchmove', (event) => {
            event.preventDefault();
            if (event.touches.length > 0) {
                const touch = Array.from(event.touches).find(t => 
                    t.identifier === this.touch.identifier
                );
                if (touch) {
                    this.updateTouchPosition(touch);
                }
            }
        }, { passive: false });
        
        canvas.addEventListener('touchcancel', (event) => {
            event.preventDefault();
            this.touch.pressed = false;
            this.touch.identifier = null;
        }, { passive: false });
        
        // Prevent iOS Safari bounce and zoom
        document.addEventListener('touchmove', (event) => {
            event.preventDefault();
        }, { passive: false });
    }
    
    updateMousePosition(event) {
        if (window.canvasManager) {
            const pos = window.canvasManager.getMousePos(event);
            this.mouse.x = pos.x;
            this.mouse.y = pos.y;
        }
    }
    
    updateTouchPosition(touch) {
        if (window.canvasManager) {
            const pos = window.canvasManager.getTouchPos(touch);
            this.touch.x = pos.x;
            this.touch.y = pos.y;
        }
    }
    
    update() {
        // Update "just pressed/released" states
        this.updateJustPressed();
        
        // Store current state for next frame
        this.prevKeys = { ...this.keys };
        this.prevMouse = { pressed: this.mouse.pressed };
        this.prevTouch = { pressed: this.touch.pressed };
    }
    
    updateJustPressed() {
        // Mouse
        this.mouse.justPressed = this.mouse.pressed && !this.prevMouse.pressed;
        this.mouse.justReleased = !this.mouse.pressed && this.prevMouse.pressed;
        
        // Touch
        this.touch.justPressed = this.touch.pressed && !this.prevTouch.pressed;
        this.touch.justReleased = !this.touch.pressed && this.prevTouch.pressed;
    }
    
    // Input query methods
    isKeyDown(keyCode) {
        return !!this.keys[keyCode];
    }
    
    isKeyJustPressed(keyCode) {
        return this.keys[keyCode] && !this.prevKeys[keyCode];
    }
    
    isKeyJustReleased(keyCode) {
        return !this.keys[keyCode] && this.prevKeys[keyCode];
    }
    
    // Action-based input queries
    isActionDown(action) {
        for (const [keyCode, boundAction] of Object.entries(this.keyBindings)) {
            if (boundAction === action && this.isKeyDown(keyCode)) {
                return true;
            }
        }
        return false;
    }
    
    isActionJustPressed(action) {
        for (const [keyCode, boundAction] of Object.entries(this.keyBindings)) {
            if (boundAction === action && this.isKeyJustPressed(keyCode)) {
                return true;
            }
        }
        return false;
    }
    
    // Mouse/Touch queries
    isPointerDown() {
        return this.mouse.pressed || this.touch.pressed;
    }
    
    isPointerJustPressed() {
        return this.mouse.justPressed || this.touch.justPressed;
    }
    
    isPointerJustReleased() {
        return this.mouse.justReleased || this.touch.justReleased;
    }
    
    getPointerPosition() {
        if (this.touch.pressed) {
            return { x: this.touch.x, y: this.touch.y };
        } else if (this.mouse.pressed) {
            return { x: this.mouse.x, y: this.mouse.y };
        }
        return { x: this.mouse.x, y: this.mouse.y };
    }
    
    // Movement input helpers
    getMovementVector() {
        const vector = { x: 0, y: 0 };
        
        if (this.isActionDown('left')) vector.x -= 1;
        if (this.isActionDown('right')) vector.x += 1;
        if (this.isActionDown('up')) vector.y -= 1;
        if (this.isActionDown('down')) vector.y += 1;
        
        // Normalize diagonal movement
        if (vector.x !== 0 && vector.y !== 0) {
            const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
            vector.x /= magnitude;
            vector.y /= magnitude;
        }
        
        return vector;
    }
    
    // Debug info
    getDebugInfo() {
        const pressedKeys = Object.keys(this.keys).filter(key => this.keys[key]);
        return {
            pressedKeys,
            mouse: this.mouse,
            touch: this.touch,
            movement: this.getMovementVector()
        };
    }
}

// Global input manager instance
window.inputManager = new InputManager();