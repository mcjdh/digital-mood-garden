class MoodGarden {
    constructor() {
        this.canvas = document.getElementById('gardenCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.plants = [];
        this.particles = [];
        this.fireflies = [];
        this.selectedEmotion = 'joy';
        this.animationId = null;
        this.isNightMode = false;
        this.audioContext = null;
        this.ambientSounds = {
            wind: null,
            birds: null,
            chimes: null
        };
        this.isAudioEnabled = false;
        
        this.emotions = {
            joy: { color: '#FFD700', secondary: '#FFA500', growth: 1.2, sway: 0.8 },
            calm: { color: '#87CEEB', secondary: '#4682B4', growth: 0.8, sway: 0.3 },
            love: { color: '#FF69B4', secondary: '#FF1493', growth: 1.1, sway: 0.6 },
            hope: { color: '#98FB98', secondary: '#32CD32', growth: 1.0, sway: 0.5 },
            wonder: { color: '#DDA0DD', secondary: '#9370DB', growth: 1.3, sway: 1.0 },
            peace: { color: '#F0E68C', secondary: '#DAA520', growth: 0.7, sway: 0.2 }
        };
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.loadGarden();
        this.animate();
        this.createAmbientParticles();
    }
    
    setupCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }
    
    setupEventListeners() {
        // Emotion selection
        document.querySelectorAll('.emotion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.emotion-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedEmotion = btn.dataset.emotion;
            });
        });
        
        // Canvas clicks for planting
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.plantEmotion(x, y);
        });
        
        // Controls
        document.getElementById('clearGarden').addEventListener('click', () => {
            this.clearGarden();
        });
        
        document.getElementById('toggleMusic').addEventListener('click', () => {
            this.toggleAmbientSounds();
        });
        
        // Day/Night toggle
        document.getElementById('toggleTimeOfDay').addEventListener('click', () => {
            this.toggleTimeOfDay();
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.setupCanvas();
        });
    }
    
    plantEmotion(x, y) {
        const emotion = this.emotions[this.selectedEmotion];
        const plant = {
            x: x,
            y: y,
            emotion: this.selectedEmotion,
            age: 0,
            height: 0,
            maxHeight: 60 + Math.random() * 40,
            width: 0,
            maxWidth: 20 + Math.random() * 15,
            swayOffset: Math.random() * Math.PI * 2,
            branches: [],
            flowers: [],
            particles: []
        };
        
        // Create branches
        const numBranches = 3 + Math.floor(Math.random() * 4);
        for (let i = 0; i < numBranches; i++) {
            plant.branches.push({
                angle: (Math.PI / numBranches) * i + Math.random() * 0.5,
                length: 20 + Math.random() * 30,
                offset: 0.3 + Math.random() * 0.4
            });
        }
        
        // Create flowers
        const numFlowers = 2 + Math.floor(Math.random() * 5);
        for (let i = 0; i < numFlowers; i++) {
            plant.flowers.push({
                x: (Math.random() - 0.5) * plant.maxWidth,
                y: -plant.maxHeight * (0.5 + Math.random() * 0.4),
                size: 5 + Math.random() * 8,
                petals: 5 + Math.floor(Math.random() * 3),
                rotation: Math.random() * Math.PI * 2
            });
        }
        
        this.plants.push(plant);
        this.saveGarden();
        
        // Create planting particles
        this.createPlantingParticles(x, y, emotion.color);
        
        // Play gentle chime sound
        this.playChimeSound();
    }
    
    createPlantingParticles(x, y, color) {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4 - 2,
                life: 1,
                decay: 0.02,
                size: 2 + Math.random() * 4,
                color: color,
                type: 'sparkle'
            });
        }
    }
    
    createAmbientParticles() {
        setInterval(() => {
            if (this.particles.length < 50) {
                const particleType = this.isNightMode ? 'stardust' : 'ambient';
                this.particles.push({
                    x: Math.random() * this.canvas.width / window.devicePixelRatio,
                    y: -10,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: 0.5 + Math.random() * 0.5,
                    life: 1,
                    decay: 0.005,
                    size: particleType === 'stardust' ? 1 + Math.random() * 3 : 1 + Math.random() * 2,
                    color: particleType === 'stardust' ? '#e6e6fa' : '#ffffff',
                    type: particleType,
                    twinkle: Math.random() * Math.PI * 2
                });
            }
        }, this.isNightMode ? 1000 : 2000);
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width / window.devicePixelRatio, this.canvas.height / window.devicePixelRatio);
        
        const time = Date.now() * 0.001;
        
        // Update and draw plants
        this.plants.forEach(plant => {
            this.updatePlant(plant, time);
            this.drawPlant(plant, time);
        });
        
        // Update and draw particles
        this.updateParticles();
        this.drawParticles();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    updatePlant(plant, time) {
        const emotion = this.emotions[plant.emotion];
        
        // Grow the plant
        if (plant.age < 100) {
            plant.age += emotion.growth;
            plant.height = Math.min(plant.maxHeight, (plant.age / 100) * plant.maxHeight);
            plant.width = Math.min(plant.maxWidth, (plant.age / 100) * plant.maxWidth);
        }
        
        // Add gentle swaying
        plant.swayOffset += 0.02 * emotion.sway;
    }
    
    drawPlant(plant, time) {
        const emotion = this.emotions[plant.emotion];
        const sway = Math.sin(plant.swayOffset) * 3;
        
        this.ctx.save();
        this.ctx.translate(plant.x + sway, plant.y);
        
        // Draw stem
        this.ctx.strokeStyle = emotion.secondary;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.quadraticCurveTo(sway * 0.5, -plant.height * 0.5, sway, -plant.height);
        this.ctx.stroke();
        
        // Draw branches
        plant.branches.forEach(branch => {
            if (plant.age > 50) {
                const branchY = -plant.height * branch.offset;
                const branchEndX = Math.cos(branch.angle) * branch.length * (plant.age - 50) / 50;
                const branchEndY = branchY + Math.sin(branch.angle) * branch.length * (plant.age - 50) / 50;
                
                this.ctx.strokeStyle = emotion.secondary;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(sway * branch.offset, branchY);
                this.ctx.lineTo(sway * branch.offset + branchEndX, branchEndY);
                this.ctx.stroke();
            }
        });
        
        // Draw flowers
        if (plant.age > 70) {
            plant.flowers.forEach(flower => {
                this.drawFlower(
                    flower.x + sway * 0.5,
                    flower.y,
                    flower.size * (plant.age - 70) / 30,
                    emotion.color,
                    emotion.secondary,
                    flower.petals,
                    flower.rotation + time * 0.5
                );
            });
        }
        
        this.ctx.restore();
    }
    
    drawFlower(x, y, size, color, secondaryColor, petals, rotation) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation);
        
        // Draw petals
        for (let i = 0; i < petals; i++) {
            this.ctx.save();
            this.ctx.rotate((Math.PI * 2 / petals) * i);
            
            const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, secondaryColor);
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.ellipse(0, -size * 0.3, size * 0.4, size * 0.7, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        }
        
        // Draw center
        this.ctx.fillStyle = secondaryColor;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= particle.decay;
            
            if (particle.type === 'ambient') {
                particle.vy += 0.01; // gravity
            }
            
            return particle.life > 0 && particle.y < this.canvas.height / window.devicePixelRatio + 10;
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            
            if (particle.type === 'stardust' && this.isNightMode) {
                // Add twinkling effect for night particles
                const twinkle = Math.sin(Date.now() * 0.005 + particle.twinkle) * 0.3 + 0.7;
                this.ctx.globalAlpha = particle.life * twinkle;
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = particle.color;
            } else {
                this.ctx.globalAlpha = particle.life;
            }
            
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }
    
    toggleTimeOfDay() {
        this.isNightMode = !this.isNightMode;
        const button = document.getElementById('toggleTimeOfDay');
        const body = document.body;
        
        if (this.isNightMode) {
            body.classList.add('night-mode');
            button.textContent = '☀️ Day Mode';
            this.createFireflies();
        } else {
            body.classList.remove('night-mode');
            button.textContent = '🌙 Night Mode';
            this.removeFireflies();
        }
    }
    
    createFireflies() {
        const container = document.querySelector('.garden-container');
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const firefly = document.createElement('div');
                firefly.className = 'firefly';
                firefly.style.left = Math.random() * 80 + 10 + '%';
                firefly.style.top = Math.random() * 60 + 20 + '%';
                firefly.style.animationDelay = Math.random() * 8 + 's';
                firefly.style.animationDuration = (6 + Math.random() * 4) + 's';
                container.appendChild(firefly);
            }, i * 500);
        }
    }
    
    removeFireflies() {
        const fireflies = document.querySelectorAll('.firefly');
        fireflies.forEach(firefly => {
            firefly.style.animation = 'fadeOut 1s ease-out forwards';
            setTimeout(() => firefly.remove(), 1000);
        });
    }
    
    // Enhanced ambient sounds system
    async initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }
    
    createWindSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(60, this.audioContext.currentTime);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.02, this.audioContext.currentTime + 2);
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        
        // Add subtle frequency modulation for wind effect
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        lfo.frequency.setValueAtTime(0.1, this.audioContext.currentTime);
        lfoGain.gain.setValueAtTime(20, this.audioContext.currentTime);
        
        lfo.connect(lfoGain);
        lfoGain.connect(oscillator.frequency);
        lfo.start();
        
        return { oscillator, lfo, gainNode };
    }
    
    playChimeSound() {
        if (!this.audioContext || !this.isAudioEnabled) return;
        
        const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
        const randomFreq = frequencies[Math.floor(Math.random() * frequencies.length)];
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(randomFreq, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 2);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 2);
    }
    
    async toggleAmbientSounds() {
        const button = document.getElementById('toggleMusic');
        
        if (!this.isAudioEnabled) {
            try {
                await this.initAudioContext();
                this.ambientSounds.wind = this.createWindSound();
                this.isAudioEnabled = true;
                button.textContent = '🔇 Ambient Sounds';
            } catch (error) {
                console.log('Audio not available:', error);
            }
        } else {
            if (this.ambientSounds.wind) {
                this.ambientSounds.wind.gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1);
                setTimeout(() => {
                    this.ambientSounds.wind.oscillator.stop();
                    this.ambientSounds.wind.lfo.stop();
                }, 1000);
            }
            this.isAudioEnabled = false;
            button.textContent = '🎵 Ambient Sounds';
        }    }
    
    clearGarden() {
        this.plants = [];
        this.particles = [];
        this.saveGarden();
    }
    
    saveGarden() {
        localStorage.setItem('moodGarden', JSON.stringify(this.plants));
    }
      loadGarden() {
        const saved = localStorage.getItem('moodGarden');
        if (saved) {
            this.plants = JSON.parse(saved);
        }
    }
    
    playChimeSound() {
        if (!this.audioContext || !this.isAudioEnabled) return;
        
        const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
        const randomFreq = frequencies[Math.floor(Math.random() * frequencies.length)];
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(randomFreq, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 2);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 2);
    }
    
    async toggleAmbientSounds() {
        const button = document.getElementById('toggleMusic');
        
        if (!this.isAudioEnabled) {
            try {
                await this.initAudioContext();
                this.ambientSounds.wind = this.createWindSound();
                this.isAudioEnabled = true;
                button.textContent = '🔇 Ambient Sounds';
            } catch (error) {
                console.log('Audio not available:', error);
            }
        } else {
            if (this.ambientSounds.wind) {
                this.ambientSounds.wind.gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1);
                setTimeout(() => {
                    this.ambientSounds.wind.oscillator.stop();
                    this.ambientSounds.wind.lfo.stop();
                }, 1000);
            }
            this.isAudioEnabled = false;
            button.textContent = '🎵 Ambient Sounds';
        }
    }
}

