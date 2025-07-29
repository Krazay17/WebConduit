import GameManager from '../things/GameManager.js';
import WeaponBase from './_weaponbase.js';
import ShurikanProjectile from './shurikanProjectile.js';

export default class WeaponShurikan extends WeaponBase {
    constructor(scene, player) {
        super(scene, player);
        this.name = 'shurikan';
        this.baseCooldown = 50;
        this.spamAdd = 90;
        this.chainCount = 1;
        this.initialTargets = 1

        this.setStats();
    }

    setStats() {
        if (GameManager.upgrades.shurikanUpgradeA) {
            this.chainCount = 5;
        } else {
            this.chainCount = 1;
        }
        if (GameManager.upgrades.shurikanUpgradeB) {
            this.baseDamage = 2;
        } else {
            this.baseDamage = 1;
        }
        if (GameManager.upgrades.shurikanUpgradeC) {
            this.initialTargets = 3;
        } else {
            this.initialTargets = 1;
        }
    }

    fire(pointer) {
        if (!this.canFire()) return;
        this.startCooldown();

        const { start, vector, direction } = this.calculateShot(pointer, 1000);

        const projectile = new ShurikanProjectile(this.scene, start.x, start.y, this.player,
            this,
            this.chainCount, 
            this.baseDamage,
            this.initialTargets, 
        );
        projectile.setVelocity(vector.x, vector.y);

        this.player.network.socket.emit('shurikanthrow', { start, direction })

        this.playThrowSound();
    }
}
