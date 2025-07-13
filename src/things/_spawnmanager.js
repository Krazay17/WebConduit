import Enemy from "./_baseEnemy.js";
import Bullet from "./bullet.js"
import Duck from "./enemyDuck.js"
import Bat from "./enemyBat.js"
import SunMan from "./enemySunman.js";
import Coin from "./coin.js";
import Booster from "./booster.js";
import DashBuff from "./dashBuff.js";
import { getProperty } from "../myFunctions.js";
import Portal from "./portal.js";
import FinishLine from "./finishLine.js";
import LaserSprite from "../weapons/laserSprite.js";
import CardPickup from "./cardPickup.js";

export default class SpawnManager {
    static instance;
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.sceneKey = scene.scene.key;
        this.enemyCounter = 0;
    }

    setupGroups(scene) {
        this.batGroup = this.scene.physics.add.group({
            classType: Bat,
            allowGravity: false,
            bounce: .9,
        });
        this.sunmanGroup = this.scene.physics.add.group({
            classType: SunMan,
            runChildUpdate: true,
            allowGravity: false,
        });
        this.duckGroup = this.scene.physics.add.group({
            classType: Duck,
        });
        this.bulletGroup = this.scene.physics.add.group({ allowGravity: false });
        this.softBulletGroup = this.scene.physics.add.group({ allowGravity: false });
        this.itemGroup = this.scene.physics.add.group();
        this.staticItemGroup = this.scene.physics.add.group({ allowGravity: false, immovable: true });

        scene.physics.add.collider(this.sunmanGroup, this.sunmanGroup);
    }

    getGroups() {
        return [
            { group: this.batGroup, handler: 'enemyHit', zap: true, walls: true },
            { group: this.sunmanGroup, handler: 'enemyHit', zap: true, walls: false },
            { group: this.duckGroup, handler: 'enemyHit', zap: true, walls: true },
            { group: this.bulletGroup, handler: 'bulletHit', zap: false, walls: false },
            { group: this.softBulletGroup, handler: 'bulletHit', zap: false, walls: false },
            { group: this.itemGroup, handler: 'itemHit', zap: false, walls: true },
            { group: this.staticItemGroup, handler: 'itemHit', zap: false, walls: false }
        ];
    }

    spawnBat(x, y, obj, health, isRemote = false, id = null) {
        let bat = this.batGroup.getFirst(false);

        if (bat && bat.activate(x, y, health)) {
            bat.init();
            return bat;
        }
        // Create new if no usable bat
        bat = new Bat(this.scene, x, y, health);
        this.batGroup.add(bat);
        bat.init();
        return bat;
    }


    spawnSunMan(x, y, obj, health = 3, isRemote = false, id = null) {
        let sunMan = this.sunmanGroup.getFirstDead(false);

        if (sunMan && sunMan.activate(x, y, health)) {
            sunMan.init();
            return sunMan;
        }

        // Create new if no usable bat
        sunMan = new SunMan(this.scene, x, y, health);
        this.sunmanGroup.add(sunMan);
        sunMan.init();
        return sunMan;
    }


    spawnDuck(x, y, obj, health = 20, isRemote = false, id = null) {
        let duck = this.duckGroup.get(x, y);
        if (duck) {
            if (!duck.activate(x, y, health)) {
                duck = this.duckGroup.create();
                duck.activate(x, y, health);
            }
        }
        this.respawn(duck, x, y, health, this.spawnDuck.bind(this))

        // if (duck && duck.isPooled) {
        //     duck.activate(x, y, health);
        // } else {
        //     //duck = new Duck(this.scene, x, y, health);
        //     duck = this.duckGroup.create(x, y, health);
        //     //this.duckGroup.add(duck);
        // }
        return duck;
    }

    spawnCoin(x, y, obj) {
        const coin = new Coin(this.scene, x, y);
        const props = getProperty(obj);

        this.itemGroup.add(coin);
        coin.setMaxVelocity(800, 800);
        coin.setBounce(.99);
        coin.setScale(.2);
        this.scene.tweens.add({
            targets: coin,
            angle: 360,
            duration: Phaser.Math.Between(400, 1000),
            repeat: -1
        });
        if (props?.float) {
            coin.body.allowGravity = false;
        }

        coin.once('pickup', () => {
            this.scene.time.delayedCall(45000, () => {
                this.spawnCoin(x, y, obj);
            })
        })

        return coin;
    }

    spawnSourceBlock(x, y, data) {
        const block = this.scene.walkableGroup.create(x, y, 'boxsheet')
        this.scene.add.existing(block);
        this.scene.physics.add.existing(block);

        if (!this.scene.anims.get('box'))
            this.scene.anims.create({
                key: 'box',
                frames: this.scene.anims.generateFrameNumbers('boxsheet', { start: 0, end: 3 }),
                frameRate: 6,
                repeat: -1,
                yoyo: true,
            })
        block.play('box')
    }

    spawnTurret(x, y) {
        const turret = new Enemy(this.scene, x, y, 'turret', 10);
        this.sunmanGroup.add(turret)
        turret.body.allowGravity = false;
        turret.setVelocityY(50);
        turret.setBounce(1);
        turret.setCollideWorldBounds(true);

        const originalDie = turret.die.bind(turret);
        turret.die = (player) => {
            originalDie(player);

            this.scene.time.addEvent({
                delay: 5000,
                callback: () => this.spawnTurret(x, y)
            });
        };
        return turret;
    }

    spawnBullets(x, y, amount) {
        for (var i = 0; i < amount; i++) {
            const bullet = new Bullet(this.scene, x, y + (i * 100), 'bullet');
            this.softBulletGroup.add(bullet);
            bullet.setVelocityX(Phaser.Math.Between(-300, -200));
        };
    }

    spawnBullet(x, y) {
        const bullet = new Bullet(this.scene, x, y, 'bullet');
        this.softBulletGroup.add(bullet);
        bullet.setVelocityX(-300);
    }

    spawnFireballs(x, y) {
        const bullet = new Bullet(this.scene, x, y, 'fireballsheet');
        this.softBulletGroup.add(bullet);
        bullet.setVelocityX(-450);
        if (!this.scene.anims.get('fireball'))
            this.scene.anims.create({
                key: 'fireball',
                frames: this.scene.anims.generateFrameNumbers('fireballsheet', { start: 0, end: 2 }),
                frameRate: 8,
                repeat: -1,
            });
        bullet.play('fireball');

        return bullet;
    }

    spawnBooster(x, y, obj) {
        const booster = new Booster(this.scene, x, y, obj);
        this.staticItemGroup.add(booster);
    }

    spawnDashBuff(x, y, obj) {
        const dashBuff = new DashBuff(this.scene, x, y);
        this.staticItemGroup.add(dashBuff);

        dashBuff.once('pickup', () => {
            this.scene.time.delayedCall(45000, () => {
                this.spawnDashBuff(x, y, obj);
            })
        })
    }

    spawnPortal(x, y, obj) {
        const newX = x;
        const newY = y;
        const portal = new Portal(this.scene, newX, newY, obj)
        this.staticItemGroup.add(portal);

    }

    spawnFinishLine(x, y, obj) {
        const finish = new FinishLine(this.scene, x, y, obj);
        this.staticItemGroup.add(finish);
    }

    respawn(obj, x, y, health, spawnFunc) {
        obj.once('die', () => {
            const checkDistanceTimer = this.scene.time.addEvent({
                delay: 5000, // check every 1 second (adjust if you want)
                callback: () => {
                    const dx = this.scene.player.x - x;
                    const dy = this.scene.player.y - y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance > 1200) {
                        this.scene.time.removeEvent(checkDistanceTimer);
                        spawnFunc(x, y, health);
                    }
                },
                loop: true
            });
            this.scene.events.once('shutdown', () => {
                this.scene.time.removeEvent(checkDistanceTimer);
            })

        });
    }

    spawnLaser(x, y, obj) {
        const laser = new LaserSprite(this.scene, x, y, this.player, obj)
    }

    spawnText(x, y, obj) {
        const text = this.scene.add.text(x, y, obj.text.text, {
            fontStyle: 'bold',
            fontSize: '20px',
            color: '#FFFFFF',
        }).setScrollFactor(1);
    }

    spawnCard(x, y, obj) {
        // const props = getProperty(obj);
        // let card = this.batGroup.getFirst(false);

        // if (card && card.activate(x, y,  props?.icon || null, props?.value || null)) {
        //     card.init();
        //     return card;
        // }
        // // Create new if no usable bat
        // card = new CardPickup(this.scene, x, y,  props?.icon || null, props?.value || null);
        // this.cardGroup.add(card);
        // card.init();
        // return card;

        const props = getProperty(obj);
        const card = new CardPickup(this.scene, x, y, props?.icon || null, props?.value || null);
        this.itemGroup.add(card);
        if (props?.float) {
            card.body.allowGravity = false;
        }
    }
}