// Initialize the garden when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MoodGarden();
});

// Add some delightful interactions
document.addEventListener('DOMContentLoaded', () => {
    // Add sparkle cursor effect
    document.addEventListener('mousemove', (e) => {
        if (Math.random() < 0.1) {
            const sparkle = document.createElement('div');
            sparkle.style.position = 'fixed';
            sparkle.style.left = e.clientX + 'px';
            sparkle.style.top = e.clientY + 'px';
            sparkle.style.width = '4px';
            sparkle.style.height = '4px';
            sparkle.style.background = '#fff';
            sparkle.style.borderRadius = '50%';
            sparkle.style.pointerEvents = 'none';
            sparkle.style.animation = 'sparkleFloat 1s ease-out forwards';
            sparkle.style.zIndex = '1000';
            
            document.body.appendChild(sparkle);
            
            setTimeout(() => {
                sparkle.remove();
            }, 1000);
        }
    });
    
    // Add CSS for sparkle animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes sparkleFloat {
            0% {
                opacity: 1;
                transform: scale(1) translateY(0) rotate(0deg);
            }
            100% {
                opacity: 0;
                transform: scale(0) translateY(-20px) rotate(180deg);
            }
        }
        
        @keyframes fadeOut {
            0% { opacity: 1; }
            100% { opacity: 0; }
        }
        
        .firefly {
            transition: opacity 1s ease-out;
        }
    `;
    document.head.appendChild(style);
    
    // Add gentle welcome message
    setTimeout(() => {
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255,255,255,0.9);
            color: #333;
            padding: 15px 20px;
            border-radius: 15px;
            font-family: 'Inter', sans-serif;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideInRight 1s ease-out forwards;
            max-width: 300px;
            backdrop-filter: blur(10px);
        `;
        message.innerHTML = `
            <strong>🌸 Welcome to your Mood Garden!</strong><br>
            <small>Try night mode and ambient sounds for extra magic ✨</small>
        `;
        
        const slideInStyle = document.createElement('style');
        slideInStyle.textContent = `
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(100px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
        `;
        document.head.appendChild(slideInStyle);
        
        document.body.appendChild(message);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            message.style.animation = 'slideInRight 1s ease-out reverse forwards';
            setTimeout(() => message.remove(), 1000);
        }, 5000);
    }, 2000);
});
