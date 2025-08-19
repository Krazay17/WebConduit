import BaseGame from "./_basegame";

export default class Level8 extends BaseGame {
    constructor() {
        super('Level8');
    }

    create() {
        this.setupSky({ sky1: 'redsky0' });
        this.setupWorld(0, 0, 3104, 11200);
        this.setupPlayer();
        this.setupGroups();
        this.setupTileMap('tilemap8');
        this.setupCollisions();
        this.setupMusic();
        this.setupNet();
    }
}