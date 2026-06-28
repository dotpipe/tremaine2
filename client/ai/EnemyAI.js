export class EnemyAI {
  constructor(library) {
    this.library = library;
  }

  buildSquad(seed = 1) {
    const names = ["Ghoul", "Wretch", "Stalker", "Crawler", "Mender", "Ravager", "Shardling", "Banshee"];
    const squad = [];
    for (let i = 0; i < 4; i++) {
      squad.push({
        id: `e${seed}-${i}`,
        name: names[(seed + i) % names.length],
        hp: 2 + ((seed + i) % 4),
        atk: 1 + ((seed + i * 2) % 3),
        def: 0,
        status: {}
      });
    }
    return squad;
  }

  buildDeck(seed = 1) {
    const cards = [...this.library.cards];
    cards.sort((a, b) => (a.id + seed).localeCompare(b.id + seed));
    return cards.filter((c, i) => (i + seed) % 3 !== 0).slice(0, 18);
  }

  chooseCard(hand, phase, phaseBudget, phi) {
    const phaseOk = (card) => phase === "attack"
      ? (card.type === "Attack" || card.type === "Spell")
      : (card.type === "Defense" || card.type === "Spell");
    const viable = hand.filter(c => phaseOk(c) && (c.type !== "Spell" || phi >= c.cost));
    if (!viable.length) return null;
    viable.sort((a, b) => (b.attack + b.defense) - (a.attack + a.defense));
    return viable[0];
  }
}
