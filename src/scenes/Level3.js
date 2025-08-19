import BaseGame from "./_basegame";

export default class Level3 extends BaseGame {
    constructor() {
        super('Level3');

    }

    create() {

        this.setupSky({ sky1: 'redsky0' });
        this.setupWorld(0, 0, 6400, 6400);
        this.setupPlayer();
        this.setupGroups();
        this.setupTileMap('tilemap3');
        this.setupCollisions();
        this.setupMusic();
        this.setupNet();

    }
}
