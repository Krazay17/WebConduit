import Pickup from "./Pickup";
import GameManager from "./GameManager";

export default class CardPickup extends Pickup {
    constructor(scene, x, y, card, value) {
        if (!card) {
            card = getCard();
        } else if (typeof card === 'string') {
            card = getCard(card);
        }
        super(scene, x, y, card.type);
        this.setScale(0.15);
        this.setOrigin(0.5, 0.5);
        this.icon = card.type;
        this.value = value;

        if (!this.value) {
            this.value = Phaser.Math.Between(card.min, card.max);
        }

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

    hit() { }

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

function getCard(cardType) {
    const cardTypes = [
        { type: 'CardSapling', min: 1, max: 50 },
        { type: 'CardTorch', min: 50, max: 100 },
        { type: 'CardCrystal', min: 100, max: 200 },
        { type: 'CardFireball', min: 200, max: 500 },
    ];
    if (cardType) {
        return cardTypes.find(card => card.type === cardType);
    } else {
        return cardTypes[Math.floor(Math.random() * cardTypes.length)];
    }
}