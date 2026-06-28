export class Store {
  constructor(cardSource, options = {}) {
    this.cardSource = cardSource;
    this.goldPerDollar = options.goldPerDollar ?? 50; // $0.02 per gold
    this.rarityPrices = {
      common: 1,
      uncommon: 1.75,
      rare: 3,
      epic: 4,
      legendary: 5,
      ultra: 6,
      ...options.rarityPrices
    };
    this.totalProduced = options.totalProduced ?? 1000000;
    this.forcedPerExpensive = options.forcedPerExpensive ?? 10000;
    this.seed = options.seed ?? 1337;
    // number of packs that can be produced from totalProduced
    this.packsCount = Math.floor(this.totalProduced / 3);
    this.nextPackIndex = 0;
    // schedule of forced expensive card placements: Map(packIndex -> card)
    this.scheduledExpensive = new Map();
    this.prepareExpensiveSchedule();
  }

  // Increase production by additional cards (procedural schedule will be rebuilt)
  increaseProduction(additional) {
    if (!Number.isFinite(additional) || additional <= 0) return;
    this.totalProduced += Math.floor(additional);
    this.packsCount = Math.floor(this.totalProduced / 3);
    // rebuild schedule deterministically
    this.scheduledExpensive = new Map();
    this.prepareExpensiveSchedule();
  }

  // Search tracking
  get searchCounts() {
    if (!this._searchCounts) this._searchCounts = new Map();
    return this._searchCounts;
  }

  recordSearch(cardId) {
    if (cardId == null) return;
    const key = String(cardId);
    const cur = this.searchCounts.get(key) || 0;
    this.searchCounts.set(key, cur + 1);
  }

  topSearches(n = 3) {
    const arr = Array.from(this.searchCounts.entries());
    arr.sort((a, b) => b[1] - a[1]);
    const top = arr.slice(0, n).map(([id]) => {
      return this.getInventory().find((c) => String(c.id) === String(id)) || null;
    }).filter(Boolean);
    return top;
  }

  get cards() {
    if (Array.isArray(this.cardSource)) {
      return this.cardSource;
    }
    if (this.cardSource && Array.isArray(this.cardSource.cards)) {
      return this.cardSource.cards;
    }
    return [];
  }

  getInventory() {
    return this.cards.map((card) => {
      const price = this.getPrice(card);
      const dollarValue = this.getDollarValue(card);
      return {
        ...card,
        price,
        dollarValue,
        displayPrice: `${price} gold (${this.formatCurrency(dollarValue)})`
      };
    });
  }

  getDollarValue(card) {
    const rarity = String(card.rarity || "").trim().toLowerCase();
    const value = this.rarityPrices[rarity];
    return typeof value === "number" && value >= 0 ? value : 1;
  }

  // Trade tracking for dynamic market
  get tradeCounts() {
    if (!this._tradeCounts) this._tradeCounts = new Map();
    return this._tradeCounts;
  }

  recordTrade(cardId, type = "buy") {
    const key = String(cardId);
    const cur = this.tradeCounts.get(key) || { buy: 0, sell: 0 };
    if (type === "buy") cur.buy = (cur.buy || 0) + 1;
    else cur.sell = (cur.sell || 0) + 1;
    this.tradeCounts.set(key, cur);
  }

  // Compute a simple market index (weighted by trade volume)
  computeMarketIndex(n = 30) {
    const entries = Array.from(this.tradeCounts.entries()).map(([id, counts]) => {
      const card = this.getInventory().find((c) => String(c.id) === String(id));
      const trades = (counts.buy || 0) + (counts.sell || 0);
      const price = card ? this.getDollarValue(card) : 0;
      return { id, trades, price };
    }).filter(e => e.trades > 0);
    if (!entries.length) return 0;
    entries.sort((a, b) => b.trades - a.trades);
    const top = entries.slice(0, n);
    const numerator = top.reduce((s, e) => s + e.price * e.trades, 0);
    const denom = top.reduce((s, e) => s + e.trades, 0) || 1;
    return numerator / denom;
  }

  getMarketMultiplier(card) {
    const key = String(card.id);
    const counts = this.tradeCounts.get(key) || { buy: 0, sell: 0 };
    const net = (counts.buy || 0) - (counts.sell || 0);
    // scale net trades to a sensible multiplier range
    const mult = 1 + Math.max(-0.5, Math.min(2, net / 1000));
    return mult;
  }

  getPrice(card) {
    const dollarValue = this.getDollarValue(card);
    const base = Math.max(1, Math.round(dollarValue * this.goldPerDollar));
    try {
      const m = this.getMarketMultiplier(card);
      return Math.max(1, Math.round(base * m));
    } catch (e) {
      return base;
    }
  }

  formatCurrency(value) {
    return `$${Number(value).toFixed(2)}`;
  }

  buy(profile, cardOrId) {
    const cardId = typeof cardOrId === "object" && cardOrId?.id != null ? String(cardOrId.id) : String(cardOrId);
    const inventory = this.getInventory();
    const card = inventory.find((item) => String(item.id) === cardId);
    if (!card) return false;

    const credit = Math.max(0, profile.marketCredit ?? 0);
    const creditUsed = Math.min(credit, card.price);
    const remainingCost = card.price - creditUsed;

    if ((profile.gold ?? 0) < remainingCost) return false;

    profile.marketCredit = credit - creditUsed;
    profile.gold -= remainingCost;

    const purchased = { ...card };
    delete purchased.displayPrice;
    delete purchased.dollarValue;
    try { this.recordTrade(purchased.id ?? purchased.name, 'buy'); } catch (e) {}
    return {
      card: purchased,
      price: card.price,
      goldUsed: remainingCost,
      creditUsed
    };
  }

  sell(profile, cardOrId) {
    const cardId = typeof cardOrId === "object" && cardOrId?.id != null ? String(cardOrId.id) : String(cardOrId);
    const inventory = this.getInventory();
    const card = inventory.find((item) => String(item.id) === cardId);
    if (!card) return false;

    const price = card.price;
    profile.marketCredit = (profile.marketCredit ?? 0) + price;
    try { this.recordTrade(card.id ?? card.name, 'sell'); } catch (e) {}
    return price;
  }

  buyGold(profile, amount) {
    const minimum = 15;
    if (amount < minimum) return false;
    profile.gold = (profile.gold ?? 0) + amount;
    return amount;
  }

  getGoldPacks() {
    return [
      { amount: 15 },
      { amount: 50 },
      { amount: 100 },
      { amount: 250 },
      { amount: 500 }
    ];
  }

  getGoldCost(amount) {
    return amount / this.goldPerDollar;
  }

  getPackPrice() {
    return 150; // 150 gold = $3.00 at 50 gold per dollar
  }

  getPackDollarCost() {
    return this.getPackPrice() / this.goldPerDollar;
  }

  getPackDisplayPrice() {
    return `${this.getPackPrice()} gold (${this.formatCurrency(this.getPackDollarCost())})`;
  }

  buyPack(profile) {
    const price = this.getPackPrice();
    if ((profile.gold ?? 0) < price) return false;
    profile.gold -= price;
    return this.openPack();
  }
  // seeded RNG (mulberry32) returns function that produces 0..1 floats
  mulberry32(seed) {
    return function() {
      let t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // Prepare scheduled placements of expensive cards across packs
  prepareExpensiveSchedule() {
    const cards = this.cards || [];
    if (!cards.length || this.packsCount <= 0) return;

    const expensive = cards.filter((c) => {
      const rv = String(c.rarity || "").trim().toLowerCase();
      return rv === "ultra" || this.getDollarValue(c) >= this.rarityPrices.ultra;
    });

    if (!expensive.length) return;

    // cap occurrences per expensive card so we don't exceed produced total
    const maxPerCard = Math.max(1, Math.floor(this.totalProduced / expensive.length));
    const perCard = Math.min(this.forcedPerExpensive, maxPerCard);

    // Assign evenly-spaced pack indices for each expensive card
    let offset = 0;
    for (const card of expensive) {
      const step = Math.max(1, Math.floor(this.packsCount / perCard));
      for (let k = 0; k < perCard; k++) {
        let idx = (k * step + offset) % this.packsCount;
        // find next free slot if collision
        while (this.scheduledExpensive.has(idx)) {
          idx = (idx + 1) % this.packsCount;
        }
        this.scheduledExpensive.set(idx, card);
      }
      offset = (offset + 1) % this.packsCount;
    }
  }

  getPackAtIndex(index) {
    const cards = this.cards || [];
    if (!cards.length) return [];
    index = index % this.packsCount;

    const rng = this.mulberry32(this.seed + index);

    const commonPool = cards.filter((c) => String(c.rarity || "").trim().toLowerCase() === "common");
    const uncommonPool = cards.filter((c) => String(c.rarity || "").trim().toLowerCase() === "uncommon");
    const rarePool = cards.filter((c) => {
      const rv = String(c.rarity || "").trim().toLowerCase();
      return rv === "rare" || rv === "epic" || rv === "legendary" || rv === "ultra";
    });

    const choose = (pool) => {
      if (!pool || !pool.length) return null;
      return pool[Math.floor(rng() * pool.length)];
    };

    const slot1 = choose(commonPool) || choose(cards);
    const slot2 = choose(uncommonPool) || choose(cards);

    // If we've scheduled an expensive card for this pack, put it in slot3.
    if (this.scheduledExpensive.has(index)) {
      const scheduled = this.scheduledExpensive.get(index);
      return [slot1, slot2, scheduled].filter(Boolean).map((c) => ({ ...c }));
    }

    // Otherwise, by default produce an uncommon; small chance upgrade to rare/epic
    const rareChance = 0.02; // 2% chance to be a rare-style card
    const epicUpgradeChance = 0.01; // within rare, 1% chance to upgrade to epic+

    if (rng() < rareChance) {
      // choose rare; maybe upgrade
      let pick = choose(rarePool) || choose(uncommonPool) || choose(cards);
      if (rng() < epicUpgradeChance) {
        // try to pick a higher rarity if available
        const higher = rarePool.filter((c) => String(c.rarity || "").trim().toLowerCase() !== "rare");
        pick = choose(higher) || pick;
      }
      return [slot1, slot2, pick].filter(Boolean).map((c) => ({ ...c }));
    }

    const slot3 = choose(uncommonPool) || choose(cards);
    return [slot1, slot2, slot3].filter(Boolean).map((c) => ({ ...c }));
  }

  openPack() {
    if (this.packsCount <= 0) {
      // fallback to random small pack
      const chooseRandom = (items) => {
        if (!items || !items.length) return null;
        return items[Math.floor(Math.random() * items.length)];
      };
      return [chooseRandom(this.cards), chooseRandom(this.cards), chooseRandom(this.cards)].filter(Boolean).map((c) => ({ ...c }));
    }

    if (this.nextPackIndex >= this.packsCount) {
      // no more packs
      return [];
    }

    const pack = this.getPackAtIndex(this.nextPackIndex);
    this.nextPackIndex++;
    return pack;
  }
}
