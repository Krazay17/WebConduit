export default class ScoreBoard extends Phaser.GameObjects.Container {
    constructor(scene, x, y, scores) {
        super(scene, x, y);
        this.scene = scene;
        this.scoresText = scores;
        this.setDepth(1);        
        


        this.init(scores);
    }

    init(scores) {
        if (!scores) return;

        const bg = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, 200, 250, 0x000000, .25).setOrigin(0);
        this.add(bg);
        this.sendToBack(bg);

        for (let i = 0; i < Math.min(10, scores.length); i++) {
            const { player, time } = scores[i];
            const offsetY = i * 25;

            const text = `${i + 1}. ${player}: ${time}s`;

            const scoreText = new Phaser.GameObjects.Text(this.scene, 0, offsetY, text, {
                fontSize: '16px',
                color: '#FFFFFF',
            });
            this.add(scoreText);
        }
    }
}