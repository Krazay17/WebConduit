import BaseGame from './_basegame.js';

export default class Level1Old extends BaseGame {
  constructor() {
    super('Level1Old');
  }

  create() {
    this.setupSky({ sky1: 'redsky0', sky2: false, sky3: false });
    this.sky2 = this.add.image(600, 400, 'redsky1').setScale(1).setScrollFactor(.3);
    this.sky3 = this.add.image(600, 400, 'redsky2').setScale(1).setScrollFactor(.6);
    this.setupWorld(-1200, 0, 2400, 900);
    this.setupMusic('music0');
    this.setupPlayer(-1100, 300);
    this.setupGroups();
    this.setupCollisions();


    // this.physics.add.collider(this.player, this.turrets, (player, turret) => {
    //   this.player.touchWall()
    // }, null, this);

    // Spawns
    const moveingPlatformPos = [
      [-1100,], [-900, 150], [-400, 100], [-200,], [-150, 50], [100,], [300,], [700,], [900,], [1100,],
      [-900, 300], [-600, 200], [-150, 300], [100, 200], [300, 100], [700, 450], [900, 200], [1100, 100],
      [-900, 500], [-300, 350], [-100, 225], [300, 600], [600, 550], [1000, 500], [1100, 300],
      [-1100, 400], [-900, 700], [-500, 800], [-300, 700], [-100, 700], [100, 800], [300, 850], [500, 700], [700, 700], [900, 700], [1100, 700],
    ];

    moveingPlatformPos.forEach(pos => this.walkableGroup.create(pos[0], pos[1], 'platform')
      .setVelocityY(20));

    this.time.addEvent({
      delay: Phaser.Math.Between(2000, 5000),
      callback: () => this.spawnManager.spawnCoin(Phaser.Math.Between(-1100, 1100), 0),
      loop: true
    });

    this.spawnManager.spawnSunMan(1900, 0);
    this.spawnManager.spawnSunMan(2000, 400);
    this.time.addEvent({
      delay: Phaser.Math.Between(2000, 10000),
      loop: true,
    });

    this.spawnManager.spawnBullets(1900, 50, 8);
    this.time.addEvent({
      delay: 3000,
      callback: () => this.spawnManager.spawnBullets(1900, 50, 8),
      loop: true
    });

    this.turrets = [this.spawnManager.spawnTurret(1400, 100)];

    this.turrets.forEach(turret => {
      this.spawnManager.spawnFireballs(turret.body.x, turret.body.y + 40)
    });

    this.time.addEvent({
      delay: 1000,
      callback: () => this.turrets.forEach(turret => {
        if (turret.body) this.spawnManager.spawnFireballs(turret.body.x, turret.body.y + 40);
      }),
      loop: true
    });

  }

  update(time, delta) {
    super.update(time, delta);
    this.walkableGroup.getChildren().forEach(platform => {
      if (platform.body.y > this.physics.world.bounds.height)
        platform.body.y = 0 - platform.body.height;
    });

  }
}