import SpawnManager from "./_spawnmanager";
import GameManager from "./GameManager";

export default class Vault extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture = 'vault') {
        super(scene, x, y, texture);
        scene.interactGroup.push(this);
        this.setOrigin(.5, .5);
        this.setScale(.2);

        scene.add.existing(this);
        this.spawnMng = SpawnManager.instance;
        this.spawnMng.staticItemGroup.add(this);

        this.isInteractable = true;
        this.depositRamp = 1;

        this.amountText = scene.add.text(this.x - 50, this.y - 100, GameManager.power.vault || "0", {
            fontSize: '24px',
        }).setOrigin(0, 0);

        this.depositEmitter = scene.add.particles(x, y, 'sourceOrb', {
            lifespan: 800,
            scale: { start: .8, end: 0 },
            blendMode: 'ADD',
            frequency: -1,
        });
        this.gravityWell = this.depositEmitter.createGravityWell({
            x: 0,
            y: 0,
            power: 100,
        })



    }
    // World-space helpers (safe even if this ends up in a Container later)
    _worldX() { const m = this.getWorldTransformMatrix(); return m.tx; }
    _worldY() { const m = this.getWorldTransformMatrix(); return m.ty; }

    interact(player) {
        if (GameManager.power.money >= this.depositRamp) {
            GameManager.power.vault += this.depositRamp;
            this.scene.player.updateMoney(-this.depositRamp)
            this.amountText.text = GameManager.power.vault || "0";
            this.depositRamp += 10;
            clearTimeout(this.depositRampTimer);
            this.depositRampTimer = setTimeout(() => {
                this.depositRamp = 1;
            }, 500);
        }

        // const visual = () => {
        //     this.scene.add.particles(player.x, player.y, 'sourceOrb', {
        //         blendMode: 'ADD',
        //         lifespan: 1000,
        //         duration: 500,
        //         scale: { start: 1, end: 0 },
        //         moveToX: this.getWorldTransformMatrix().x,
        //     })
        // }
        // visual();

        this.depositEmitter.explode(25, player.x - this.depositEmitter.x, player.y - this.depositEmitter.y);
    }

    hit() {
        if (GameManager.power.vault > 0) {
            const intMoney = Math.round(GameManager.power.vault / 2)
            GameManager.power.vault -= intMoney;
            this.scene.player.updateMoney(intMoney);
            this.amountText.text = GameManager.power.vault;
        }
    }
}