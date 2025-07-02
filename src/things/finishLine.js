import GameManager from "./GameManager";
import Pickup from "./Pickup";

export default class FinishLine extends Pickup {
    constructor(scene, x, y, obj) {
        super(scene, x, y, 'finishline');
        this.scene.finishLine = this;
    }

    playerCollide() {
        if (!this.scene.raceTimer) return;
        const level = this.scene.scene.key;
        const time = this.scene.raceTime.toFixed(2);
        const player = GameManager.name.text;
        this.scene.time.removeEvent(this.scene.raceTimer)
        delete this.scene.raceTimer;
        this.setTint(0x00FF00);

        this.scene.network.socket.emit('highScoreRequest', { level, time, player })
    }

    hit() {}
}