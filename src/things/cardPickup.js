import Pickup from "./Pickup";
import GameManager from "./GameManager";
import { addCard } from "../domStuff/IconGrid";
import { playSound } from "./soundUtils";

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
        this.pickupSound = card.sound ? card.sound : 'pickup';
        if(this.pickupSound !== 'pickup' || this.pickupSound !== 'pickup3') this.detune = 0;

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

        playSound(this.scene, this.pickupSound, {detune: this.detune});

        // Cancel existing delayed card setup if one exists
        if (this.scene.cardSetupTimer?.remove) {
            this.scene.cardSetupTimer.remove();
        }

        const scene = this.scene;

        this.destroy();
    }

}

function getCardPath(id) {
    return `assets/${id}.png`;
}

function getCard(cardType) {

    const cardTypes = [
        { type: 'CardDaily', rarity: 1, weight: 0, min: 1, max: 50, sound: 'pickup' },
        { type: 'CardSapling', rarity: 1, weight: 3500, min: 1, max: 50, sound: 'pickup' },
        { type: 'CardTorch', rarity: 2, weight: 2500, min: 50, max: 100, sound: 'pickup' },
        { type: 'CardCrystal', rarity: 3, weight: 1000, min: 100, max: 200, sound: 'pickup' },
        { type: 'CardFireball', rarity: 4, weight: 750, min: 200, max: 500, sound: 'pickup' },
        { type: 'CardFalcion', rarity: 5, weight: 300, min: 500, max: 1000, sound: 'pickup2' },
        { type: 'CardPistol', rarity: 6, weight: 100, min: 1000, max: 2000, sound: 'pickup2' },
        { type: 'CardScytheYang', rarity: 7, weight: 10, min: 11111, max: 33333, sound: 'pickup6' },
        { type: 'CardScythe', rarity: 8, weight: 5, min: 66666, max: 66666, sound: 'pickup7' },
    ];
    if (cardType) {
        const match = cardTypes.find(card => card.type === cardType);
        return match || getWeightedRandomCard(cardTypes);
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