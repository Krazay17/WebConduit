import BaseGame from "./_basegame";

export default class Level6 extends BaseGame {
    constructor() {
        super('Level6');

    }

    create() {
        this.setupSky({ sky1: 'redsky0' });
        this.setupWorld(0, 0, 3104, 8000);
        this.setupPlayer();
        this.setupGroups();
        this.setupTileMap('tilemap6');
        this.setupCollisions();
        this.setupMusic();
    }
}
