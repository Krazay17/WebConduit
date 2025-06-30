import BaseGame from "./_basegame";

export default class LevelYaya1 extends BaseGame {
    constructor() {
        super('LevelYaya1');

    }

    create() {
        this.setupSky({ sky1: 'redsky0' });
        this.setupWorld(0, 0, 7104, 30304);
        this.setupPlayer();
        this.setupGroups();
        this.setupTileMap('tilemapYaya1');
        this.setupCollisions();
        this.setupMusic();
    }
}
