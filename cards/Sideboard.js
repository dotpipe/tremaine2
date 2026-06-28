export class Sideboard {
  constructor() {
    this.cards = [];
  }

  add(
    card
  ) {
    const count = this.cards.filter((c) => String(c.id) === String(card.id)).length;
    if (count >= 10) {
      return false;
    }

    this.cards.push(card);
    return true;
  }

  remove(id) {
    const index = this.cards.findIndex((card) => String(card.id) === String(id));
    if (index < 0) {
      return null;
    }
    return this.cards.splice(index, 1)[0];
  }

  moveToDeck(
    deck,
    id
  ) {
    const i = this.cards.findIndex((c) => c.id === id);
    if (i < 0) return;
    deck.cards.push(this.cards.splice(i, 1)[0]);
  }
}
