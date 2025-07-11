import Pickup from "./Pickup";
import GameManager from "./GameManager";

export default class CardPickup extends Pickup {
    constructor(scene, x, y, icon = 'cardSapling') {
        super(scene, x, y, icon);
        this.setScale(0.15);
        this.setOrigin(0.5, 0.5);
    }

    playerCollide(player) {
        GameManager.cards.push(
            { src: 'assets/CardSapling.png', title: 'Sapling', money: 50 },
        )
        this.scene.setupCards();
        this.playPickupSound();
        this.destroy();
    }
}