export class CardLibrary {
  constructor(cards = []) {
    this.cards = cards;
    this.byId = new Map(cards.map(c => [String(c.id), c]));
  }

  static parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    const header = lines.shift().split(",");
    return lines.map(line => {
      const parts = line.split(",");
      const row = {};
      for (let i = 0; i < header.length; i++) row[header[i]] = parts[i] ?? "";
      const parsePipe = (v) => String(v || "").split("|").map(s => s.trim()).filter(Boolean);
      const requirement = String(row.play_requirement || "");
      const reqMatch = requirement.match(/Trigger:(.*)/i);
      const requirementValues = reqMatch ? parsePipe(reqMatch[1]).map(Number).filter(n => !Number.isNaN(n)) : [];
      return {
        id: String(row.id || ""),
        name: String(row.name || ""),
        type: String(row.type || "Attack"),
        cost: Number(row.cost || 0),
        attack: Number(row.attack || 0),
        defense: Number(row.defense || 0),
        triggers: parsePipe(row.triggers).map(Number).filter(n => !Number.isNaN(n)),
        duration: String(row.duration || ""),
        special: String(row.special || ""),
        counters: Number(row.counters || 0),
        play_requirement: requirement,
        requirementValues,
        rarity: String(row.rarity || "Common"),
        description: String(row.description || ""),
        raw: row
      };
    });
  }

  static fromCSVText(text) {
    return new CardLibrary(CardLibrary.parseCSV(text));
  }

  drawRandom(count = 1) {
    const pool = [...this.cards];
    pool.sort(() => Math.random() - 0.5);
    return pool.slice(0, count);
  }
}
