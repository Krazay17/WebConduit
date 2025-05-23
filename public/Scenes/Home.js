import BaseGame from './BaseGame.js'

export default class Home extends BaseGame
{
    constructor()
    {
        super('Home');
    }

    preload()
    {
        super.preload();
        this.load.image('platformwide', 'Assets/platformwide.png')
        this.load.image('portal0', 'Assets/Portal1.png')
        this.load.image('portal1', 'Assets/Portal2.png')
    }

    create()
    {
        this.saveLevel();
        this.setupKeybinds();
        this.setupSky();
        this.setupWorld();
        this.setupMusic('homemusic');
        this.setupFPS();
        this.setupPlayer();

        this.setupGroups();
        this.platformGroups.push(this.widePlatforms = this.physics.add.staticGroup());
        this.breakables.spawnBox(200, 400);
        this.breakables.spawnBox(400, 500);
        this.breakables.spawnBox(100, 550);
        this.breakables.spawnBox(-200, 500);
        this.breakables.spawnBox(-400, 300);
        this.breakables.spawnBox(-500, 500);
        this.breakables.spawnBox(-200, 200);

        this.setupCollisions();

        const widePlatformPos = [
            [-1000, 500], [-800, 600], [-400, 700], [0, 800], [400, 700], [800, 600], [1000, 500]
        ];
        widePlatformPos.forEach(pos => this.platforms.create(pos[0], pos[1], 'platformwide'));

        this.setupPortals();

    }

    update(time, delta)
    {
        super.update(time, delta);
    }

    setupPortals()
    {
        this.portalList = [];

        this.portals = this.physics.add.staticGroup();
        
        const portal0 = this.portals.create(800, 300, 'portal0');
        const portal1 = this.portals.create(-800, 300, 'portal1');

        this.shrinkCollision(portal0, 100, 100);
        this.shrinkCollision(portal1, 100, 100);

        this.tweens.add({
            targets: portal0,
            angle: -360,
            duration: 1000,
            repeat: -1,
        });

        this.tweens.add({
            targets: portal1,
            scaleX: 1,
            scaleY: 1,
            ease: 'Sine.easeInOut',
            duration: 500,
            yoyo: false,
            repeat: -1,
            onRepeat: (tween) => {
                const newScale = Phaser.Math.FloatBetween(0.3, .5);
                tween.updateTo('scaleX', newScale, true);
                tween.updateTo('scaleY', newScale, true);
            }
        });


        portal0.targetScene = 'Level1';
        portal1.targetScene = 'Level3';

        this.portalList.push(portal0, portal1);

        this.physics.add.overlap(this.player, this.portals, (player, portal) => {
            if (portal.targetScene && this.scene.key !== portal.targetScene) {
                this.scene.start(portal.targetScene);
            }
        });

    }
}