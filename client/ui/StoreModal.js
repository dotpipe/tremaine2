export class StoreModal {
  constructor(game) {
    this.game = game;
    this.filterField = 'all';
    this.filterText = '';
    this.modal = document.getElementById("storeModal");
    this.cardGrid = document.getElementById("storeCardGrid");
    this.goldDisplay = document.getElementById("storeGold");
    this.messageDisplay = document.getElementById("storeMessage");
    this.closeButton = document.getElementById("storeClose");

    if (this.closeButton) {
      this.closeButton.addEventListener("click", () => this.close());
    }
  }

  open() {
    this.render();
    this.modal?.classList.add("show");
  }

  getFilterFields() {
    return [
      { key: 'all', label: 'All Fields' },
      { key: 'name', label: 'Name' },
      { key: 'type', label: 'Type' },
      { key: 'rarity', label: 'Rarity' },
      { key: 'cost', label: 'Cost' },
      { key: 'attack', label: 'Attack' },
      { key: 'defense', label: 'Defense' },
      { key: 'special', label: 'Special' },
      { key: 'duration', label: 'Duration' },
      { key: 'play_requirement', label: 'Play Requirement' },
      { key: 'guild', label: 'Guild' },
      { key: 'description', label: 'Description' }
    ];
  }

  filterValueOf(card, field) {
    const raw = card.raw || {};
    switch (field) {
      case 'name': return String(card.name || '');
      case 'type': return String(card.type || '');
      case 'rarity': return String(card.rarity || '');
      case 'cost': return String(card.cost ?? '');
      case 'attack': return String(card.attack ?? '');
      case 'defense': return String(card.defense ?? '');
      case 'special': return String(card.special || '');
      case 'duration': return String(card.duration || '');
      case 'play_requirement': return String(card.play_requirement || '');
      case 'guild': {
        const match = String(card.description || raw.description || '').match(/Guild:([^.,]+)/i);
        return match ? match[1].trim() : '';
      }
      case 'description': return String(card.description || raw.description || '');
      default:
        return [
          card.name,
          card.type,
          card.rarity,
          card.special,
          card.duration,
          card.play_requirement,
          card.description,
          raw.guild
        ].filter(Boolean).join(' ');
    }
  }

  matchesFilter(card) {
    const query = String(this.filterText || '').trim().toLowerCase();
    if (!query) return true;
    const field = String(this.filterField || 'all');
    if (field === 'all') {
      return this.getFilterFields().some((f) => {
        if (f.key === 'all') return false;
        return String(this.filterValueOf(card, f.key)).toLowerCase().includes(query);
      });
    }
    return String(this.filterValueOf(card, field)).toLowerCase().includes(query);
  }

  adjustCardHeight(item, card) {
    const textBlocks = [
      String(card.name || ''),
      String(card.type || ''),
      String(card.rarity || ''),
      String(card.description || ''),
      String(card.special || ''),
      String(card.play_requirement || ''),
    ].filter(Boolean);
    const approxCharsPerLine = 28;
    const rows = textBlocks.reduce((sum, text) => sum + Math.ceil(text.length / approxCharsPerLine), 0);
    const minHeight = 140;
    const computedHeight = 70 + rows * 18;
    item.style.minHeight = `${Math.max(minHeight, computedHeight)}px`;
  }

  close() {
    this.modal?.classList.remove("show");
  }

  render() {
    if (!this.modal || !this.cardGrid || !this.goldDisplay) return;

    const profile = this.game.profile || {};
    const inventory = this.game.store?.getInventory() || [];
    const goldPacks = this.game.store?.getGoldPacks() || [];
    const sellable = this.game.sideboard?.cards || [];

    this.goldDisplay.textContent = `Gold: ${profile.gold ?? 0} | Credit: ${profile.marketCredit ?? 0}`;
    if (this.messageDisplay) {
      this.messageDisplay.textContent = "Choose a card, sell a card, buy gold, or open a pack.";
    }

    this.cardGrid.replaceChildren();

    const filterRow = document.createElement("div");
    filterRow.style.display = "flex";
    filterRow.style.flexWrap = "wrap";
    filterRow.style.gap = "8px";
    filterRow.style.marginBottom = "12px";

    const filterSelect = document.createElement("select");
    filterSelect.style.flex = "1";
    filterSelect.style.minWidth = "140px";
    this.getFilterFields().forEach((item) => {
      const option = document.createElement("option");
      option.value = item.key;
      option.textContent = item.label;
      filterSelect.appendChild(option);
    });
    filterSelect.value = this.filterField;
    filterSelect.addEventListener("change", () => {
      this.filterField = filterSelect.value;
      this.render();
    });

    const filterInput = document.createElement("input");
    filterInput.type = "search";
    filterInput.placeholder = "Filter cards...";
    filterInput.style.flex = "2";
    filterInput.value = this.filterText;
    filterInput.addEventListener("input", () => {
      this.filterText = filterInput.value;
      this.render();
    });

    filterRow.appendChild(filterSelect);
    filterRow.appendChild(filterInput);
    this.cardGrid.appendChild(filterRow);

    const packItem = document.createElement("div");
    packItem.className = "store-card";

    const packTitle = document.createElement("div");
    packTitle.className = "store-card-title";
    packTitle.textContent = "3-Card Pack";

    const packInfo = document.createElement("div");
    packInfo.className = "store-card-info";
    packInfo.innerHTML = `
        <span>1 common + 1 uncommon + 1 uncommon/rare</span>
        <span>${this.game.store.getPackDisplayPrice()}</span>
      `;

    const packButton = document.createElement("button");
    packButton.type = "button";
    packButton.className = "action attack";
    packButton.textContent = `Open Pack (${this.game.store.getPackDisplayPrice()})`;
    packButton.disabled = (profile.gold ?? 0) < this.game.store.getPackPrice();
    packButton.addEventListener("click", () => this.handleBuyPack());

    packItem.append(packTitle, packInfo, packButton);
    this.adjustCardHeight(packItem, {
      name: '3-Card Pack',
      type: 'Pack',
      rarity: '',
      description: '1 common + 1 uncommon + 1 uncommon/rare',
      special: '',
      play_requirement: ''
    });
    this.cardGrid.appendChild(packItem);

    if (sellable.length) {
      const sellHeader = document.createElement("div");
      sellHeader.className = "store-card-title";
      sellHeader.textContent = "Market Sell";
      this.cardGrid.appendChild(sellHeader);

      sellable.forEach((card) => {
        const item = document.createElement("div");
        item.className = "store-card";

        const title = document.createElement("div");
        title.className = "store-card-title";
        title.textContent = `${card.name} (${card.rarity || "Common"})`;

        const info = document.createElement("div");
        info.className = "store-card-info";
        info.innerHTML = `
          <span>${card.type}</span>
          <span>Sell for ${this.game.store.getPrice(card)} credit</span>
        `;

        const button = document.createElement("button");
        button.type = "button";
        button.className = "action attack";
        button.textContent = `Sell`;
        button.addEventListener("click", () => this.handleSell(card.id));

        item.append(title, info, button);
        this.adjustCardHeight(item, card);
        this.cardGrid.appendChild(item);
      });
    }

    const goldHeader = document.createElement("div");
    goldHeader.className = "store-card-title";
    goldHeader.textContent = "Gold Packs";
    this.cardGrid.appendChild(goldHeader);

    const goldPackRow = document.createElement("div");
    goldPackRow.className = "store-card-info";
    goldPackRow.style.gridTemplateColumns = "repeat(auto-fit, minmax(140px, 1fr))";
    goldPackRow.style.marginBottom = "12px";

    goldPacks.forEach((pack) => {
      const packButton = document.createElement("button");
      packButton.type = "button";
      packButton.className = "action attack";
      packButton.textContent = `Buy ${pack.amount} gold ($${this.game.store.getGoldCost(pack.amount).toFixed(2)})`;
      packButton.addEventListener("click", () => this.handleBuyGold(pack.amount));
      goldPackRow.appendChild(packButton);
    });

    this.cardGrid.appendChild(goldPackRow);

    inventory.filter((card) => this.matchesFilter(card)).forEach((card) => {
      const item = document.createElement("div");
      item.className = "store-card";

      const title = document.createElement("div");
      title.className = "store-card-title";
      title.textContent = `${card.name} (${card.rarity || "Common"})`;
      title.style.cursor = "pointer";
      title.title = "Click to market-scan this card";
      title.addEventListener("click", () => {
        try { this.game.store.recordSearch(card.id); } catch (e) {}
        this.game.hud?.render?.();
      });

      const info = document.createElement("div");
      info.className = "store-card-info";
      info.innerHTML = `
        <span>${card.type}</span>
        <span>ATK ${card.attack}</span>
        <span>DEF ${card.defense}</span>
        <span>${card.displayPrice}</span>
      `;

      const desc = document.createElement("div");
      desc.className = "store-card-description";
      desc.textContent = card.description || "No description.";

      const button = document.createElement("button");
      button.type = "button";
      button.className = "action attack";
      button.textContent = `Buy ${card.price} gold`;
      button.disabled = ((profile.gold ?? 0) + (profile.marketCredit ?? 0)) < card.price;
      button.addEventListener("click", () => this.handleBuy(card.id));

      item.append(title, info, desc, button);
      this.adjustCardHeight(item, card);
      this.cardGrid.appendChild(item);
    });
  }

  handleBuy(cardId) {
    const card = this.game.store?.getInventory()?.find((item) => String(item.id) === String(cardId));
    if (!card) return;

    const purchased = this.game.buyCard(card);
    if (!purchased || purchased.error) {
      if (this.messageDisplay) {
        this.messageDisplay.textContent = purchased?.error || "Not enough gold to purchase that card.";
      }
      return;
    }

    if (this.messageDisplay) {
      this.messageDisplay.textContent = `${purchased.result.name || purchased.name} purchased!`;
    }
    this.render();
    this.game.hud?.render?.();
    this.game.saveProfile?.();
  }

  handleBuyGold(amount) {
    const result = this.game.store?.buyGold(this.game.profile, amount);
    if (!result) {
      if (this.messageDisplay) {
        this.messageDisplay.textContent = "Minimum purchase is 15 gold.";
      }
      return;
    }

    if (this.messageDisplay) {
      this.messageDisplay.textContent = `Added ${amount} gold to your balance.`;
    }
    this.render();
    this.game.hud?.render?.();
    this.game.saveProfile?.();
  }

  handleSell(cardId) {
    const sale = this.game.sellCard(cardId);
    if (!sale || sale.error) {
      if (this.messageDisplay) {
        this.messageDisplay.textContent = sale?.error || "Unable to sell that card.";
      }
      return;
    }

    if (this.messageDisplay) {
      this.messageDisplay.textContent = `Sold card for ${sale.result} market credit.`;
    }
    this.render();
    this.game.hud?.render?.();
    this.game.saveProfile?.();
  }

  handleBuyPack() {
    const purchase = this.game.buyPack();
    if (!purchase || purchase.error) {
      if (this.messageDisplay) {
        this.messageDisplay.textContent = purchase?.error || "Unable to open pack.";
      }
      return;
    }

    const names = purchase.result.map((card) => card.name || card.id).join(", ");
    if (this.messageDisplay) {
      this.messageDisplay.textContent = `Pack opened: ${names}`;
    }
    this.render();
    this.game.hud?.render?.();
    this.game.saveProfile?.();
  }
}
