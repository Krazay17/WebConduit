import Player from '../things/Player.js';
import NetworkManager from '../things/NetworkManager.js';
import GameManager from '../things/GameManager.js';
import SpawnManager from '../things/_spawnmanager.js';
import WeaponGroup from '../weapons/WeaponGroup.js';
import SoundUtil from '../things/soundUtils.js';

export default class BaseGame extends Phaser.Scene {
  constructor(key) {
    super(key);

    this.key = key;

  }

  preload() {
    this.loadingBar();
  }

  update(time, delta) {
    if (this.player && this.playerSpawned) this.player.handleInput(time, delta);
    if (this.network.voiceChat) {

      this.network.voiceChat.updateVolumes();
    };

    // if (this.network) {
    //   this.network.socket.emit('playerMove', {
    //     x: this.player.x,
    //     y: this.player.y
    //   });
    // }
  }

  setupWorld(xleft = -1600, ytop = 0, width = 6400, height = 6400) {
    this.physics.world.setBounds(xleft, ytop, width, height);
    this.bounds = this.physics.world.bounds;
    this.cameras.main.setBounds(xleft, ytop, width, height);

    this.network = new NetworkManager(this);
    this.spawnManager = new SpawnManager(this)

    this.network.refreshScene(this);

    this.input.on('wheel', (wheel) => {
      if (!this.zoom) this.zoom = 1;
      // Step 1: Adjust zoom
      this.zoom -= wheel.deltaY / 1000;

      // Step 2: Clamp
      this.zoom = Phaser.Math.Clamp(this.zoom, 0.6, 3);

      // Step 3: Snap to nearest 0.2
      this.zoom = Phaser.Math.Snap.To(this.zoom, 0.1);


      this.sky1.setScale(1 / this.zoom);
      this.cameras.main.setZoom(this.zoom)
      //this.resizeBackgroundToFill();
    })


    window.addEventListener('beforeunload', () => {
      GameManager.area = this.key;
      GameManager.location.x = this.player.x;
      GameManager.location.y = this.player.y;
      GameManager.useLastLocation = true;
      GameManager.save();
    });

    this.events.once('shutdown', () => {
      this.cleanupScene();
    }, this);
    this.events.once('destroy', () => {
      this.cleanupScene();
    }, this);


    // window.addEventListener('focus', () => {
    //   this.sound.mute = false;
    // });

    // window.addEventListener('blur', () => {
    //   this.sound.mute = true;
    // });
  }

  setupSky({ sky1 = 'purplesky0', sky2 = true, sky3 = true } = {}) {
    this.sky1 = this.add.image(this.scale.width / 2, this.scale.height / 2, sky1)
      .setOrigin(.5).setDisplaySize(this.scale.width, this.scale.height).setScrollFactor(0);

    if (sky2) this.sky2 = this.add.image(1000, 1200, 'purplesky1').setScale(1).setScrollFactor(.2).setOrigin(.5, .5);
    if (sky3) this.sky3 = this.add.image(2400, 2000, 'purplesky2').setScale(1).setScrollFactor(.6).setOrigin(.5, .5);

    this.scale.on('resize', this.resizeSky, this);
  }

  resizeSky(gameSize) {
    const width = gameSize.width;
    const height = gameSize.height;
    this.sky1.setPosition(width / 2, height / 2);
  }

  setupPlayer(x = 111, y = 111) {
    const locationX = GameManager.useLastLocation ? GameManager.location.x : x;
    const locationY = GameManager.useLastLocation ? GameManager.location.y : y;

    this.player = new Player(this, locationX, locationY);
    if (this.spawnManager) {
      this.spawnManager.player = this.player;
    }
    if (GameManager.useLastLocation) {
      this.playerSpawned = true;
    }
    this.cameras.main.startFollow(this.player, false, .05, .05);

    if(this.network.voiceChat){
    this.network.voiceChat.setPlayerGetter(() => {
      return {x: this.player.x, y: this.player.y};
    });
  }


    if (!this.scene.isActive('Inventory')) {
      this.scene.launch('Inventory', { player: this.player });
      this.invMenu = this.scene.get('Inventory');
    } else {
      this.invMenu = this.scene.get('Inventory');
      this.invMenu.init({ player: this.player });
    }


    this.input.keyboard.on('keydown-C', () => {
      this.invMenu.scene.setVisible(true);
      this.invMenu.scene.setActive(true);
      this.invMenu.input.enabled = true;
    });
    this.input.keyboard.on('keyup-C', () => {
      this.invMenu.scene.setVisible(false);
      this.invMenu.input.enabled = false;
      this.invMenu.scene.setActive(false);
    });

    if (!this.scene.isActive('PlayerUI')) {
      this.scene.launch('PlayerUI', { player: this.player, gameScene: this });
      this.playerUI = this.scene.get('PlayerUI');
    } else {
      this.playerUI = this.scene.get('PlayerUI');
      this.playerUI.init({ player: this.player, gameScene: this });
    }
    if (!this.scene.isActive('EscMenu')) {
      this.scene.launch('EscMenu', { gameScene: this, playerUI: this.playerUI });
      this.escMenu = this.scene.get('EscMenu');
    } else {
      this.escMenu = this.scene.get('EscMenu');
      this.escMenu.init({ gameScene: this, playerUI: this.playerUI })
    }
  }

