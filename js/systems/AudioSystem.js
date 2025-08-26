// Audio system for managing music and sound effects
class AudioSystem {
    constructor() {
        this.masterVolume = CONSTANTS.AUDIO.MASTER_VOLUME;
        this.musicVolume = CONSTANTS.AUDIO.MUSIC_VOLUME;
        this.sfxVolume = CONSTANTS.AUDIO.SFX_VOLUME;
        
        this.currentMusic = null;
        this.musicQueue = [];
        this.soundEffects = new Map();
        this.audioContext = null;
        
        // Initialize Web Audio API if available
        this.initializeAudioContext();
    }
    
    initializeAudioContext() {
        if ('AudioContext' in window || 'webkitAudioContext' in window) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                Utils.log('Audio context initialized');
            } catch (error) {
                Utils.log('Failed to initialize audio context: ' + error.message, 'warn');
            }
        }
    }
    
    // Volume controls
    setMasterVolume(volume) {
        this.masterVolume = Utils.clamp(volume, 0, 1);
        this.updateAllVolumes();
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Utils.clamp(volume, 0, 1);
        this.updateMusicVolume();
    }
    
    setSFXVolume(volume) {
        this.sfxVolume = Utils.clamp(volume, 0, 1);
    }
    
    updateAllVolumes() {
        this.updateMusicVolume();
        // SFX volume is applied when sounds are played
    }
    
    updateMusicVolume() {
        const musicElement = document.getElementById('backgroundMusic');
        if (musicElement) {
            musicElement.volume = this.masterVolume * this.musicVolume;
        }
    }
    
    // Music playback
    playMusic(trackName, loop = true) {
        const musicElement = document.getElementById('backgroundMusic');
        if (!musicElement) {
            Utils.log('Background music element not found', 'warn');
            return;
        }
        
        // Stop current music
        this.stopMusic();
        
        // Set new music
        musicElement.src = `assets/audio/music/${trackName}`;
        musicElement.loop = loop;
        musicElement.volume = this.masterVolume * this.musicVolume;
        
        // Play with user interaction check
        const playPromise = musicElement.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                this.currentMusic = trackName;
                Utils.log(`Playing music: ${trackName}`);
            }).catch(error => {
                Utils.log(`Failed to play music: ${error.message}`, 'warn');
                // Try to play on next user interaction
                this.musicQueue.push(trackName);
            });
        }
    }
    
    stopMusic() {
        const musicElement = document.getElementById('backgroundMusic');
        if (musicElement) {
            musicElement.pause();
            musicElement.currentTime = 0;
        }
        this.currentMusic = null;
    }
    
    pauseMusic() {
        const musicElement = document.getElementById('backgroundMusic');
        if (musicElement && !musicElement.paused) {
            musicElement.pause();
        }
    }
    
    resumeMusic() {
        const musicElement = document.getElementById('backgroundMusic');
        if (musicElement && musicElement.paused) {
            const playPromise = musicElement.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    Utils.log(`Failed to resume music: ${error.message}`, 'warn');
                });
            }
        }
    }
    
    // Sound effects
    playSFX(soundName) {
        // For now, create simple synthesized sound effects
        this.playGeneratedSound(soundName);
    }
    
    playGeneratedSound(soundType) {
        if (!this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            const volume = this.masterVolume * this.sfxVolume * 0.1; // Keep volume low
            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            
            switch (soundType) {
                case 'click':
                    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                    break;
                    
                case 'levelup':
                    oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime); // C5
                    oscillator.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.1); // E5
                    oscillator.frequency.setValueAtTime(784, this.audioContext.currentTime + 0.2); // G5
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
                    break;
                    
                case 'xp':
                    oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(880, this.audioContext.currentTime + 0.2);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                    break;
                    
                case 'error':
                    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
                    break;
                    
                case 'success':
                    oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime);
                    oscillator.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.1);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                    break;
                    
                default:
                    oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            }
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 1);
            
        } catch (error) {
            Utils.log(`Failed to play sound: ${error.message}`, 'warn');
        }
    }
    
    // Try to play queued music on user interaction
    handleUserInteraction() {
        if (this.musicQueue.length > 0) {
            const trackName = this.musicQueue.shift();
            this.playMusic(trackName);
        }
    }
    
    update(deltaTime) {
        // Handle any audio-related updates
        // Could be used for fading, audio processing, etc.
    }
}

