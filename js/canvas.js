class CanvasManager {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.width = 0;
        this.height = 0;
        this.gridOpacity = 0.3;
        this.gridAnimation = 0;
        
        this.init();
    }
    
    init() {
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) {
            throw new Error('Canvas element not found');
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            throw new Error('2D context not supported');
        }
        
        this.setupCanvas();
        this.bindEvents();
        
        console.log('Canvas initialized:', this.width, 'x', this.height);
    }
    
    setupCanvas() {
        // Set canvas size for mobile and desktop
        const maxWidth = Math.min(window.innerWidth * 0.9, 800);
        const maxHeight = Math.min(window.innerHeight * 0.9, 600);
        
        // Maintain 4:3 aspect ratio
        const aspectRatio = 4 / 3;
        
        if (maxWidth / maxHeight > aspectRatio) {
            this.height = maxHeight;
            this.width = maxHeight * aspectRatio;
        } else {
            this.width = maxWidth;
            this.height = maxWidth / aspectRatio;
        }
        
        // Set canvas dimensions
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Set CSS size for crisp rendering
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
        
        // Enable crisp pixel rendering
        this.ctx.imageSmoothingEnabled = false;
        
        console.log('Canvas size set to:', this.width, 'x', this.height);
    }
    
    bindEvents() {
        window.addEventListener('resize', () => {
            this.setupCanvas();
        });
        
        // Prevent context menu on canvas
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
    
    drawBackground() {
        // Update animation
        this.gridAnimation += 0.02;
        
        // Draw dark background
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw cyberpunk grid
        this.drawGrid();
        
        // Draw scan lines effect
        this.drawScanLines();
    }
    
    drawGrid() {
        const gridSize = 40;
        const offsetY = (this.gridAnimation * 20) % gridSize;
        
        this.ctx.strokeStyle = `rgba(51, 51, 102, ${this.gridOpacity})`;
        this.ctx.lineWidth = 1;
        
        this.ctx.beginPath();
        
        // Vertical lines
        for (let x = 0; x <= this.width; x += gridSize) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
        }
        
        // Horizontal lines with animation
        for (let y = -gridSize + offsetY; y <= this.height + gridSize; y += gridSize) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
        }
        
        this.ctx.stroke();
        
        // Add grid glow effect
        this.ctx.shadowColor = '#333366';
        this.ctx.shadowBlur = 2;
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }
    
    drawScanLines() {
        const scanLineSpacing = 4;
        const scanOpacity = 0.1;
        
        this.ctx.fillStyle = `rgba(0, 255, 255, ${scanOpacity})`;
        
        for (let y = 0; y < this.height; y += scanLineSpacing) {
            this.ctx.fillRect(0, y, this.width, 1);
        }
    }
    
    // Utility methods for drawing neon effects
    drawNeonRect(x, y, width, height, color, glowSize = 10) {
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = glowSize;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);
        this.ctx.shadowBlur = 0;
    }
    
    drawNeonCircle(x, y, radius, color, glowSize = 10) {
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = glowSize;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }
    
    drawNeonLine(x1, y1, x2, y2, color, glowSize = 10) {
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = glowSize;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }
    
    // Screen coordinate helpers
    getMousePos(event) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.width / rect.width;
        const scaleY = this.height / rect.height;
        
        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY
        };
    }
    
    getTouchPos(touch) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.width / rect.width;
        const scaleY = this.height / rect.height;
        
        return {
            x: (touch.clientX - rect.left) * scaleX,
            y: (touch.clientY - rect.top) * scaleY
        };
    }
}

// Global canvas manager instance
window.canvasManager = new CanvasManager();