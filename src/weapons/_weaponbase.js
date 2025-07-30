import GameManager from "../things/GameManager.js";
import { playHitSound, playSound } from "../things/soundUtils.js";

export default class WeaponBase {
    constructor(scene, player, baseDamage = 1) {
        this.scene = scene;
        this.player = player;
        this.scene.events.once('shutdown', this.destroy, this);
        this.scene.events.once('destroy', this.destroy, this);

        this.hitTargets = [];
        this.cooldown = false;
        this.cooldownDelay = 0;
        this.meleeRayTick = false;
        this.rayTickData;
        this.offset;
        this.throwSoundId = 'shurikanthrow';
        this.hitSoundId = 'shurikanhit';
        this.baseDamage = baseDamage;
        this.baseCooldown = 200;
        this.spamAdd = 50;
        this.knockStrength = 800;
        this.meleeDuration = this.cooldownDelay;
        this.hitLocation;
        this.tickHit = false;
        this.cooldownTimer = 0;
        this.headOffset = 10;

    }

    damage() {
        return this.baseDamage * this.damageScaling();
    }

    damageScaling() {
        const money = GameManager.power.money;
        if (!money) return 1;

        if (money < 1000) {
            return 1 + money / 1000;
        } else if (money < 2000) {
            return 2 + money / 2000;
        } else if (money < 4000) {
            return 3 + money / 4000;
        } else if (money < 8000) {
            return 4 + money / 8000;
        } else if (money < 16000) {
            return 5 + money / 16000;
        } else {
            return 6 + money / 500000
        }
    }

    update(delta) {
        if (!this.cooldown)
            this.cooldownDelay = Math.max(this.baseCooldown, this.cooldownDelay -= delta * .65);
        else {
            const elapsed = this.scene.time.now - this.cooldownStartTime;
            this.cdProgress = Phaser.Math.Clamp(elapsed / this.cd, 0, 1);
        }

        if (this.meleeRayTick) {
            this.rayTickData.start.x = this.player.x;
            this.rayTickData.start.y = this.player.y - 10;
            this.fireRayAttack(this.rayTickData);
        }
    }

    setStats() { }

    canFire() {
        return !this.cooldown;
    }

    startCooldown() {
        this.cooldown = true;
        this.cd = Math.max(this.baseCooldown, this.baseCooldown + this.cooldownDelay);

        this.cooldownStartTime = this.scene.time.now;

        this.cooldownTimer = this.scene.time.delayedCall(this.cd, () => {
            this.cooldown = false;
        });

        this.cooldownDelay += this.spamAdd;
    }

    destroy() {
        this.scene.events.off('update', this.update, this);
        // any other cleanup here
    }

    onBlur() { }

    calculateShot(pointer, scale = 1, rayThickness = 26) {
        const x = this.player.x;
        const y = this.player.y - this.headOffset;
        const pxy = new Phaser.Math.Vector2(x, y);
        const cursorPos = pointer.positionToCamera(this.scene.cameras.main);
        const tempDirection = new Phaser.Math.Vector2(cursorPos.x - x, cursorPos.y - y).normalize();
        const scaledDistance = tempDirection.clone().scale(scale);

        return {
            start: pxy.clone(),
            end: pxy.clone().add(scaledDistance),
            cursorPos: cursorPos.clone(),
            direction: tempDirection.clone(),
            distance: scale,
            vector: scaledDistance.clone(),
            rayThickness: rayThickness,
        };
    }

    fire(pointer) { }

    release(pointer) { }

