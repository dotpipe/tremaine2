export class Deck {
  constructor(cards = []) {
    this.deck = [...cards];
    this.hand = [];
    this.discard = [];
    this.shuffle();
  }

  shuffle() {
    this.deck.sort(() => Math.random() - 0.5);
  }

  draw(count = 1) {
    for (let i = 0; i < count; i++) {
      if (!this.deck.length) this.reshuffleDiscard();
      const card = this.deck.shift();
      if (card) this.hand.push(card);
    }
  }

  drawTo(maxHand = 6) {
    while (this.hand.length < maxHand && (this.deck.length || this.discard.length)) {
      this.draw(1);
    }
  }

  play(index) {
    if (index < 0 || index >= this.hand.length) return null;
    const [card] = this.hand.splice(index, 1);
    if (card) this.sendToBottom(card);
    return card || null;
  }

  discardCard(card) {
    if (card) this.sendToBottom(card);
  }

  discardFromHand(index) {
    if (index < 0 || index >= this.hand.length) return null;
    const [card] = this.hand.splice(index, 1);
    if (card) this.sendToBottom(card);
    return card || null;
  }

  sendToBottom(card) {
    this.deck.push(card);
  }

  reshuffleDiscard() {
    if (!this.discard.length) return;
    this.deck = this.discard.splice(0);
    this.shuffle();
  }
}
