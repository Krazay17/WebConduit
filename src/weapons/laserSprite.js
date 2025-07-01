import { getProperty } from "../myFunctions";

export default class LaserSprite extends Phaser.GameObjects.TileSprite {
    constructor(scene, x, y, player, obj) {
        super(scene, x, y, 0, 16, 'zap');
        // ...
        this.player = player;
        this.props = getProperty(obj);
        const props = this.props;

        this.length = props.length;

        if (!this.scene.laserList) {
            this.scene.laserList = {}
        }
        this.scene.laserList[props?.index] = this;

        if (props.doesFlicker) {
            this.flicker();
        }

        this.rotation = Phaser.Math.DegToRad(obj.rotation);
        this.setOrigin(0, 0.5);
        this.setTint('0xFF0000');
        scene.add.existing(this);
    }

    init(target) {
        this.target = target;
        this.updateZapLine();
        this.activate();
    }

    preUpdate(time, delta) {
        if (!this.active) return;
        this.updateZapLine();
        this.tilePositionX += 10;
        this.boxTrace();
    }

    deactivate() {
        this.setVisible(false);
        this.setActive(false);
    }

    activate() {
        this.setActive(true);
        this.setVisible(true);
    }

boxTrace() {
    const origin = this.getWorldPoint();
    const direction = this.getForwardVector(this.length);
    const ray = new Phaser.Geom.Line(origin.x, origin.y, origin.x + direction.x, origin.y + direction.y);

    const playerBounds = Phaser.Geom.Rectangle.Inflate(this.player?.getBounds(), -15, -15);
    if (!playerBounds) return;

    // Check if the player is in front of the laser
    const toPlayer = new Phaser.Math.Vector2(this.player.x - origin.x, this.player.y - origin.y);
    if (toPlayer.dot(direction) < 0) return; // Behind the laser

    // Ensure player is within max range
    const closestPoint = getClosestPointOnRect(playerBounds, origin);
    const distanceToTarget = Phaser.Math.Distance.BetweenPoints(origin, closestPoint);
    if (distanceToTarget > this.length) return;

    // Check actual intersection (only returns true/false)
    const didHit = Phaser.Geom.Intersects.LineToRectangle(ray, playerBounds);
    if (didHit) {
        this.player.hitLaser(closestPoint); // Or maybe use `this.player.x/y`
        console.log('HIT', closestPoint);

        // Debug
        // const gfx = this.scene.add.graphics();
        // gfx.lineStyle(2, 0xff0000);
        // gfx.strokeLineShape(ray);
        // gfx.fillStyle(0x00ff00, 0.5);
        // gfx.fillPoint(closestPoint.x, closestPoint.y, 4);
    }
}



    flicker() {
        // if (this.flickerTimer) {
        //     this.scene.time.removeEvent(this.flickerTimer)
        // }
        const start = this.props.start || 0;
        const onTime = this.props.onTime || 3000;
        const offTime = this.props.offTime || 1000;
        this.flickerTimer = this.scene.time.addEvent({
            delay: onTime,
            startAt: start,
            loop: true,
            callback: () => {
                if (this.active) {
                    console.log('deactivate')
                    this.deactivate();
                    this.flickerTimer.delay = offTime;
                } else {
                    this.activate();
                    this.flickerTimer.delay = onTime;
                }
            }
        })
    }

    getForwardVector(length = 100) {
        return new Phaser.Math.Vector2(Math.cos(this.rotation), Math.sin(this.rotation)).scale(length);
    }

    updateZapLine() {
        const dx = this.getForwardVector(this.length).x;
        const dy = this.getForwardVector(this.length).y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        this.setRotation(angle);
        this.displayWidth = length;
    }


}

function getClosestPointOnRect(rect, point) {
    const x = Phaser.Math.Clamp(point.x, rect.left, rect.right);
    const y = Phaser.Math.Clamp(point.y, rect.top, rect.bottom);
    return new Phaser.Math.Vector2(x, y);
}
