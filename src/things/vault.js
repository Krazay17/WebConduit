import SpawnManager from "./_spawnmanager";
import GameManager from "./GameManager";

export default class Vault extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture = 'vault') {
        super(scene, x, y, texture);
        scene.interactGroup.push(this);
        this.setScale(.2);
        scene.add.existing(this);
        this.spawnMng = SpawnManager.instance;
        
        this.spawnMng.itemGroup.add(this);
        this.isInteractable = true;
        this.depositRamp = 1;
        this.vaultPos = new Phaser.Math.Vector2(this.x, this.y);

        this.amountText = scene.add.text(this.x - 50, this.y -100, GameManager.power.vault || "0", {
            fontSize: '24px',
        }).setOrigin(0, 0);
    }

    interact(player) {
        if (GameManager.power.money >= this.depositRamp) {
            GameManager.power.vault += this.depositRamp;
            this.scene.player.updateMoney(-this.depositRamp)
            this.amountText.text = GameManager.power.vault || "0";
            this.depositRamp += 10;
            clearTimeout(this.depositRampTimer);
            this.depositRampTimer = setTimeout(()=> {
                this.depositRamp = 1;
            }, 500);
        }

        // const visual = () => {
        //     this.scene.add.particles(player.x, player.y, 'sourceOrb', {
        //         blendMode: 'ADD',
        //         lifespan: 1000,
        //         scale: {start: 1, end: 0},
        //         moveToX: this.vaultPos.x,
        //         moveToY: this.vaultPos.y,
        //     })
        // }
        // visual();
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