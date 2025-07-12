import GameManager from "../things/GameManager.js";

export default class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        this.loadingBar();

        this.load.image('redsky0', 'assets/RedSky0.webp');
        this.load.image('redsky1', 'assets/RedSky1.webp');
        this.load.image('redsky2', 'assets/RedSky2.webp');
        this.load.image('bat', 'assets/BatEnemy.png')
        this.load.image('purplesky0', 'assets/PurpleSky0.webp');
        this.load.image('tilesheet', 'assets/tilesheet.png')
        this.load.image('bullet', 'assets/bullet.png');
        this.load.image('duck', 'assets/DuckFloaty.png');
        this.load.image('door0', 'assets/door0.webp');
        this.load.image('damagescreenflash', 'assets/DamageScreenFlash1.webp');
        this.load.image('purplesky1', 'assets/PurpleSky1.webp');
        this.load.image('purplesky2', 'assets/PurpleSky2.webp');
        this.load.image('skybluestreaks', 'assets/SkyBlueStreaks.webp');
        this.load.image('shurikan', 'assets/shurikan.png');
        this.load.image('shurikanicon', 'assets/shurikan.png');
        this.load.image('coin', 'assets/SourceCoin.png');
        this.load.image('platform', 'assets/platform.png');
        this.load.image('platformwide', 'assets/platformwide.png');
        this.load.image('whipicon', 'assets/WhipIcon.png');
        this.load.image('swordicon', 'assets/SwordIcon.png');
        this.load.image('darkorbicon', 'assets/DarkOrbIcon.png');
        this.load.image('platformtall', 'assets/platformtall.png');
        this.load.image('zap', 'assets/Zap.png');
        this.load.image('auraicon', 'assets/AuraIcon.png');
        this.load.image('auraicondesat', 'assets/AuraIconDesat.png');
        this.load.image('bottomplat', 'assets/BottomPlat.png');
        this.load.image('duckman', 'assets/duckman.png');
        this.load.image('turret', 'assets/TurretPlatform.png');
        this.load.image('finishline', 'assets/finishLine.png');
        this.load.image('portal0', 'assets/Portal1.png');
        this.load.image('portal1', 'assets/Portal2.png');
        this.load.image('largeplatform', 'assets/LargePlatform.webp');
        this.load.image('devilTable', 'assets/DevilTable.png');
        this.load.image('potion', 'assets/Potion.png');
        this.load.image('CardSapling', 'assets/CardSapling.png');
        this.load.image('CardCrystal', 'assets/CardCrystal.png');
        this.load.image('CardFireball', 'assets/CardFireball.png');
        this.load.image('CardTorch', 'assets/CardTorch.png');
        this.load.image('CardFalcion', 'assets/CardFalcion.png');
        this.load.image('CardScythe', 'assets/CardScythe.png');

        this.load.audio('music0', 'assets/music0.mp3');
        this.load.audio('music1', 'assets/music1.mp3');
        this.load.audio('music2', 'assets/music2.mp3');
        this.load.audio('energysound', 'assets/EnergySound.wav');
        this.load.audio('playerHit', 'assets/PlayerGotHit.wav');
        this.load.audio('shurikanthrow', 'assets/Whip1.wav');
        this.load.audio('shurikanhit', 'assets/shurikan.wav');
        this.load.audio('pickup', 'assets/SuccessBeep.wav');
        this.load.audio('clinksound', 'assets/Clink1.wav');
        this.load.audio('clinksound2', 'assets/Clink2.wav');
        this.load.audio('shopInteract', 'assets/shopInteract.wav');

        this.load.tilemapTiledJSON('tilemapHome', 'assets/tilemapHome.json');
        this.load.tilemapTiledJSON('tilemap1', 'assets/tilemap1.json')
        this.load.tilemapTiledJSON('tilemap2', 'assets/tilemap2.json')
        this.load.tilemapTiledJSON('tilemap3', 'assets/tilemap3.json')
        this.load.tilemapTiledJSON('tilemap4', 'assets/tilemap4.json')
        this.load.tilemapTiledJSON('tilemap5', 'assets/tilemap5.json')
        this.load.tilemapTiledJSON('tilemap6', 'assets/tilemap6.json')
        this.load.tilemapTiledJSON('tilemap7', 'assets/tilemap7.json')
        this.load.tilemapTiledJSON('tilemapYaya1', 'assets/tilemapYaya1.json')

        
        this.load.spritesheet('devilMan', 'assets/DevilMan.png', {
            frameWidth: 1224,
            frameHeight: 1701,
        });
        this.load.spritesheet('portal3', 'assets/greenPortal.png', {
            frameWidth: 1024,
            frameHeight: 1024,
        });
        this.load.spritesheet('dudesheet', 'assets/DudeSheet.png', {
            frameWidth: 256,
            frameHeight: 256,
        });
        this.load.spritesheet('sword', 'assets/SwordSheet.png', {
            frameWidth: 512,
            frameHeight: 512,
        });
        this.load.spritesheet('booster', 'assets/booster.png', {
            frameWidth: 512,
            frameHeight: 512,
        });
        this.load.spritesheet('boxsheet', 'assets/BoxSheet.png', {
            frameWidth: 64,
            frameHeight: 64,
        });
        this.load.spritesheet('darkorb', 'assets/DarkOrbSheet.png', {
            frameWidth: 128,
            frameHeight: 128,
        });
        this.load.spritesheet('whip', 'assets/Whip.png', {
            frameWidth: 512,
            frameHeight: 512,
        });
        this.load.spritesheet('aura', 'assets/Aura.webp', {
            frameWidth: 256,
            frameHeight: 256,
        });
        this.load.spritesheet('swordwave', 'assets/SwordWave.png', {
            frameWidth: 512,
            frameHeight: 1024,
        });
        this.load.spritesheet('sunsheet', 'assets/SunSheet.png', {
            frameHeight: 256,
            frameWidth: 256
        });
        this.load.spritesheet('sunsheet', 'assets/SunSheet.png', {
            frameWidth: 256,
            frameHeight: 256
        });
        this.load.spritesheet('fireballsheet', 'assets/FireballSheet.png', {
            frameWidth: 66,
            frameHeight: 26
        });
        this.load.spritesheet('portalsheet', 'assets/portalSheet.png', {
            frameWidth: 512,
            frameHeight: 256
        });
    }

    create() {
        GameManager.load();

        window.secretDevMode = function() {
            GameManager.flags.devmode = !GameManager.flags.devmode;
            console.log(GameManager.flags.devmode);
        }

        

        this.scene.start(GameManager.area);
    }

    loadingBar() {
        // Create a progress bar background
        const { width, height } = this.cameras.main;
        const barWidth = 300;
        const barHeight = 30;
        const barX = (width - barWidth) / 2;
        const barY = (height - barHeight) / 2;

        const progressBarBg = this.add.graphics();
        progressBarBg.fillStyle(0x222222, 1);
        progressBarBg.fillRect(barX, barY, barWidth, barHeight);

        const progressBar = this.add.graphics();

        // Optional: Add text
        const loadingText = this.add.text(width / 2, barY - 40, 'Loading...', {
            fontSize: '20px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Listen to loading progress
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(barX, barY, barWidth * value, barHeight);
        });
    }
}