  spawnPlayer(x, y) {
    if (!GameManager.useLastLocation) {
      this.setupRaceTimer();
      this.cameras.main.startFollow(this.player, false, 1, 1);
      this.player.setPosition(x, y);
      this.cameras.main.startFollow(this.player, false, .05, .05);
      GameManager.location.x = x;
      GameManager.location.y = y;
      GameManager.useLastLocation = true;
      this.playerSpawned = true;
    }
  }

  setupTileMap(tilemap = 'tilemap1', tilesheet = 'tilesheet') {
    if (this.tilemap) return;
    this.tilemap = this.make.tilemap({ key: tilemap });
    this.tileset = this.tilemap.addTilesetImage(tilesheet, tilesheet);
    this.layer1 = this.tilemap.createLayer('layer1', this.tileset, 0, 0);
    this.walls = this.tilemap.createLayer('walls', this.tileset, 0, 0);
    this.layer2 = this.tilemap.createLayer('layer2', this.tileset, 0, 0);
    this.walls2 = this.tilemap.createLayer('walls2', this.tileset, 0, 0);

    if (this.walls && this.walls2) {
      this.walls.setCollisionByExclusion([-1]); // excludes only empty tiles
      this.walls2.setCollisionByExclusion([-1]); // excludes only empty tiles

      this.tilemapColliders = [
        { walls: this.walls, handler: 'touchWall' },
        { walls: this.walls2, handler: 'touchFireWall' },
      ];
    }

    if (!this.tilemap) return;

    this.tileObjects = this.tilemap.getObjectLayer('objects');
    this.tileObjects.objects.forEach(obj => {
      if (this.spawnManager[obj.name]) {
        this.spawnManager[obj.name]?.(obj.x, obj.y, obj);
      } else {
        this[obj.name]?.(obj.x, obj.y, obj);
      }
    });

  }

  cleanupScene() {
    if (this.layer1) { this.layer1.destroy(); this.layer1 = null; }
    if (this.layer2) { this.layer2.destroy(); this.layer2 = null; }
    if (this.walls) { this.walls.destroy(); this.walls = null; }
    if (this.walls2) { this.walls2.destroy(); this.walls2 = null; }

    if (this.tilemap) { this.tilemap.destroy(); this.tilemap = null; }
  }

  setupGroups() {
    this.weaponGroup = new WeaponGroup(this, this.player);
    this.spawnManager.setupGroups(this);
    this.walkableGroup = this.physics.add.group({ allowGravity: false, immovable: true });

    const spawnGroups = this.spawnManager.getGroups();

    this.attackableGroups = [
      { group: this.walkableGroup, handler: 'platformHit', zap: false },
      ...spawnGroups,
    ]

    this.walkingGroups = [
      { group: this.physics.add.group({ runChildUpdate: true }).add(this.player) },
      ...spawnGroups.filter(({ walls }) => walls ?? true),
    ]
  }

  setupCollisions() {
    const spawnGroups = this.spawnManager.getGroups();

    this.attackableGroups.forEach(({ group, handler }) =>
      this.weaponOverlap = this.physics.add.overlap(group, this.weaponGroup, (target, weapon) => {
        weapon[handler]?.(target);
      },
        null,
        this
      ));

    spawnGroups.forEach(({ group }) =>
      this.enemyOverlap = this.physics.add.overlap(this.player, group, (player, entity) => {
        entity.playerCollide?.(player);
      }, null, this));


    this.walkingGroups.forEach(({ group }) =>
      this.walkCollider = this.physics.add.collider(group, this.walkableGroup, (entity, wall) => {
        entity.touchWall?.(wall);
      }, null, this));

    // TileMap wall collisions
    if (this.tilemapColliders?.length) {
      this.tilemapColliders.forEach(({ walls, handler }) => {
        this.tileCollider1 = this.physics.add.collider(walls, this.weaponGroup, null, (wall, weapon) => {
          weapon[handler]?.(wall);

          if (weapon.ignoreWall) {
            return false;
          }
          return true;
        }, this);

        this.walkingGroups.forEach(({ group }) =>
          this.tileCollider2 = this.physics.add.collider(group, walls, (entity, wall) => {
            entity[handler]?.(wall);
          }, null, this));
      });
    }

    this.weaponWalkableCollider = this.physics.add.collider(this.weaponGroup, this.walkableGroup);
  }

