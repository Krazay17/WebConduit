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
        { type: 'CardSapling', weight: 1000, min: 1, max: 50 },
        { type: 'CardTorch', weight: 750, min: 50, max: 100 },
        { type: 'CardCrystal', weight: 700, min: 100, max: 200 },
        { type: 'CardFireball', weight: 500, min: 200, max: 500 },
        { type: 'CardFalcion', weight: 10, min: 2000, max: 3000 },
        { type: 'CardScythe', weight: 1, min: 999999, max: 999999 },
    ];
    if (cardType) {
        return cardTypes.find(card => card.type === cardType);
    } else {
        return getWeightedRandomCard(cardTypes);
        //return cardTypes[Math.floor(Math.random() * cardTypes.length)];
    }
}

function getWeightedRandomCard(cards) {
    const totalWeight = cards.reduce((sum, card) => sum + card.weight, 0);
    let random = Math.random() * totalWeight;

    for (let card of cards) {
        if (random < card.weight) {
            return card;
        }
        random -= card.weight;
    }
}