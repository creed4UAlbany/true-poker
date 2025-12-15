// client/src/game/Deck.js

const SUITS = ['♠️', '♥️', '♦️', '♣️'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export class Deck {
    constructor() {
        this.cards = [];
        this.reset();
    }

    reset() {
        this.cards = [];
        for (let suit of SUITS) {
            for (let value of VALUES) {
                // Determine color based on suit
                const color = (suit === '♥️' || suit === '♦️') ? 'red' : 'black';
                this.cards.push({ suit, value, color });
            }
        }
        this.shuffle();
    }

    shuffle() {
        // Fisher-Yates Shuffle Algorithm
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    deal() {
        return this.cards.pop();
    }
}