  clearCollisions() {
    if (this.weaponOverlap) {
      this.weaponOverlap.destroy();
    }
    if (this.enemyOverlap) {
      this.enemyOverlap.destroy();
    }
    if (this.walkCollider) {
      this.walkCollider.destroy();
    }
    if (this.tileCollider1) {
      this.tileCollider1.destroy();
    }
    if (this.tileCollider2) {
      this.tileCollider2.destroy();
    }
    if (this.weaponWalkableCollider) {
      this.weaponWalkableCollider.destroy();
    }
  }

  setupMusic(key = 'music1') {
    const shutdownHandler = () => {
    }

    SoundUtil.setup(this, key, GameManager.volume.music ?? 1);

    this.sound.pauseOnBlur = false;
    this.sfx = {};

    this.events.once('shutdown', () => {
      SoundUtil.savePosition();
      this.sfx = {};
    });
  }

  setupPlatforms(platformPos = [[0, 800]]) {
    platformPos.forEach(pos => this.walkableGroup.create(pos[0], pos[1], 'platform'));
  }

  setupQuick(x = 0, y = 0) {
    this.setupSky();
    this.setupWorld();
    this.setupTileMap()
    this.setupPlayer(x, y);
    this.setupGroups();
    this.setupCollisions();
    this.setupMusic();
  }

  shrinkCollision(object, x, y) {
    object.body.setSize(x, y); // Smaller than sprite size
    object.body.setOffset(
      (object.width - x) / 2,
      (object.height - y) / 2
    );
  }

  loadingBar() {
    // Create a progress bar background
    const { width, height } = this.cameras.main;
    const barWidth = 300;
    const barHeight = 30;
    const barX = (width - barWidth) / 2;
    const barY = (height - barHeight) / 2;

    const progressBarBg = this.add.graphics();
    progressBarBg.fillStyle(0x222222, 1);
    progressBarBg.fillRect(barX, barY, barWidth, barHeight);

    const progressBar = this.add.graphics();

    // Optional: Add text
    const loadingText = this.add.text(width / 2, barY - 40, 'Loading...', {
      fontSize: '20px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Listen to loading progress
    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(barX, barY, barWidth * value, barHeight);
      if (value === 1) {
        loadingText.destroy();
        progressBar.clear();
      }
    });
  }

  spawnSunman(x, y) {
    this.spawnManager.spawnSunMan(x, y, 10)
  }

  spawnBullets(x, y, text) {
    const delay = parseInt(text, 10);

    this.time.addEvent({
      delay: delay,
      loop: true,
      callback: () => {
        this.spawnManager.spawnBullet(x, y);
      }
    })

    // if (!this.bulletSpawnLocs) {
    //   this.bulletSpawnLocs = [];

    //   this.time.addEvent({
    //     delay: delay,
    //     loop: true,
    //     callback: () => {
    //       this.bulletSpawnLocs.forEach(([x, y]) => {
    //         this.spawnManager.spawnBullet(x, y);
    //         console.log('fire')

    //       })
    //     }
    //   })
    // }
    // this.bulletSpawnLocs.push([x, y])
  }

  spawnSourceBlock(x, y) {
    const block = this.spawnManager.spawnSourceBlock(x, y);
  }

  spawnBooster(x, y, obj) {
    this.spawnManager.spawnBooster(x, y, obj);
  }

  setupRaceTimer() {
    this.raceTime = 0;
    if (this.raceTimeText) this.raceTimeText.destroy();
    this.raceTimeText = this.add.text(this.scale.width, 0, this.raceTime, {
      fontSize: '44px',
    })
      .setOrigin(1, 0)
      .setScrollFactor(0);
    if (this.raceTimer) {
      this.time.removeEvent(this.raceTimer);
    }
    this.raceTimer = this.time.addEvent({
      delay: 10,
      loop: true,
      callback: () => {
        this.raceTime += .01;
        this.raceTimeText?.setText(this.raceTime.toFixed(2));
      },
    })
  }

  updateScoreBoard(data) {

  }

}