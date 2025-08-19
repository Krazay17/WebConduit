import { getChatting } from "../domStuff/Chat.js";
import { addSettingsButton } from "../domStuff/KeyBinds.js";
import { mapRangeClamped } from "../myFunctions.js";
import GameManager from "../things/GameManager.js";
import NetworkManager from "../things/NetworkManager.js";
import SoundUtil from "../things/soundUtils.js";

export default class EscMenu extends Phaser.Scene {
    constructor() {
        super('EscMenu');
    }

    init(data) {
        this.gameScene = data.gameScene;
        this.playerUI = data.playerUI;
        this.nameInput = null;
        this.colorInput = null;
    }

    create() {
        this.visible = false;
        this.input.enabled = false;
        this.scene.setVisible(false);
        this.scene.setActive(false);

        this.uiElements = [];

        this.network = NetworkManager.instance;

        // Background
        this.bg = this.add.rectangle(0, 0, 800, 600, 0x000000, 0.8).setOrigin(0, 0);

        this.resetButton = this.add.rectangle(0, 0, 225, 75, 0xFFFFFF, 1)
            .setInteractive()
            .on('pointerdown', () => {
                GameManager.reset();
                this.game.scene.start('Home')
            });
        const resetText = this.add.text(0, 0, 'RESET', {
            font: '32px',
            fill: '#FF0000',
        })

        // Slider track and handle
        const sliderText = this.add.text(400, 390, 'master');
        const track = this.add.rectangle(600, 400, 200, 10, 0xffffff).setOrigin(0.5);
        const handle = this.add.circle(600, 400, 10, 0xff0000).setInteractive();
        this.input.setDraggable(handle);
        handle.name = 'master';
        this.slider = { track, handle };

        // Slider track and handle
        const sliderText1 = this.add.text(400, 440, 'music');
        const track1 = this.add.rectangle(600, 450, 200, 10, 0xffffff).setOrigin(0.5);
        const handle1 = this.add.circle(600, 450, 10, 0xff0000).setInteractive();
        this.input.setDraggable(handle1);
        handle1.name = 'music';
        this.slider1 = { track1, handle1 };

        // Slider track and handle
        const sliderText2 = this.add.text(400, 490, 'voice');
        const track2 = this.add.rectangle(600, 500, 200, 10, 0xffffff).setOrigin(0.5);
        const handle2 = this.add.circle(600, 500, 10, 0xff0000).setInteractive();
        this.input.setDraggable(handle2);
        handle2.name = 'voice';
        this.slider2 = { track2, handle2 };

        // Slider track and handle
        const sliderText3 = this.add.text(400, 540, 'mic');
        const track3 = this.add.rectangle(600, 550, 200, 10, 0xffffff).setOrigin(0.5);
        const handle3 = this.add.circle(600, 550, 10, 0xff0000).setInteractive();
        this.input.setDraggable(handle3);
        handle3.name = 'mic';
        this.slider3 = { track3, handle3 };

        const donate = this.add.text(300, 25,
            'Made by: Josh Massarella\nDonate to help me make more games!', {
            fontSize: '24px',
            color: '#FFFFFF',
        })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                window.open('https://buymeacoffee.com/krazay');
            })
            .on('pointerover', () => {
                donate.setColor('#00FF00');
            })
            .on('pointerout', () => {
                donate.setColor('#FFFFFF')
            })

        const instructions = this.add.text(0, 50,
            'ASD - Move\nW - Heal\nSPACE - Jump\nSHIFT - dash\nL/R Click - Attack\nC -Inventory\nT - Home\n<-/-> - Spectate Others\nUpArrow^ - Spectate Self', {
            fontSize: '28px',
            color: '#4fffff',
        });
        instructions.setScrollFactor(0);

        // Name display
        this.nameDisplay = this.add.text(600, 250, GameManager.name.text || 'Hunter', {
            fontSize: '32px',
            fontStyle: 'bold',
            color: GameManager.name.color || '#FFFFFF',
        }).setOrigin(0.5);

        // Store all UI elements for visibility toggling
        //this.uiElements.push(this.bg, this.nameDisplay, track, handle, track1, handle1, instructions, this.resetButton, resetText);

        // Hide initially
        //this.setUIVisible(false);



        // ESC key
        const toggleSettings = () => {
            this.visible = !this.visible;

            if (this.visible) {
                this.scene.pause(this.gameScene);
                this.input.enabled = true;
                this.scene.setVisible(true);
                this.openNameInput();
                this.openColorInput();
            } else {
                this.scene.resume(this.gameScene);
                this.input.enabled = false;
                this.scene.setVisible(false);
                this.destroyNameInput();
                this.destroyColorInput();
            }
        }

        this.input.keyboard.on('keydown-ESC', () => {
            if(getChatting()) return;
            toggleSettings();
        })
        addSettingsButton(toggleSettings)

        // Slider drag logic
        this.input.on('drag', (pointer, gameObject, dragX) => {
            const minX = track.x - track.width / 2;
            const maxX = track.x + track.width / 2;

            dragX = Phaser.Math.Clamp(dragX, minX, maxX);
            gameObject.x = dragX;

            const percent = (dragX - minX) / (maxX - minX);

            if (gameObject.name === 'music') {
                GameManager.volume.music = percent
                GameManager.save();
                if (!SoundUtil.currentMusic) return;
                SoundUtil.currentMusic.volume = percent;
            } else if (gameObject.name === 'master') {
                this.sound.volume = percent;

                GameManager.volume.master = percent;
                GameManager.save();
            } else if (gameObject.name === 'voice') {
                GameManager.volume.voice = percent;
                this.network.voiceChat.updateVolumes();
                GameManager.save();
            } else if (gameObject.name === 'mic') {
                const value = mapRangeClamped(percent, 0, 1, -3, 3);
                this.network.voiceChat.setMicVolume(percent);
            }
        });

        this.setInitialVolume(GameManager.volume);
    }

    // setUIVisible(visible) {
    //     this.uiElements.forEach(obj => obj.setVisible(visible));
    //     if (this.nameInput) this.nameInput.setVisible(visible);
    //     if (this.colorInput) this.colorInput.setVisible(visible);
    // }

    setInitialVolume(volume) {
        const minX = this.slider.track.x - this.slider.track.width / 2;
        const maxX = this.slider.track.x + this.slider.track.width / 2;
        this.slider.handle.x = Phaser.Math.Linear(minX, maxX, volume.master);
        this.sound.volume = volume.master ?? 1;

        const minX1 = this.slider1.track1.x - this.slider1.track1.width / 2;
        const maxX1 = this.slider1.track1.x + this.slider1.track1.width / 2;
        this.slider1.handle1.x = Phaser.Math.Linear(minX1, maxX1, volume.music);

        const minX2 = this.slider2.track2.x - this.slider2.track2.width / 2;
        const maxX2 = this.slider2.track2.x + this.slider2.track2.width / 2;
        this.slider2.handle2.x = Phaser.Math.Linear(minX2, maxX2, volume.voice);
    }

    openNameInput() {
        this.nameInput = this.add.dom(600, 300).createFromHTML(`
            <input type="text" id="nameInput" name="name" placeholder="Enter name"
                   style="font-size: 20px; width: 200px; padding: 5px;" />
        `).setOrigin(0.5);


        const domElement = this.nameInput.getChildByName('name');
        domElement.value = GameManager.name.text || 'Hunter';

        domElement.addEventListener('focus', () => {
            this.playerUI.inputFocused = true;
        });

        domElement.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.stopImmediatePropagation();
                const name = domElement.value.trim();
                GameManager.name.text = name;
                this.nameDisplay.setText(name);
                GameManager.save();

                this.network.socket.emit('playerName', { text: GameManager.name.text, color: GameManager.name.color });

                domElement.blur();
                this.playerUI.inputFocused = false;
            }
        });
    }

    destroyNameInput() {
        if (this.nameInput) {
            const domElement = this.nameInput.getChildByName('name');
            const name = domElement.value.trim();
            GameManager.name.text = name;
            this.nameDisplay.setText(name);
            GameManager.save();

            this.network.socket.emit('playerName', { text: GameManager.name.text, color: GameManager.name.color });

            this.nameInput.destroy();
            this.nameInput = null;
            this.playerUI.inputFocused = false;
        }
    }

    openColorInput() {
        this.colorInput = this.add.dom(600, 350).createFromHTML(`
            <input type="color" id="nameColor" value="${GameManager.name.color || '#ffffff'}"
                   style="width: 80px; height: 40px; border: none;" />
        `).setOrigin(0.5);

        const colorPicker = this.colorInput.getChildByID('nameColor');
        colorPicker.addEventListener('input', (event) => {
            const color = event.target.value;
            GameManager.name.color = color;
            this.nameDisplay.setColor(color);
            GameManager.save();

            this.network.socket.emit('playerName', { text: GameManager.name.text, color: GameManager.name.color });
        });
    }

    destroyColorInput() {
        if (this.colorInput) {
            this.colorInput.destroy();
            this.colorInput = null;
        }
    }
}
