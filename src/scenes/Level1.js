import BaseGame from "./_basegame.js";

/// <reference path="../types/phaser.d.ts" />

// Tower climb level

export default class Level1 extends BaseGame {
    constructor() {
        super('Level1');
    }

    create() {
        this.setupSky({ sky2: false, sky3: false });
        this.sky2 = this.add.image(1000, 900, 'purplesky1').setScale(1.1).setScrollFactor(.15);
        this.sky3 = this.add.image(1200, 600, 'skybluestreaks').setScale(.8).setScrollFactor(.3);
        this.setupWorld(0, 0, 6400, 12800);
        this.setupPlayer(3200, 6200);
        this.setupGroups();
        this.setupTileMap('tilemap1');
        this.setupCollisions();
        this.setupMusic('music2');
        this.enemyTimers();
        this.setupNet();


    }

    makeClimbingPlatforms() {
        const length = 45;
        for (let i = 4; i < length; i++) {
            const yloc = i * 125;
            const xloc1 = Phaser.Math.Between(-1000, -250);
            const xloc2 = Phaser.Math.Between(-250, 250);
            const xloc3 = Phaser.Math.Between(250, 1000);
            const platform1 = this.walkableGroup.create(xloc1, yloc + Phaser.Math.Between(-20, 20), 'platform');
            const platform2 = this.walkableGroup.create(xloc2, yloc + Phaser.Math.Between(-20, 20), 'platform');
            const platform3 = this.walkableGroup.create(xloc3, yloc + Phaser.Math.Between(-20, 20), 'platform');

        }
    }

    lerp(start, end, t) {
        return start + (end - start) * t;
    }

    checkPlayerY() {
        if (!this.player) return;
        const y = this.player.y;
        const yd = Math.max(0, y / 12000);

        this.batTimer.delay = this.lerp(25, 3000, yd);
        this.sunManHealth = this.lerp(100, 3, yd);
        this.sunTimer.delay = this.lerp(250, 6000, yd);

        if (y > 11500) {
            this.doSpawnSunMan = false;
            return;
        } else {
            this.doSpawnSunMan = true;
        }
    }

    enemyTimers() {

        if (this.batTimer) { this.batTimer.remove(); this.batTimer = null; }
        if (this.sunTimer) { this.sunTimer.remove(); this.sunTimer = null; }

        this.batTimer = this.time.addEvent({
            delay: 2000,
            callback: () => {
                const { x, y } = this.getSpawnPos();
                const bat = this.spawnManager.spawnBat(x, y);

                this.checkPlayerY();
            },
            loop: true
        });

        this.sunTimer = this.time.addEvent({
            delay: 6000,
            callback: () => {
                if (!this.doSpawnSunMan) return;
                const { x, y } = this.getSpawnPos();
                const sunMan = this.spawnManager.spawnSunMan(x, y, null, this.sunManHealth);

                this.checkPlayerY();
            },
            loop: true
        });

        this.events.on('shutdown', () => {
            if (this.batTimer) { this.batTimer.remove(); this.batTimer = null; }
            if (this.sunTimer) { this.sunTimer.remove(); this.sunTimer = null; }
        });

    }

    getSpawnPos() {
        const left = this.bounds.left;
        const right = this.bounds.right;

        const spawnLeft = Phaser.Math.Between(0, 1) === 0;

        const x = spawnLeft
            ? left + Phaser.Math.Between(500, 1000)
            : right - Phaser.Math.Between(500, 1000);

        const y = this.player.y + Phaser.Math.Between(-650, -850)

        return { x, y, spawnLeft };
    }
}