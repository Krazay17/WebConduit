import { changeCollision } from "../myFunctions";
import { playSound } from "./soundUtils";

export default class Shop extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);


        if (!scene.anims.get('devilMan')) {
            scene.anims.create({
                key: 'devilMan',
                defaultTextureKey: 'devilMan',
                repeat: -1,
                frames: [
                    { frame: 0, duration: 5000 },
                    { frame: 1, duration: 450 },
                    { frame: 0, duration: 4000 },
                    { frame: 1, duration: 500 },
                    { frame: 0, duration: 3000 },
                    { frame: 3, duration: 2000 },
                ],
            })
        }
        if (!scene.anims.get('devilGamba')) {
            scene.anims.create({
                key: 'devilGamba',
                defaultTextureKey: 'devilMan',
                duration: 3000,
                frames: [
                    { frame: 4 },
                    { frame: 5 },
                    { frame: 6 },
                    { frame: 7 },
                    { frame: 8 },
                    { frame: 7 },
                    { frame: 6 },
                    { frame: 5 },
                    { frame: 7 },
                    { frame: 8 },
                    { frame: 7 },
                    { frame: 6 },
                    { frame: 7 },
                    { frame: 6 },
                    { frame: 5 },
                    { frame: 7 },
                    { frame: 8 },
                    { frame: 7 },
                    { frame: 7 },
                    { frame: 8 },
                    { frame: 7 },
                    { frame: 6 },
                    { frame: 7 },
                    { frame: 6 },
                    { frame: 5 },
                    { frame: 9 },
                ],
            })
        }

        this.gambleSound = scene.sound.add('shopInteract');

        scene.interactGroup.push(this);
        this.isInteractable = true;
        this.setupShopKeeper();
        this.setupBar();
        this.setupCollisionZone();

        this.gambleCost = 100;
    }

    setupCollisionZone() {
        this.collisionZone = this.scene.add.zone(this.x, this.y, 140, 220);
        this.scene.physics.add.existing(this.collisionZone, true); // true = static body
    }

    setupShopKeeper() {
        this.shopKeep = this.scene.add.sprite(2230, 3200, 'devilMan').setScale(.15).setScrollFactor(.992);

        this.shopKeep.anims.play('devilMan');
    }

    setupBar() {
        this.scene.add.image(2260, 3265, 'devilTable').setScale(.3).setScrollFactor(.995);
        this.scene.add.image(2360, 3220, 'potion').setScale(.19).setScrollFactor(.995)
            .setTint(0x00FF00);
        this.scene.add.image(2500, 3190, 'potion').setScale(.16).setScrollFactor(.995);
        this.scene.add.image(2150, 3230, 'potion').setScale(.22).setScrollFactor(.995);
        this.scene.add.image(2050, 3220, 'potion').setScale(.20).setScrollFactor(.995)
            .setTint(0x00FFFF);
    }

    interact(player) {
        console.log('interact with shop');
        if (player.getMoney() < this.gambleCost) {
            //this.scene.showMessage('You need 100 source.');
            return;
        }
        player.updateMoney(-this.gambleCost);

        this.shopKeep.play('devilGamba');
        const animTime = this.shopKeep.anims.currentAnim ? this.shopKeep.anims.currentAnim.duration : 0;

        this.scene.time.removeEvent(this.spawnCardAfterAnim);
        this.spawnCardAfterAnim = this.scene.time.delayedCall(animTime, () => {
            this.scene.spawnManager.spawnCard(2310, 3120);
        });

        if (this.gambleTime > Date.now()) {
            this.scene.spawnManager.spawnCard(2310, 3120);
        }
        this.gambleTime = Date.now() + animTime;

        this.shopKeep.once('animationcomplete', () => {
            this.shopKeep.play('devilMan');
        });

        this.gambleSound.play();

        this.scene.network.socket.emit('shopInteract', {
        })
    }
}