import GameManager from "../things/GameManager.js";
import NetworkManager from "../things/NetworkManager.js";
import { getRank } from "../things/RankSystem.js";

export default class PlayerUI extends Phaser.Scene {
    constructor() {
        super('PlayerUI');
        this.player = null;
        this.gameScene = null;
    }
    init(data) {
        this.player = data.player;
        this.gameScene = data.gameScene;
        this.player.playerUI = this;

        this.healthBoxUpdate(this.player.health, this.player.healthMax);
        this.player.on('updateHealth', (health, max) => {
            this.healthBoxUpdate(health, max)
        });
        this.player.on('moneyChanged', (v) => {
            const money = GameManager.power.money
            console.log(money);
            this.scoreText.text = 'Source: ' + (money) + '\n' + getRank(money);
        })
    }

    create() {
        this.visible = true;
        this.chatting = false;
        this.playerList = [];
        this.network = NetworkManager.instance;
        this.playerHealthBGMap = {};
        this.playerHealthMap = {};
        this.playerTextMap = {}; // Object to hold playerId => textObject

        this.setWeaponIcon(this.player.leftWeapon.name, 0);
        this.setWeaponIcon(this.player.rightWeapon.name, 1);

        this.leftWeaponBox = this.add.graphics().setDepth(1);
        this.rightWeaponBox = this.add.graphics().setDepth(1);



        this.fpsText = this.add.text(0, 0, '', { font: '24px Courier' });
        this.fpsText.setScrollFactor(0);
        this.time.addEvent({
            delay: 200,
            loop: true,
            callback: () => {
                let hardwareAccellWarning = '';
                if (this.game.loop.actualFps < 30) {
                    hardwareAccellWarning = '   TURN ON HARDWARE ACCELERATION!!';
                    this.fpsText.setColor('#FF0000');
                }
                this.fpsText.setText(`FPS: ${Math.floor(this.game.loop.actualFps)}` + hardwareAccellWarning
                    + '\nLoc: ' + Math.round(this.player.x) + ', ' + Math.round(this.player.y));
            }
        });

        this.scoreText = this.add.text(10, 50, 'Source: ' + GameManager.power.money + '\n' + getRank(GameManager.power.money), {
            fontSize: '32px',
            color: '#4fffff'
        });
        this.scoreText.setScrollFactor(0);


        this.textBoxX = this.scale.width / 2
        this.textBoxY = this.scale.height / 2 + 100;

        this.scale.on('resize', this.resizeUI, this);

        // this.input.keyboard.on('keydown-ENTER', () => {
        //     if (this.chatting) {
        //         const input = this.textBox?.node?.querySelector('#textchat');
        //         if (input) {
        //             this.closeTextChat(input.value);
        //         }
        //         return;
        //     }

        //     if (this.inputFocused) {
        //         // You're typing in a different input (e.g. name field), do nothing
        //         return;
        //     }

        //     // Open chat if none of the above is true
        //     this.openTextChat();
        // });


        // this.input.keyboard.on('keydown-ESC', () => {
        //     if (this.chatting) {
        //         this.closeTextChat('');
        //     }
        // });

        this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => this.updatePlayerList()
        });
        this.network.on('healthChanged', () => {
            this.updatePlayerList();
        })

    }

    update() {
        super.update();
        this.cooldownRed(true);
        this.cooldownRed(false);


    }

    resizeUI(gamesize) {
        const { width, height } = gamesize;
        if (!this.leftWeaponBox || !this.leftWeaponIcon || !this.rightWeaponBox || !this.rightWeaponIcon) return;
        this.leftWeaponBox.y = height;
        this.leftWeaponIcon.y = height;
        this.rightWeaponBox.x = width;
        this.rightWeaponBox.y = height;
        this.rightWeaponIcon.x = width;
        this.rightWeaponIcon.y = height;
        this.textBoxX = width / 2;
        this.textBoxY = height / 2 + 100;
    }

    setWeaponIcon(name = 'shurikan', slot = 0) {
        const icon = name + 'icon'
        if (slot === 0) {
            if (!this.leftWeaponIcon) {
                this.leftWeaponIcon = this.add.image(0, this.scale.height, icon).setOrigin(0, 1).setScale(.5);
            } else {
                this.leftWeaponIcon.setTexture(icon)
            }
        } else {
            if (!this.rightWeaponIcon) {
                this.rightWeaponIcon = this.add.image(this.scale.width, this.scale.height, icon).setOrigin(1, 1).setScale(.5);
            } else {
                this.rightWeaponIcon.setTexture(icon)
            }
        }
    }

    cooldownRed(left) {
        const weaponBox = left ? this.leftWeaponBox : this.rightWeaponBox;
        const weaponIcon = left ? this.leftWeaponIcon : this.rightWeaponIcon;
        const cdProgress = left ? this.player.leftWeapon.cdProgress : this.player.rightWeapon.cdProgress;

        if (!weaponIcon) return;
        if (cdProgress > .95) {
            weaponBox.clear();
            return;
        }
        weaponBox.clear();

        if (cdProgress > 0) {
            const fillHeight = cdProgress * weaponIcon.displayHeight;

            // fillX is based on the weapon icon origin
            const fillX = left
                ? weaponIcon.x
                : weaponIcon.x - weaponIcon.displayWidth;

            const fillY = weaponIcon.y - fillHeight;

            weaponBox.fillStyle(0xff0000, 0.5);
            weaponBox.fillRect(fillX, fillY, weaponIcon.displayWidth, fillHeight);
        }
    }

    openTextChat() {
        if (this.chatting) return;
        this.player.chatting = true;

        this.chatting = true;
        this.events.emit('chatting');

        if (!this.cache.html.exists('textchat')) {
            this.textBox = this.add.dom(this.textBoxX, this.textBoxY).createFromHTML(`
            <input 
            type="text" 
            id="textchat" 
            name="textchat" 
            placeholder="Chat.."
            maxlength="200"
            style="font-size: 20px; width: 300px; padding: 5px;" />
        `);
        } else {
            this.textBox = this.add.dom(this.textBoxX, this.textBoxY).createFromCache('textchat');
        }

        const input = this.textBox.node?.querySelector('#textchat');
        if (!input) {
            console.error('Input element not found!');
            this.chatting = false;
            this.events.emit('doneChatting');
            return;
        }

        input.focus();
        this.inputFocused = true;
    }


    closeTextChat(message) {
        this.player.chatting = false;
        if (this.textBox) {
            this.textBox.destroy();
            this.textBox = null;
            this.inputFocused = false;
        }
        this.chatting = false;

        if (!message) return;
        console.log('Player typed:', message);

        this.player.makeChatBubble(message);


    }

    updatePlayerList() {
        const otherPlayers = this.network.otherPlayers;
        if (!otherPlayers) return;

        const activeIds = new Set();

        Object.entries(otherPlayers).forEach(([id, player], index) => {
            const playerId = String(id); // ensure string consistency
            const yloc = index * 50 + 200;
            activeIds.add(playerId);
            if (this.playerHealthMap[playerId]) {
                const healthObj = this.playerHealthMap[playerId];
                const playerHealth = player.health || 0;
                const playerHealthMax = player.healthMax || 1; // Avoid division by zero
                const percentHealth = playerHealth / playerHealthMax;
                healthObj.width = percentHealth * 200;
            } else {
                const healthBG = this.add.rectangle(0, yloc, 200, 25, 0x000000, .7).setOrigin(0, 0);
                const healthObj = this.add.rectangle(0, yloc, 200, 25, 0x007700).setOrigin(0, 0);
                this.playerHealthMap[playerId] = healthObj;
                this.playerHealthBGMap[playerId] = healthBG;
            }

            if (this.playerTextMap[playerId]) {
                const textObj = this.playerTextMap[playerId];
                textObj.setText(player.nameText + ' - ' + player.money);
                textObj.setY(yloc);
                textObj.setColor(player.nameColor);
            } else {
                const textObj = this.add.text(0, yloc, player.nameText + ' - ' + player.money, {
                    fontSize: '25px',
                    fill: '#FFFFFF',
                    shadow: {
                        offsetX: -1,
                        offsetY: 1,
                        color: '#111111',
                        blur: true,
                        stroke: true,
                    }
                });
                this.playerTextMap[playerId] = textObj;
            }
        });

        // Clean up any removed players' text
        for (const id in this.playerTextMap) {
            if (!activeIds.has(id)) {
                this.playerTextMap[id]?.destroy();
                delete this.playerTextMap[id];
                this.playerHealthMap[id]?.destroy();
                delete this.playerHealthMap[id];
                this.playerHealthBGMap[id]?.destroy();
                delete this.playerHealthBGMap[id];
            }
        }
    }

    healthBoxUpdate(health, max) {
        if (!this.healthBg) {
            this.healthBg = this.add.rectangle(0, 150, 300, 25, 0x000000, .8).setDepth(1).setOrigin(0, 0);
        }
        if (!this.healthBox) {
            this.healthBox = this.add.graphics().setDepth(2).fillStyle('0x00FF00', 1);
            this.healthBox.fillRect(0, 150, 300, 25);
        }
        const percentHealth = health / max;
        this.healthBox.clear();
        this.healthBox.fillStyle(0x00FF00, 1);
        this.healthBox.fillRect(0, 150, 300 * percentHealth, 25);
    }

}

