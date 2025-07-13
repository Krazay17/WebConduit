import Pickup from "./Pickup";
import GameManager from "./GameManager";
import { addCard } from "../domStuff/IconGrid";

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
        this.card = {
            src: getCardPath(this.icon),
            title: this.icon.replace('Card', ''),
            money: this.value,
            locked: false, // Initially not locked
        };

        this.spin = scene.add.tween({
            targets: this,
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
        const clickCard = (icon) => {
            if (icon.locked) return;
            const savePlayer = player;
            savePlayer.updateMoney(icon.money);

            // Remove the clicked card by index
            const index = GameManager.cards.indexOf(icon);
            if (index !== -1) {
                GameManager.cards.splice(index, 1);
                GameManager.save();
            }
        }
        GameManager.cards.push(this.card);
        GameManager.save();
        addCard(this.card, clickCard)

        this.playPickupSound();

        // Cancel existing delayed card setup if one exists
        if (this.scene.cardSetupTimer?.remove) {
            this.scene.cardSetupTimer.remove();
        }


        const scene = this.scene;

        // scene.cardSetupTimer = scene.time.delayedCall(50, () => {
        //     scene.setupCards();
        //     scene.cardSetupTimer = null; // clean up reference
        // });

        this.destroy();
    }

}

function getCardPath(id) {
    return `assets/${id}.png`;
}

function getCard(cardType) {

    const cardTypes = [
        { type: 'CardSapling', rarity: 1, weight: 1500, min: 1, max: 25 },
        { type: 'CardTorch', rarity: 2, weight: 1000, min: 25, max: 50 },
        { type: 'CardCrystal', rarity: 3, weight: 500, min: 100, max: 200 },
        { type: 'CardFireball', rarity: 4, weight: 250, min: 200, max: 500 },
        { type: 'CardFalcion', rarity: 5, weight: 10, min: 1000, max: 2000 },
        { type: 'CardScythe', rarity: 6, weight: 1, min: 99999, max: 99999 },
    ];
    if (cardType) {
        return cardTypes.find(card => card.type === cardType);
    } else {
        return getWeightedRandomCard(cardTypes);
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