// Create placeholder implementations for other systems to prevent errors
class UISystem {
    constructor() {
        this.notifications = [];
        this.hudVisible = false;
    }
    
    showNotification(message, type = 'info', duration = 3000) {
        const notification = {
            message,
            type,
            timestamp: Date.now(),
            duration
        };
        this.notifications.push(notification);
        Utils.log(`Notification: ${message}`);
    }
    
    showXPGain(amount) {
        this.showNotification(`+${amount} XP!`, 'xp');
        if (audioSystem) audioSystem.playSFX('xp');
    }
    
    showLevelUpNotification() {
        this.showNotification('Level Up!', 'levelup');
        if (audioSystem) audioSystem.playSFX('levelup');
    }
    
    updateHUD() {
        if (!game.player) return;
        
        // Update HP bar
        const hpBar = document.getElementById('hpBar');
        const hpText = document.getElementById('hpText');
        if (hpBar && hpText) {
            const hpPercent = (game.player.currentHP / game.player.maxHP) * 100;
            hpBar.style.width = hpPercent + '%';
            hpText.textContent = `${Math.ceil(game.player.currentHP)}/${game.player.maxHP}`;
        }
        
        // Update XP bar
        const xpBar = document.getElementById('xpBar');
        const levelText = document.getElementById('levelText');
        if (xpBar && levelText) {
            const xpPercent = (game.player.experience / game.player.experienceToNext) * 100;
            xpBar.style.width = xpPercent + '%';
            levelText.textContent = `Level ${game.player.level}`;
        }
        
        // Update mission info
        const missionInfo = document.getElementById('currentMission');
        if (missionInfo) {
            if (game.player.currentMission) {
                missionInfo.textContent = game.player.currentMission.title;
            } else {
                missionInfo.textContent = 'No active mission';
            }
        }
    }
    
    showHUD() {
        const hud = document.getElementById('hud');
        if (hud) {
            hud.classList.remove('hidden');
            this.hudVisible = true;
            this.updateHUD();
        }
    }
    
    hideHUD() {
        const hud = document.getElementById('hud');
        if (hud) {
            hud.classList.add('hidden');
            this.hudVisible = false;
        }
    }
    
    update(deltaTime) {
        // Remove expired notifications
        const now = Date.now();
        this.notifications = this.notifications.filter(
            notification => now - notification.timestamp < notification.duration
        );
    }
    
    render(renderSystem) {
        // Render notifications
        let yOffset = 100;
        for (const notification of this.notifications) {
            const alpha = Math.min(1, (notification.duration - (Date.now() - notification.timestamp)) / 1000);
            renderSystem.drawText(notification.message, renderSystem.canvas.width / 2, yOffset, {
                textAlign: 'center',
                fillStyle: `rgba(255, 255, 255, ${alpha})`,
                font: '18px monospace'
            });
            yOffset += 30;
        }
    }
}

class SaveSystem {
    constructor() {
        this.saveSlots = 3;
    }
    
    getSaveSlots() {
        const slots = [];
        for (let i = 0; i < this.saveSlots; i++) {
            const saveData = Utils.loadFromLocalStorage(CONSTANTS.STORAGE.SAVE_GAME + '_' + i);
            slots.push({
                slot: i,
                exists: !!saveData,
                data: saveData,
                timestamp: saveData ? saveData.timestamp : null
            });
        }
        return slots;
    }
    
    hasSaveData(slot = 0) {
        return !!Utils.loadFromLocalStorage(CONSTANTS.STORAGE.SAVE_GAME + '_' + slot);
    }
}