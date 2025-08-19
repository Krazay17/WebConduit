import GameManager from "../things/GameManager";
import { weaponUpgrades } from '../weapons/WeaponManager'

export default class Inventory extends Phaser.Scene {
    constructor() {
        super('Inventory');
        this.player = null;
    }
    init(data) {
        this.player = data.player;
        this.player.inventory = this
        this.aura = this.player.aura;
    }

    create() {
        this.input.enabled = false;
        this.scene.setVisible(false);
        this.scene.setActive(false);
        this.upgradeButtons = [];

        this.bg = this.add.rectangle(1200, 300, 800, 1200, 0x000000, 0.5);
        this.shurikanButton = this.setupWeaponButton(900, 100, 'shurikan', 'shurikan', .4);
        this.swordButton = this.setupWeaponButton(1100, 100, 'sword', 'swordicon', .5);
        this.darkorbButton = this.setupWeaponButton(1300, 100, 'darkorb', 'darkorb', 1, 0);
        this.whipButton = this.setupWeaponButton(1500, 100, 'whip', 'whipicon', .5);

        // this.auraButton = this.setupButton(1200, 500, 'auraicon', 1)
        //     .on('pointerdown', () => {
        //         if (this.player.aura.tryIncreaseAura()) {
        //             this.auraText.setText('Aura level: ' + GameManager.power.auraLevel);
        //             this.auraCostText.setText('Cost: ' + this.player.aura.getCost());
        //         }
        //     });
        this.auraText = this.add.text(1200, 425, 'Aura level: ' + GameManager.power.auraLevel, {
            fontSize: '24px',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        this.auraCostText = this.add.text(1200, 450, 'Cost: ' + this.player.aura.getCost(), {
            fontSize: '24px',
            fontStyle: 'bold',
        }).setOrigin(0.5);

        // Label text
        this.damageScalingLabel = this.add.text(1200, 25, 'Source Damage multiplier: ', {
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#ffffff', // white label
        }).setOrigin(1, 0.5); // anchor right side so it hugs the number

        // Number text (different color)
        this.damageScalingValue = this.add.text(1200, 25, this.player.leftWeapon.damageScaling().toFixed(2), {
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#ff4444', // red number
        }).setOrigin(0, 0.5); // anchor left side so it sits right after the label

        this.player.on('moneyChanged', () => {
            this.damageScalingValue.text = this.player.leftWeapon.damageScaling().toFixed(2);
        })


        this.auraText2 = this.add.text(1200, 600, '<-Choose->', {
            fontSize: '12px',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        this.auraText3 = this.add.text(1200, 700, '<-Choose->', {
            fontSize: '12px',
            fontStyle: 'bold',
        }).setOrigin(0.5);



        this.resetPowerButton = this.setupButton(1200, 800, { icon: 'auraicondesat', tint: '0xFF0000', cost: 'Half of Source spent refunded', tooltip: '\nReset all power' })
            .on('pointerdown', () => {
                this.resetAllUpgrades();
            });


        this.tooltipText = this.add.text(0, 0, '', {
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#00FF00',
            backgroundColor: '#000000',
            wordWrap: {
                width: 150,
            },
        }).setOrigin(.5, 1).setAlpha(0).setDepth(12);

        this.setupTalents();
    }

    setupWeaponButton(x = 1200, y = 200, weapon = 'darkorb', icon = 'darkorb', scale = 1) {
        const button = this.add.image(x, y, icon)
            .setScale(scale)
            .setInteractive()
            .on('pointerover', () => button.setTint(0x7d7d7d))
            .on('pointerout', () => button.setTint())
            .on('pointerdown', (pointer) => {
                const slot = pointer.button === 0
                    ? 0
                    : 1;
                this.player.equipWeapon(weapon, slot)
                this.sound.play('clinksound2');
            });

        return button;
    }

    setupButton(x = 1200, y = 200, upgrade) {
        const { icon, tint, cost, tooltip } = upgrade;

        const tooltipFunc = () => {
            const currentCost = typeof cost === 'function' ? cost() : cost;
            return `Cost: ${currentCost}\n${tooltip}`;
        };

        const button = this.add.image(x, y, icon)
            .setInteractive()
            .setTint(tint);

        // Store base and previous tint safely
        button.baseTint = tint;
        button.prevTint = tint;

        button.on('pointerover', (pointer) => {
            button.setTint(0x7d7d7d);  // grey-ish hover tint

            this.tooltipText.setText(tooltipFunc());
            this.tooltipText.setPosition(pointer.x, pointer.y);
            this.tooltipText.setAlpha(1);
        });

        button.on('pointerout', () => {
            button.setTint(button.prevTint);

            this.tooltipText.setText('');
            this.tooltipText.setAlpha(0);
        });

        return button;
    }


    // selectUpgrade(upgradeKey, cost, button) {
    //     if (!GameManager.upgrades[upgradeKey] && (GameManager.power.money > cost)) {
    //         this.player.updateMoney(-cost);
    //         GameManager.upgrades[upgradeKey] = true;
    //         GameManager.power.spent += cost;
    //         this.player.leftWeapon.setStats();
    //         this.player.rightWeapon.setStats();
    //         //button.disableInteractive();
    //         button.setTint(0xFFFFFF);
    //         this.tooltipText.setText('');
    //         this.tooltipText.setAlpha(0);
    //     }
    // }

    setupTalents() {
        weaponUpgrades.forEach((upgrade) => {
            const { id, x, y, icon, tint, cost, maxRank, tooltip } = upgrade;
            // const realCost = typeof cost === 'function' ? cost() : cost;
            // const costTooltip = `Cost: ${realCost}\n${tooltip}`;
            const currentRank = GameManager.upgrades[id];
            const maxed = currentRank === maxRank;

            const button = this.setupButton(x, y, upgrade)
                .on('pointerdown', () => {
                    this.purchaseUpgrade(upgrade, button)
                })
            this.upgradeButtons.push({ id, button, config: upgrade });

            if (maxed) this.disableButton(id, true)
        })
        weaponUpgrades.forEach((upgrade) => {
            const { id, maxRank, disables } = upgrade;
            const currentRank = GameManager.upgrades[id];
            const maxed = currentRank === maxRank;
            if (maxed && disables) {
                disables.forEach(disable => this.disableButton(disable));
            }
        })
    }

    purchaseUpgrade(upgrade, button) {
        const { id, cost, maxRank, tooltip, apply, disables } = upgrade;
        const realCost = typeof cost === 'function' ? cost() : cost;
        let currentRank = GameManager.upgrades[id];
        let maxed = currentRank === maxRank;

        if (!maxed && GameManager.power.money >= realCost) {
            this.player.updateMoney(-realCost);
            GameManager.power.spent += realCost;
            apply(this);

            currentRank = GameManager.upgrades[id];
            maxed = currentRank === maxRank;

            if (maxed) this.disableButton(id, true);
            if (disables) {
                disables.forEach(disable => this.disableButton(disable));
            }

            this.player.leftWeapon.setStats();
            this.player.rightWeapon.setStats();
            this.player.aura.setStats();

            if (id === 'auraUpgradeLevel') {
                const realCostAfter = typeof cost === 'function' ? cost() : cost;
                this.tooltipText.setText(`Cost: ${realCostAfter}\n${tooltip}`);
                this.auraText.setText('Aura level: ' + GameManager.power.auraLevel);
                this.auraCostText.setText('Cost: ' + this.player.aura.getCost());
            }

            this.sound.play('pickup');
        } else {
            this.sound.play('clinksound');
        }
    }

    disableButton(id, active = false) {
        const entry = this.upgradeButtons.find(b => b.id === id);
        const tint = active ? 0xFFFFFF : 0x333333;
        if (entry) {
            //entry.button.disableInteractive();
            entry.button.setTint(tint);
            entry.button.prevTint = tint;
            if (this.tooltipText) {
                this.tooltipText.setText('');
                this.tooltipText.setAlpha(0);
            }
        }
    }

    resetAllUpgrades() {
        GameManager.upgrades = {};
        GameManager.power.auraLevel = 1;
        this.player.leftWeapon.setStats();
        this.player.rightWeapon.setStats();
        this.player.aura.setStats();

        this.auraText.setText('Aura level: ' + GameManager.power.auraLevel);
        this.auraCostText.setText('Cost: ' + this.player.aura.getCost());

        //Refund spent money
        this.player.updateMoney(GameManager.power.spent / 2)
        GameManager.power.spent = 0;

        GameManager.save();

        this.upgradeButtons.forEach(({ button, config }) => {
            button.setInteractive();
            button.setTint(config.tint);
            button.prevTint = config.tint;
        });
    }
}