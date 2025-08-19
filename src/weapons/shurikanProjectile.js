import { playHitSound } from "../things/soundUtils.js";
import WeaponProjectile from "./_baseWeaponProjectile.js";

export default class ShurikanProjectile extends WeaponProjectile {
    constructor(scene, x, y, player, weapon, chainCount = 0, initialDamage = 1, maxTargets = 1, visualOnly = false) {
        super(scene, x, y, 'shurikan', player, weapon);

        this.baseDamage = initialDamage;
        this.maxTargets = maxTargets;
        this.chainCount = chainCount;
        this.destroyOnHit = false;
        this.visualOnly = visualOnly;
        this.shrinkCollision(this, this.width/1.6, this.height/1.6)

        
        this.setBounce(.8);
        this.allowGravity = false;
        this.setScale(.15);

        // Spin tween
        this.scene.tweens.add({
            targets: this,
            angle: 360,
            duration: 300,
            repeat: -1,
            ease: 'Linear',
        });

        // Cleanup
        scene.time.delayedCall(700, () => this.destroy());

    }

    enemyHit(enemy, stunDuration = 300) {
        if(this.visualOnly) return;
        if (!this.canHit(enemy)) return;

        const velocity = this.body.velocity.clone().scale(.1);

        if (enemy.TakeDamage(velocity.x, velocity.y, this.damage(), stunDuration)) {
            playHitSound(this.scene, this.hitSoundId);
        }

        if ((this.chainCount > 0)) {
            this.chainAttack(enemy);
            this.setVelocity(0)
            this.scene.time?.delayedCall(25, () =>{
            this.destroy();

            })
        } else {
            this.setVelocity(0)
            this.scene.time?.delayedCall(25, () =>{
            this.destroy();

            })
        }
    }

    bulletHit(target) {
        if(this.visualOnly) return;
        super.bulletHit(target);

        if (this.chainCount > 0) {
            this.chainAttack(target);
            this.destroy();
        } else {
            this.destroy();
        }
    }

    itemHit(item) {
        if(this.visualOnly) return;
        super.itemHit(item);
    }

    touchWall() {
        this.customBounce();
    }

    platformHit() {
    }

    chainAttack(enemy) {
        const groups = this.scene.attackableGroups;
        const range = 400;
        const thisPos = new Phaser.Math.Vector2(this.x, this.y)
        const validTargets = [];

        groups.forEach(({ zap, group, handler }) => {
            if (!zap) return;

            group.getChildren().forEach(target => {
                const targetPos = new Phaser.Math.Vector2(target.x, target.y);
                const distance = Phaser.Math.Distance.BetweenPoints(thisPos, targetPos);

                if ((target !== enemy && distance <= range) && !target.dead) {
                    validTargets.push({
                        target,
                        distance,
                        handler,
                        pos: targetPos
                    });
                }
            });
        });

        // Sort by distance, ascending
        validTargets.sort((a, b) => a.distance - b.distance);

        // Hit up to this.maxTargets
        for (let i = 0; i < Math.min(validTargets.length, this.maxTargets); i++) {
            const { target, handler, pos } = validTargets[i];
            this.chainCount--;
            const chainShurikan = new ShurikanProjectile(this.scene, thisPos.x, thisPos.y, this.player, this.weapon, this.chainCount, 1, 1, this.damageScale)
            chainShurikan.hitTargets.push(enemy);
            this.scene.weaponGroup.add(chainShurikan);
            const direction = pos.subtract(thisPos).normalize().scale(1000);
            chainShurikan.allowGravity = false;
            chainShurikan.setVelocity(direction.x, direction.y)
            chainShurikan.setScale(.11)

        }
    }

}
