import { playHitSound } from "../things/soundUtils.js";

export default class WeaponProjectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, id = 'shurikan', player, weapon) {
        super(scene, x, y, id);
        this.scene = scene;
        this.player = player;
        this.weapon = weapon;

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.scene.weaponGroup.add(this);

        this.hitSoundId = 'shurikanhit';
        this.baseDamage = 1;
        this.hitTargets = [];
        this.destroyOnHit = true;
        this.damageScale = weapon ? weapon.damageScaling?.() : 1;

    }

    damage() {
        const scale = this.damageScale ?? 1;
        return this.baseDamage * scale;
    }

    bulletHit(bullet) {
        if (!this.canHit(bullet)) return;
        playHitSound(this.scene, this.hitSoundId);
        bullet.destroy();
    }

    platformHit(plat) {
        if (this.destroyOnHit) this.destroy();
    }

    touchWall() { }

    enemyHit(enemy, stunDuration = 300) {
        if (!this.canHit(enemy)) return;

        const velocity = this.body.velocity;

        if (enemy.TakeDamage(velocity.x, velocity.y, this.damage(), stunDuration)) {
            playHitSound(this.scene, this.hitSoundId);
            return;
        }
    }

    itemHit(target) {
        if (!this.canHit(target)) return;

        const velocity = this.body.velocity;
        playHitSound(this.scene, this.hitSoundId);
        target.hit?.(this.player, this.baseDamage, velocity);
    }

    canHit(target) {
        if (this.hitTargets.find(t => t === target)) return false;
        this.hitTargets.push(target);
        return true;
    }

    shrinkCollision(object, x, y) {
        object.body.setSize(x, y); // Smaller than sprite size
        object.body.setOffset(
            (object.width - x) / 2,
            (object.height - y) / 2
        );
    }

    customBounce(scale = 1) {
        const body = this.body;

        if (!body) return;

        // Flip velocity on touch direction
        if (body.blocked.left || body.touching.left) {
            body.setVelocityX(Math.abs(body.velocity.x * scale));
        } else if (body.blocked.right || body.touching.right) {
            body.setVelocityX(-Math.abs(body.velocity.x * scale));
        }

        if (body.blocked.up || body.touching.up) {
            body.setVelocityY(Math.abs(body.velocity.y * scale));
        } else if (body.blocked.down || body.touching.down) {
            body.setVelocityY(-Math.abs(body.velocity.y * scale));
        }
    }

}
