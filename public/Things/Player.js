import GameManager from "./GameManager.js";
import NetworkManager from "./NetworkManager.js";
import RankSystem from "./RankSystem.js";
import {createWeapon} from "../Weapons/WeaponManager.js"

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'dudesheet', {});

        GameManager.load();
        this.network = NetworkManager.instance;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setMaxSpeed(1400);

        this.setupAnimation();

        this.damageSound = this.scene.sound.add('playerHit');

        this.setScale(0.3);
        this.setSize(105, 240);
        this.setOffset(55, 5);
        this.alive = true;
        this.health = 5;
        this.deathPenalty;

        this.isCrouch = false;
        this.baseJumpPower = 150;
        this.jumpPower = this.baseJumpPower;
        this.jumpMax = 400;
        this.canJump = true;
        this.canDash = true;
        this.wallJump = false;
        this.wallJumpX = 0;
        this.stunned = false;
        this.iFrame = false;
        this.hitCD = false;

        this.leftWeapon = createWeapon('shurikan', scene, this);
        this.rightWeapon = createWeapon('sword', scene, this);
        this.weapons = [this.leftWeapon, this.rightWeapon];

        this.tryLeftAttack = false;
        this.canLeftAttack = true;
        this.canRightAttack = true;
        this.leftSpam = 0;
        this.rightSpam = 0;
        this.speed = 250;

        this.scene.scene.launch('EscMenu', { gameScene: this.scene });
        this.scene.scene.launch('Inventory', { player: this });

        this.rankSystem = new RankSystem();

        this.controls = scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            dash: Phaser.Input.Keyboard.KeyCodes.SHIFT
        });
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.myPointer = new Phaser.Input.Pointer(this.scene.input.manager, 1)

        this.scoreText = this.scene.add.text(10, 150, 'Source: ' + GameManager.source + '\n' + this.rankSystem.getRank(GameManager.source), {
            fontSize: '32px',
            color: '#4fffff'
        });
        this.scoreText.setScrollFactor(0);

        this.scene.input.on('pointerdown', (pointer) => {
            if (pointer.middleButtonDown())
                this.Teleport(pointer);
        });

        this.scene.input.keyboard.on('keydown-F', () => {
            if (GameManager.devMode) {
                console.log('devmodeon')
                this.UpdateSource(5);
            }
        });

        this.scene.input.keyboard.on('keydown-T', () => {
            if (this.scene.scene.key !== 'Home' && this.body.touching.down) {
                this.scene.scene.start('Home')
            }
        });

        this.resetJump(true);

        this.scene.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                this.syncNetwork();
            }
        })

    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (this.alive && !this.stunned) {
            if (this.canLeftAttack) {
                this.leftSpam -= delta * .65;
                this.leftSpam = Math.max(0, this.leftSpam);
            }

            const pointer = this.scene.input.activePointer;
            if (pointer.leftButtonDown()) {
                this.LeftAttack(pointer);
            }
            if (pointer.rightButtonDown()) {
                this.RightAttack(pointer);
            }

            if (this.y > this.scene.physics.world.bounds.height + this.body.height / 2 && this.alive) {
                this.Died();
            }
        }
    }

    Died() {
        if (this.alive == false) return;
        this.alive = false;

        this.deathPenalty = Math.floor(-GameManager.source / 3);
        this.UpdateSource(this.deathPenalty);

        this.leftSpam = 0;
        this.rightSpam = 0;

        this.setTint(0xff0000); // Flash red
        this.anims?.stop?.(); // Stop any animations

        const gameOverText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            'YOU DIED!\n' + this.deathPenalty + ' Source', {
            fontSize: '64px',
            color: '#ff0000'
        });

        gameOverText.setOrigin(0.5);
        gameOverText.setScrollFactor(0);

        this.scene.physics?.pause(); // Stop physics
        this.scene.time.addEvent({
            delay: 2000,
            callback: () => this.scene.scene.restart()
        });
        this.emit('playerdied');

        GameManager.save();
    }

    Teleport(pointer) {
        if (GameManager.devMode || GameManager.debug.canTeleport) {
            const worldPos = pointer.positionToCamera(this.scene.cameras.main);
            this.setPosition(worldPos.x, worldPos.y);
            this.setVelocity(0);
        }
    }

    LeftAttack(pointer) {

        this.leftWeapon.fire(pointer);

        // if (this.canLeftAttack) {
        //     this.canLeftAttack = false;
        //     const offset = 20;
        //     const worldPos = pointer.positionToCamera(this.scene.cameras.main);
        //     const direction = new Phaser.Math.Vector2(worldPos.x - this.x, worldPos.y - this.y).normalize();

        //     // Do attack
        //     this.weapons.SpawnShurikan(this.x, this.y - offset, direction);

        //     // Network
        //     this.network.socket.emit('shurikanthrow', { x: this.x, y: this.y - offset, d: { x: direction.x, y: direction.y } });

        //     // Cooldown
        //     this.scene.time.addEvent({
        //         delay: 200 + this.leftSpam,
        //         callback: () => {
        //             this.canLeftAttack = true;
        //         }
        //     });

        //     this.leftSpam += 45;
        // }
    }

    RightAttack(pointer) {
        // if (this.canRightAttack) {
        //     this.canRightAttack = false;
        //     const offset = 20;
        //     const worldPos = pointer.positionToCamera(this.scene.cameras.main);
        //     const direction = new Phaser.Math.Vector2(worldPos.x - this.x, worldPos.y - this.y).normalize();

        //     // Do attack
        //     this.weapons.SpawnShurikan(this.x, this.y - offset, direction);

        //     // Network
        //     this.network.socket.emit('shurikanthrow', { x: this.x, y: this.y - offset, d: { x: direction.x, y: direction.y } });
            
        //     // Cooldown
        //     this.scene.time.addEvent({
        //         delay: 200 + this.rightSpam,
        //         callback: () => {
        //             this.canRightAttack = true;
        //         }
        //     });

        //     this.rightSpam += 45;
        // }
    }

    TouchPlatform(player, platform) {
        if (this.body.touching.down) {
            this.resetJump(true);
        }

        if (this.body.touching.left) {
            this.resetJump();
            this.wallJump = true;
            this.wallJumpX = 400;
        }
        if (this.body.touching.right) {
            this.resetJump();
            this.wallJump = true;
            this.wallJumpX = -400;
        }
    }

    getWeaponGroup() {
        return this.weapons;
    }

    handleInput(delta) {
        if (this.stunned || !this.alive) return;

        const { left, right, down, up, dash } = this.controls;
        const cursors = this.cursors;

        const isDown = down.isDown || cursors.down.isDown;
        const isLeft = left.isDown || cursors.left.isDown;
        const isRight = right.isDown || cursors.right.isDown;
        const isUp = up.isDown || cursors.up.isDown || cursors.space.isDown;

        const WalkLerp = (a, modify) => {
            if (!modify) modify = this.body.touching.down ? .5 : .04;
            return Phaser.Math.Linear(this.body.velocity.x, a, modify);
        };

        if (isLeft && !isDown) {
            this.setVelocityX(WalkLerp(-this.speed));
            this.flipX = true;
            if (this.body.touching.down) {
                this.anims.play('dudewalk', true);
            } else {
                this.setFrame(5);
            }
            if (dash.isDown && this.canDash) {
                this.Dash(-600);
            }
        } else if (isRight && !isDown) {
            this.setVelocityX(WalkLerp(this.speed));
            this.flipX = false;
            if (this.body.touching.down) {
                this.anims.play('dudewalk', true);
            } else {
                this.setFrame(5);
            }
            if (dash.isDown && this.canDash) {
                this.Dash(600);
            }
        } else if (isDown) {
            this.setVelocityX(WalkLerp(0, 0.01));
        } else {
            this.setVelocityX(WalkLerp(0));
            this.stop();
            if (this.body.touching.down) this.setFrame(0);
            else this.setFrame(2);
        }



        if (isUp && this.canJump) {
            this.setVelocityY(-this.jumpPower);
            this.jumpPower += delta * 1.8;
            this.stop();
            this.setFrame(1);
            if (this.jumpPower >= this.jumpMax) this.canJump = false;
        } else {
            this.canJump = false;
            this.wallJump = false;
        }

        if (this.wallJump) {
            this.setVelocityX(this.wallJumpX);
            this.jumpMax = 320;
            this.wallJump = false;
        }

        if (isDown && !this.isCrouch) {
            this.isCrouch = true;
            this.stop();
            this.setTexture('dudecrouch');
            this.setSize(105, 140);
            this.setOffset(55, 105);
        } else if (!isDown && this.isCrouch) {
            this.isCrouch = false;
            this.setTexture('dudesheet');
            this.setSize(105, 240);
            this.setOffset(55, 5);
        }
    }

    resetJump(floor) {
        this.jumpPower = this.baseJumpPower;
        this.canJump = true;
        if (floor) {
            this.canDash = true;
            this.jumpMax = 400;
            this.setTint(0x66ff33);
        }
    }

    TakeDamage(x, y, damage) {
        if (this.iFrame) return false;
        if (this.hitCD) return false;

        this.hitCD = true;
        this.scene.time.addEvent({
            delay: 400,
            callback: () => {
                this.hitCD = false;
            }
        });

        if (this.damageSound) {
            if (this.damageSound.isPlaying)
                this.damageSound.stop();
            this.damageSound.play();
        } else {
            // Sound not ready yet, just skip playing or log
            console.log('Damage sound not ready yet.');
        }

        this.stunned = true;
        this.scene.time.removeEvent(this.stunTimer);
        this.stunTimer = this.scene.time.addEvent({
            delay: 400,
            callback: () => {
                this.stunned = false;
            }
        });

        this.setVelocityX(x);
        this.setVelocityY(y);

        this.health -= damage;
        this.UpdateSource(-1);

        return true;
    }

    Dash(x) {
        this.iFrame = true;

        this.setVelocityX(x);
        this.setVelocityY(-50);
        this.canDash = false;
        this.clearTint();

        this.scene.time.addEvent({
            delay: 350,
            callback: () => {
                this.iFrame = false;
            }
        });
    }

    CarryPlayer(player, floor) {
        player.setVelocityX(floor.body.velocity.x);
    }

    PickupItem(source = 0) {
        if (source > 0) {
            this.UpdateSource(source);
        }
    }

    UpdateSource(source) {
        const intSource = Math.floor(source);
        const prevSource = GameManager.source;
        GameManager.source += intSource;
        GameManager.source = Math.max(0, GameManager.source);
        GameManager.save();
        this.scoreText.text = 'Source: ' + GameManager.source + '\n' + this.rankSystem.getRank(GameManager.source);
        this.network.socket.emit('playerLevel', GameManager.source);
    }

    setupAnimation() {
        this.scene.anims.create({
            key: 'dudewalk',
            frames: this.anims.generateFrameNumbers('dudesheet', { start: 2, end: 4 }),
            frameRate: 10,
            repeat: -1,
        });
    }

    syncNetwork() {
        this.network.socket.emit('playerLevel', GameManager.source);
    }
}