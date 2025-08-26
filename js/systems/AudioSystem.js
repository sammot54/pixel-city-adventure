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

// End of AudioSystem