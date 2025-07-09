import GameManager from "./GameManager.js";

const lastPlayTimes = {};
const MIN_INTERVAL = 33; // ms per sound ID
let sfxPool = {};

export default class SoundUtil {
    static currentMusic = null;
    static currentKey = '';
    static storedTime = 0;


    static setup(scene, key, volume = 1) {
        if (!key) {
            if (this.currentMusic) {
                this.storedTime = this.currentMusic.seek;
                this.currentMusic.stop();
                this.currentMusic.destroy();
            }
            return;
        }
        // Check if same music is already playing
        const existingMusic = scene.game.sound.get(key);

        if (existingMusic && existingMusic.isPlaying) {
            this.currentMusic = existingMusic;
            this.currentKey = key;
            return;
        }

        // If switching tracks, save position + clean up
        if (this.currentMusic) {
            this.storedTime = this.currentMusic.seek;
            this.currentMusic.stop();
            this.currentMusic.destroy();
        }

        this.currentKey = key;
        this.currentMusic = scene.game.sound.add(key, { loop: true });
        this.currentMusic.volume = volume;

        // Resume from stored position if any
        if (this.storedTime > 0) {
            this.currentMusic.setSeek(this.storedTime);
        }

        this.currentMusic.play();
    }

    static savePosition() {
        if (this.currentMusic && this.currentMusic.isPlaying) {
            this.storedTime = this.currentMusic.seek;
        }
    }

}



export function playHitSound(scene, soundKey, options = {}) {
    if (document.visibilityState !== 'visible') return;

    const now = scene.time.now;
    const lastTime = lastPlayTimes[soundKey] || 0;

    if (now - lastTime > (options.cooldown || MIN_INTERVAL)) {
        lastPlayTimes[soundKey] = now;

        if (!sfxPool[soundKey]) {
            sfxPool[soundKey] = [];
            for (let i = 0; i < (options.poolSize || 6); i++) {
                sfxPool[soundKey].push(scene.sound.add(soundKey));
            }
        }

        const pool = sfxPool[soundKey];
        const sound = pool.find(s => !s.isPlaying) || pool[0]; // grab idle sound or first one

        sound.play({
            volume: options.volume ?? 1,
            detune: options.detune ?? Phaser.Math.Between(-55, 55),
            rate: options.rate ?? 1
        });
    }
}

export function playSound(scene, soundKey, options = {}) {
    if (document.visibilityState !== 'visible') return;

    const now = scene.time.now;
    const lastTime = lastPlayTimes[soundKey] || 0;

    if (now - lastTime > (options.cooldown || MIN_INTERVAL)) {
        lastPlayTimes[soundKey] = now;

        if (!sfxPool[soundKey]) {
            sfxPool[soundKey] = [];
            for (let i = 0; i < (options.poolSize || 6); i++) {
                sfxPool[soundKey].push(scene.sound.add(soundKey));
            }
        }

        const pool = sfxPool[soundKey];
        const sound = pool.find(s => !s.isPlaying) || pool[0]; // grab idle sound or first one

        sound.play({
            volume: options.volume ?? 1,
            detune: options.detune ?? Phaser.Math.Between(-55, 55),
            rate: options.rate ?? 1
        });
    }
}
