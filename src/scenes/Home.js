import BaseGame from './_basegame.js'
import GameManager from '../things/GameManager.js';
import ScoreBoard from '../things/scoreBoard.js';
import Shop from '../things/shop.js';
import Vault from '../things/vault.js';

export default class Home extends BaseGame {
    constructor() {
        super('Home');
    }

    create() {
        this.setupSky();
        this.setupWorld(0, 0, 6400, 6400);
        this.setupPlayer(3200, 3150);
        this.setupGroups();
        this.setupTileMap('tilemapHome');
        this.setupCollisions();
        this.setupMusic();
        this.setupNet();

        // const boxPos = [[-200, 200], [-500, 400], [-400, 200], [-200, 400], [100, 450], [400, 400], [200, 300]];
        // boxPos.forEach(pos => this.walkableGroup.add(new Breakable(this, pos[0], pos[1], 'boxsheet', 2)));


        // const widePlatformPos = [
        //     [-1200, 350], [-800, 500], [-400, 650], [0, 800], [400, 650], [800, 500], [1200, 350], [400, 1000], [-400, 1000], [-700, 1200], [700, 1200],
        // ];
        // widePlatformPos.forEach(pos => {
        //     const plat = this.walkableGroup.create(pos[0], pos[1], 'platformwide');
        //     plat.refreshBody();
        // });

        // const largePlatform = this.walkableGroup.create(0, 1450, 'largeplatform').setScale(5, 1.5);
        // largePlatform.refreshBody();

        this.setupPortals();
        this.setupShop();
        this.spawnBonusCard();
        this.setupVault();

        this.network.socket.emit('highScoreRequest');
    }

    update(time, delta) {
        super.update(time, delta);
    }

    setupVault() {
        this.vault = new Vault(this, 1956.00, 3310);
    }

    setupPortals() {
        this.portals = this.physics.add.staticGroup();

        if (!this.anims.get('portal3')) {
            this.anims.create({
                key: 'portal3',
                frameRate: 6,
                frames: this.anims.generateFrameNumbers('portal3', { start: 0, end: 5 }),
                repeat: -1,
            });
        }

        this.portalData = {
            // Tower climb Enemies
            portal1: {
                x: 3200,
                y: 2650,
                tex: 'portal3',
                tint: 0xFF0000,
                targetScene: 'Level1',
            },
            // First race map, back and forth lava jumps
            portal2: {
                x: 3850,
                y: 2400,
                tex: 'portal3',
                tint: 0xFFBB00,
                targetScene: 'Level2',
            },
            // Lava triangles
            portal3: {
                x: 2050,
                y: 2050,
                tex: 'portal3',
                tint: 0x00FFFF,
                targetScene: 'Level3',
            },
            // Blue coin lava slam
            portal4: {
                x: 1070,
                y: 1860,
                tex: 'portal3',
                tint: 0x0000FF,
                targetScene: 'Level4',
            },
            // Tutorial
            portal5: {
                x: 3980,
                y: 3260,
                tex: 'portal3',
                tint: 0xFFFFFF,
                targetScene: 'Level5',
            },
            // Dont know yet New map
            portal6: {
                x: 3142,
                y: 1184,
                tex: 'portal3',
                tint: 0xFF00FF,
                targetScene: 'Level6',
            },
            // Dont know yet New map
            portal7: {
                x: 2290,
                y: 3750,
                tex: 'portal3',
                tint: 0x8800FF,
                targetScene: 'Level7',
            },
            // Dont know yet New map
            portal8: {
                x: 4590,
                y: 2976,
                tex: 'portal3',
                tint: 0xFFFF44,
                targetScene: 'Level8',
            },
            // Yaya map
            portalYaya1: {
                x: 3350,
                y: 2100,
                tex: 'portal3',
                tint: 0x00FF00,
                targetScene: 'LevelYaya1',
            },
        }

        Object.entries(this.portalData).forEach(([key, data]) => {
            const portal = this.portals.create(data.x, data.y, data.tex)
                .setScale(.2)
                .play(data.tex)
                .setTint(data.tint);

            portal.targetScene = data.targetScene;
            this.shrinkCollision(portal, 140, 140);
        });

        this.physics.add.overlap(this.player, this.portals, (player, portal) => {
            if (portal.targetScene && this.scene.key !== portal.targetScene) {
                GameManager.useLastLocation = false;
                GameManager.save();
                console.log(portal.targetScene)
                this.scene.start(portal.targetScene);
            }
        });

    }

    updateScoreBoard(data) {
        if (!this.scoreBoard) this.scoreBoard = {};

        let x = 0;
        let y = 0;

        data.forEach(obj => {
            switch (obj.level) {
                case 'Home':
                    x = 5200;
                    y = 250;
                    break;
                case 'Level2':
                    x = this.portalData['portal2'].x;
                    y = this.portalData['portal2'].y;
                    break;
                case 'Level3':
                    x = this.portalData['portal3'].x;
                    y = this.portalData['portal3'].y;
                    break;
                case 'Level4':
                    x = this.portalData['portal4'].x;
                    y = this.portalData['portal4'].y;
                    break;
                case 'Level5':
                    x = this.portalData['portal5'].x;
                    y = this.portalData['portal5'].y;
                    break;
                case 'Level6':
                    x = this.portalData['portal6'].x;
                    y = this.portalData['portal6'].y;
                    break;
                case 'Level7':
                    x = this.portalData['portal7'].x;
                    y = this.portalData['portal7'].y;
                    break;
                case 'Level8':
                    x = this.portalData['portal8'].x;
                    y = this.portalData['portal8'].y;
                    break;
                case 'LevelYaya1':
                    x = this.portalData['portalYaya1'].x;
                    y = this.portalData['portalYaya1'].y;
                    break;
            }

            // recreate scoreboard
            if (this.scoreBoard[obj.level]) {
                this.scoreBoard[obj.level].destroy();
            }

            const board = new ScoreBoard(this, x + 100, y - 125, obj.scores);
            this.add.existing(board);
            this.scoreBoard[obj.level] = board;
        });
    }

    spawnBonusCard() {
        if (!this.player) return;
        const claimedToday = GameManager.flags.bonusCard >= startOfToday();

        if (!claimedToday) {
            const bonusCard = this.spawnManager.spawnCard(
                2900, 3100, null, 'CardDaily', 100000
            );

            // Cache “real” collision
            const originalCollide = bonusCard.playerCollide.bind(bonusCard);

            bonusCard.playerCollide = (player) => {
                // Stamp *this* midnight so “today” is locked in even if
                // the player crosses midnight before you can save.
                GameManager.flags.bonusCard = startOfToday();
                GameManager.save();

                return originalCollide(player);
            };
        }
    }


    setupShop() {
        this.shop = new Shop(this, 2230, 3200);
        this.add.existing(this.shop);
    }
}

// Milliseconds since epoch for local midnight at the start of *today*
function startOfToday() {
    const d = new Date();      // now, local time
    d.setHours(0, 0, 0, 0);    // hard-reset to 00:00:00.000
    return d.getTime();        // ↩︎ ms since 1970-01-01 UTC
}
