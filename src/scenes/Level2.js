import BaseGame from "./_basegame.js";

export default class Level2 extends BaseGame {
    constructor() {
        super('Level2');
    }

    create() {
        this.setupSky();
        this.setupWorld(0, 0, 6400, 6400);
        this.setupPlayer();
        this.setupGroups();
        this.setupTileMap('tilemap2');
        this.setupCollisions();
        this.setupMusic('music0');
        this.setupNet();

    }
}