    fireRayAttack(data) {
        const groups = this.scene.attackableGroups;
        const end = data.start.clone().add(data.vector);
        const hits = [];
        const ray = new Phaser.Geom.Line(data.start.x, data.start.y, data.end.x, data.end.y);
        const RectRay = this.polygonRay(data, data.rayThickness);

        this.scene.graphics = this.scene.add.graphics();
        // this.scene.graphics.clear();
        // this.scene.graphics.lineStyle(2, 0xff0000);

        // this.scene.graphics.lineStyle(1, 0x00ff00);
        // this.scene.graphics.strokeLineShape(ray);

        groups.forEach(({ group, handler }) => {
            group.getChildren().forEach(target => {
                console.log(group.name);
                if (group.name === 'pvpGroup') return;
                // find end of weapon to target box
                const bounds = target.getBounds();
                const closestPoint = getClosestPointOnRect(bounds, data.start);
                const toTarget = closestPoint.clone().subtract(data.start);
                const distanceToTarget = toTarget.length();

                if(target.dead) return;

                // skip far targets
                if (distanceToTarget > data.distance + 200) return;

                // skip out of cone targets
                // const dot = data.direction.clone().dot(toTarget.normalize());
                // console.log(dot);
                // if (dot < 0.5) return;

                // line trace
                if (Phaser.Geom.Intersects.RectangleToRectangle(bounds, RectRay)) {
                    const hitRec = Phaser.Geom.Rectangle.Intersection(bounds, RectRay);
                    const hit = { x: hitRec.centerX, y: hitRec.centerY };
                    hits.push(target);
                    this[handler]?.(target, true, hit);
                    // this.scene.graphics.fillStyle(0x00ff00, 0.5);
                    // this.scene.graphics.fillRectShape(target.getBounds());
                }
            });
        });
    }

    polygonRay(data, thickness) {
        const end = this.rayTrackEnd
            ? data.end
            : data.start.clone().add(data.vector);

        // Create perpendicular vector to the direction
        const perp = new Phaser.Math.Vector2(-data.direction.y, data.direction.x).scale(thickness / 2);

        // Build a rectangle as a polygon from the start point
        const p1 = data.start.clone().add(perp);
        const p2 = end.clone().add(perp);
        const p3 = end.clone().subtract(perp);
        const p4 = data.start.clone().subtract(perp);

        const rayPoly = new Phaser.Geom.Polygon([p1, p2, p3, p4]);
        const rayRect = Phaser.Geom.Polygon.GetAABB(rayPoly);
        Phaser.Geom.Rectangle.Inflate(rayRect, 1, 1)

        // Debug draw
        // const graphics = this.scene.add.graphics();
        // graphics.lineStyle(1, 0xffff00);
        // graphics.strokePoints(rayPoly.points, true);

        return rayRect;
    }

    platformHit(plat) {
    }

    enemyHit(target, stunDuration = 300) {
        if (!this.canHit(target)) return;

        if (target.TakeDamage(this.getKnockBack(target).x, this.getKnockBack(target).y, this.damage(), stunDuration)) {
            playHitSound(this.scene, this.hitSoundId);
        }
    }

    itemHit(target) {
        if (!this.canHit(target)) return;

        target.hit?.(this.player, this.baseDamage, this.getKnockBack(target));
    }

    bulletHit(target) {
        if (!this.canHit(target)) return;

        target.hit?.(this, target);
        playHitSound(this.scene, this.hitSoundId);
        target.destroy(this.scene, this.hitSoundId);
    }

    canHit(target) {
        if (this.hitTargets.find(t => t === target)) return false;

        this.hitTargets.push(target);
        return true;
    }

    clearHits() {
        this.hitTargets = [];
    }

    getKnockBack(target, direction) {
        if (direction) {
            return direction.clone().scale(this.knockStrength);
        } else {
            const dir = new Phaser.Math.Vector2(target.x - this.player.x, target.y - this.player.y)
            return dir.normalize().scale(this.knockStrength);
        }
    }

    playThrowSound() {
        playSound(this.scene, this.throwSoundId);
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

}

function getClosestPointOnRect(rect, point) {
    const x = Phaser.Math.Clamp(point.x, rect.left, rect.right);
    const y = Phaser.Math.Clamp(point.y, rect.top, rect.bottom);
    return new Phaser.Math.Vector2(x, y);
}


