import Pickup from "./Pickup";
import GameManager from "./GameManager";

export default class CardPickup extends Pickup {
    constructor(scene, x, y, icon = 'CardSapling', value = 50) {
        super(scene, x, y, icon);
        this.setScale(0.15);
        this.setOrigin(0.5, 0.5);
        this.icon = icon;
        this.value = value;

        this.spin = scene.add.tween({
            targets: this,
            // shrink width then flip to look like a card spinning
            scaleX: 0,
            duration: 200,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
            onYoyo: () => {
                this.flipX = !this.flipX;
            }
        })
        this.setDepth(99);
    }

    playerCollide(player) {
        GameManager.cards.push(
            { src: getCardPath(this.icon), title: this.icon.replace('Card', ''), money: this.value },
        )
        this.scene.setupCards();
        this.playPickupSound();
        this.destroy();
    }
}

function getCardPath(id) {
    return `assets/${id}.png`;
}