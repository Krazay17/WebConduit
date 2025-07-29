export default class BaseEnemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, id = 'duck', health = 1) {
        super(scene, x, y, id);

        scene.add.existing(this);

        this.player = scene.player;

        this.doesReplicate = false;
        this.maxHealth = health;
        this.health = health;
        this.canDamage = true;
        this.createdHealthBar = false;
        this.alive = true;
        this.hitRecover = undefined;
        this.velocityKnock = false;
        this.knockPower = 500;
        this.damage = 1;
        this.maxaccell = 300;
        this.staggerDR = 1.0;


        // Behavior config
        this.speed = 150;
        this.jumpPower = 550;
        this.stuckJumpCooldown = 1000; // ms cooldown between stuck jumps
        this.edgeLookaheadDistance = 10; // pixels to check for platform edges
        this.direction = 1; // -1 = left, 1 = right
        this.patrolDelay = 2000; // ms delay before turn after overrun
        this.lastTurnTime = 0;
        this.onPlatform = false;
        this.recentlyDamaged = false;
        this.jumpDelay = 4000;
        // Internal state
        this.state = 'idle';  // 'idle', 'walking', 'jumping', 'falling'
        this.hasJumpedFromStuck = false;
        this.lastJumpTime = 0;
        this.prevPos = new Phaser.Math.Vector2(x, y);
        this.targetPos = new Phaser.Math.Vector2(x, y);
        this.lerpDuration = 33;

        this.scene.events.on('update', this.currentSpeed, this)

    }

    init() { }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (this.dead) return;
        this.updateHealthBar();
        this.locoAnims();
        if (!this.stunned) this.staggerDR = Phaser.Math.Clamp(this.staggerDR + delta / 10000, 0, 1);
        if (this.accelToPlayerSpeed) this.scene.physics.accelerateToObject(this, this.player, this.accelToPlayerSpeed, this.maxaccell, this.maxaccell);


    }

    createHealthBar() {
        this.createdHealthBar = true;
        this.healthBarWidth = Phaser.Math.Clamp(this.maxHealth * 8, 16, 128);
        //this.healthBarBg = this.scene.add.rectangle(this.x, this.y - this.displayHeight / 2 - 6, this.healthBarWidth, 6, 0x000000, 0.6);
        this.healthBar = this.scene.add.rectangle(this.x, this.y - this.displayHeight / 2 - 6, this.healthBarWidth, 6, 0xff0000, 1);
        this.healthBar.setOrigin(0.5);
        //this.healthBarBg.setOrigin(0.5);
    }

    updateHealthBar() {
        if (!this.healthBar) return;

        const percent = Phaser.Math.Clamp(this.health / this.maxHealth, 0, 1);
        this.healthBar.setScale(percent, 1);

        // Positioning
        this.healthBar.x = this.x;
        this.healthBar.y = this.y - this.displayHeight / 2 - 6;
        //this.healthBarBg.x = this.x;
        //this.healthBarBg.y = this.y - this.displayHeight / 2 - 6;
    }

    TakeDamage(x, y, damage = 1, stunDuration = 300) {
        if (this.dead || !this.canDamage) return false;
        if (!this.createdHealthBar) this.createHealthBar();

        // this.scene.network.socket.emit('enemyDamageRequest', {
        //     id: this.id,
        //     player: player,
        //     damage,
        //     stagger,
        //     duration,
        // })

        this.applyDamage(x, y, damage, stunDuration);
        console.log(damage);

        return true;

    }

    applyDamage(x, y, damage = 1, stunDuration = 300) {
        this.health -= damage;
        this.updateHealthBar();

        if (this.health <= 0) {
            this.alive = false;
            if (!this.scene) return;
            this.scene?.time?.removeEvent(this.hitRecover);
            this.die(this.player);
        } else {

            if ((stunDuration > 0) && (this.staggerDR > .33)) {
                this.staggerDR /= 1.5;
                this.stunned = true;
                if (!this.prevVelocity) {
                    this.prevVelocity = this.body.velocity.clone();
                }
                this.setVelocity(x / 3, y / 3)
                this.setTint(0xff0000);
                this.scene?.time?.removeEvent(this.hitRecover);
                this.hitRecover = this.scene?.time?.addEvent({
                    delay: stunDuration * this.staggerDR,
                    callback: () => {
                        if (!this.dead) {
                            this.stunned = false;
                            this.setVelocity(this.prevVelocity.x, this.prevVelocity.y);
                            delete this.prevVelocity
                            this.setTint();
                        }
                    }
                });
            } else {
                this.setTint(0xff0000);
                this.scene?.time.delayedCall(100, () => {
                    this.setTint();
                })
            }

            this.recentlyDamaged = true;
            if (this.recentlyDamagedTimer) this.scene?.time.removeEvent(this.recentlyDamagedTimer)
            this.recentlyDamagedTimer = this.scene.time.delayedCall(5000, () => {
                this.recentlyDamaged = false;
            })

        }

        return true;

    }

    die(player) {
        this.dead = true;
        player.updateMoney(this.maxHealth);
        this.emit('die', player);

        this.deactivate();

    }

    replicateEnemy() {
        if (!this.doesReplicate) return;

        if (this.replicateTimer < this.scene.time.now) {
            this.replicateTimer = this.scene.time.now + 100;
        }

        if (this.scene && !this.isRemote && this.scene.network) {
            this.scene.network.socket.emit('enemyStateRequest', {
                id: this.id,
                type: this.name,
                x: this.x,
                y: this.y,
                vx: this.body.velocity.x,
                vy: this.body.velocity.y,
                sceneKey: this.scene.scene.key,
            });
        }
    }

    lerpPosition(delta) {
        if (this.dead) return;

        this.lerpTimer += delta;

        const t = Phaser.Math.Clamp(this.lerpTimer / this.lerpDuration, 0, 1);
        const lerpedX = Phaser.Math.Linear(this.prevPos.x, this.targetPos.x, t);
        const lerpedY = Phaser.Math.Linear(this.prevPos.y, this.targetPos.y, t);

        this.x = lerpedX;
        this.y = lerpedY;
    }

    setLerpPosition(x, y) {
        if (x === 0 || y === 0) return;
        this.lerpTimer = 0;
        this.prevPos.set(this.x, this.y);
        this.targetPos.set(x, y);
    }

    deactivate() {
        const now = Date.now();
        if (this.healthBar) {
            this.healthBar.destroy();
            this.healthbar = null;
        }
        if (this.healthBarBg) {
            this.healthBarBg.destroy();
            this.healthBarBg = null;
        }
        this.createdHealthBar = false;
        this.setActive(false);
        this.setVisible(false);
        this.body.stop();
        this.body.enable = false;
        this.dead = true;

        this.lastActiveAt = now;
    }

    activate(x, y, health = 1) {
        const now = Date.now();
        // const cooldown = 1000; // 1 second cooldown

        // if (this.lastActiveAt && (now - this.lastActiveAt) < cooldown) {
        //     return false;
        // }
        this.setActive(true);
        this.setVisible(true);
        this.setPosition(x, y);
        this.setTint();
        this.body.enable = true;

        this.dead = false;
        this.stunned = false;
        this.isPooled = false;
        this.health = health;
        this.maxHealth = health;

        this.lastActiveAt = now;

        return true;
    }

    playerCollide(player) {
        const direction = new Phaser.Math.Vector2(player.x - this.x, player.y - this.y);
        const knockback = direction.normalize().scale(this.knockPower);

        player.TakeDamage(knockback.x, knockback.y, this.damage);
    }

    scaleCollision(x, y) {
        this.body.setSize(x, y); // Smaller than sprite size
        this.body.setOffset(
            (this.width - x) / 2,
            (this.height - y) / 2
        );
    }

    currentSpeed(time, delta) {
        if (!this.prevPos) {
            this.prevPos = new Phaser.Math.Vector2(this.x, this.y);
            this.realSpeed = 0;
            return;
        }

        const currentPos = new Phaser.Math.Vector2(this.x, this.y);
        const deltaPos = currentPos.clone().subtract(this.prevPos);
        const dist = deltaPos.length();

        // Only update realSpeed if it actually moved
        if (dist > 0.01) {
            this.realSpeed = dist / (delta / 1000); // pixels per second
            this.prevPos.copy(currentPos);
            this.movementDirection = deltaPos;
        }
    }

    patrol(time) {
        if (this.stunned) return;
        const onGround = this.body.blocked.down || this.body.touching.down;
        if (!onGround) return;

        // Check tile ahead and below to avoid ledge
        const aheadX = this.x + this.direction * 44;
        const tile = this.scene.walls?.getTileAtWorldXY(aheadX, this.y + 64);
        const wallTile = this.scene.walls?.getTileAtWorldXY(aheadX, this.y + 32);

        if (!tile || tile.index === -1 || wallTile || this.body.blocked.left || this.body.blocked.right || this.body.touching.left || this.body.touching.right) {
            if ((time > this.lastJumpTime + this.jumpDelay) && this.seesPlayer && (this.body.blocked.down || this.body.touching.down)) {

                this.setVelocityY(-500)
                this.lastJumpTime = time;
            }
            else if (time > this.lastTurnTime + this.patrolDelay) {
                this.direction *= -1;
                this.lastTurnTime = time;
            }
        }

        this.setVelocityX(this.direction * this.speed);
        this.flipX = this.direction > 0;
    }

    chasePlayer(time) {
        if (this.stunned) return;
        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 450 && Math.abs(dy) < 80 || this.recentlyDamaged) {
            // Player is close and roughly same height
            this.seesPlayer = true;
            this.speed = 200;
            if (this.direction !== Math.sign(dx) && !this.justTurned) {
                this.justTurned = true;
                this.direction = Math.sign(dx);
                this.scene.time.delayedCall(Phaser.Math.Between(500, 1500), () => this.justTurned = false);
            }

        } else {
            this.speed = 60;
            this.seesPlayer = false;
        }
    }

    locoAnims() {
        if (!this.movementDirection) return;
        if (this.movementDirection.x > 0) {
            this.flipX = true;
        } else {
            this.flipX = false;
        }
    }

    mapRangeClamped(value, inMin, inMax, outMin, outMax) {
        if (inMin === inMax) return outMin; // Avoid divide by zero

        // Normalize input range to 0–1
        let t = (value - inMin) / (inMax - inMin);

        // Clamp the normalized value
        t = Math.max(0, Math.min(1, t));

        // Remap to output range
        return outMin + (outMax - outMin) * t;
    }

    getCurrentPos() {
        return new Phaser.Math.Vector2(this.x, this.y);
    }

    accelToPlayer(min, max) {
        if (!this.accelToPlayerTimer) {
            this.accelToPlayerTimer = this.scene.time.addEvent({
                delay: 1000,
                loop: true,
                callcback: () => this.accelToPlayer()
            })
        }
        const direction = new Phaser.Math.Vector2(this.player.x - this.x, this.player.y - this.y).normalize();
        this.accelToPlayerSpeed = Phaser.Math.Between(min, max);
    }

    distanceToPlayer() {
        const player = this.scene.player ? this.scene.player : null;
        if (!player) return;

        const dx = player.x - this.x;
        const dy = player.y - this.y;

        return Math.sqrt(dx * dx + dy * dy); // Euclidean distance
    }
}