import BaseGame from "./_basegame";

export default class Level7 extends BaseGame {
    constructor() {
        super('Level7');
    }

    create() {
        this.setupSky({ sky1: 'redsky0' });
        this.setupWorld(0, 0, 3104, 8000);
        this.setupPlayer();
        this.setupGroups();
        this.setupTileMap('tilemap7');
        this.setupCollisions();
        this.setupMusic();
    }
}
