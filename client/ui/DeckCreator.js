export class DeckCreator {
  constructor(game) {
    this.game = game;
    this.modal = null;
    this.deck = this.game.profile?.deck || { name: 'Starter', cards: [] };
    this.filterField = 'all';
    this.filterText = '';
    this._ensureElements();
  }

  _ensureElements() {
    if (this.modal) return;
    this.modal = document.createElement('div');
    this.modal.className = 'deck-creator-modal';
    this.modal.style.position = 'fixed';
    this.modal.style.left = '50%';
    this.modal.style.top = '50%';
    this.modal.style.transform = 'translate(-50%, -50%)';
    this.modal.style.background = '#222';
    this.modal.style.color = '#fff';
    this.modal.style.padding = '12px';
    this.modal.style.border = '1px solid #666';
    this.modal.style.zIndex = 9999;
    this.modal.style.maxHeight = '80vh';
    this.modal.style.overflow = 'auto';
    this.modal.style.minWidth = '420px';

    const title = document.createElement('h3');
    title.textContent = 'Deck Creator';
    this.modal.appendChild(title);

    this.info = document.createElement('div');
    this.info.style.marginBottom = '8px';
    this.modal.appendChild(this.info);

    const filterRow = document.createElement('div');
    filterRow.style.display = 'flex';
    filterRow.style.flexWrap = 'wrap';
    filterRow.style.alignItems = 'center';
    filterRow.style.gap = '8px';
    filterRow.style.marginBottom = '10px';

    this.filterSelect = document.createElement('select');
    this.filterSelect.style.flex = '1';
    this.filterSelect.style.minWidth = '140px';
    this.filterSelect.addEventListener('change', () => {
      this.filterField = this.filterSelect.value;
      this.render();
    });

    this.getFilterFields().forEach((item) => {
      const option = document.createElement('option');
      option.value = item.key;
      option.textContent = item.label;
      this.filterSelect.appendChild(option);
    });

    this.filterInput = document.createElement('input');
    this.filterInput.type = 'search';
    this.filterInput.placeholder = 'Filter cards...';
    this.filterInput.style.flex = '2';
    this.filterInput.addEventListener('input', () => {
      this.filterText = this.filterInput.value;
      this.render();
    });

    filterRow.appendChild(this.filterSelect);
    filterRow.appendChild(this.filterInput);
    this.modal.appendChild(filterRow);

    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = '12px';

    this.leftCol = document.createElement('div');
    this.leftCol.style.flex = '1';

    this.rightCol = document.createElement('div');
    this.rightCol.style.flex = '1';

    row.appendChild(this.leftCol);
    row.appendChild(this.rightCol);

    this.modal.appendChild(row);

    const footer = document.createElement('div');
    footer.style.marginTop = '12px';

    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'Close';
    close.addEventListener('click', () => this.close());
    footer.appendChild(close);

    const save = document.createElement('button');
    save.type = 'button';
    save.style.marginLeft = '8px';
    save.textContent = 'Save Deck';
    save.addEventListener('click', () => this.saveDeck());
    footer.appendChild(save);

    this.modal.appendChild(footer);

    document.body.appendChild(this.modal);
    this.close();
  }

  open() {
    this.deck = this.game.profile?.deck || { name: 'Starter', cards: [] };
    if (this.filterSelect) this.filterSelect.value = this.filterField;
    if (this.filterInput) this.filterInput.value = this.filterText;
    this.render();
    this.modal.style.display = 'block';
  }

  close() {
    if (!this.modal) return;
    this.modal.style.display = 'none';
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
      { key: 'triggers', label: 'Triggers' },
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
      case 'triggers': return Array.isArray(card.triggers) ? card.triggers.join('|') : String(card.triggers || '');
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

  render() {
    this.leftCol.replaceChildren();
    this.rightCol.replaceChildren();

    this.info.textContent = `Deck: ${this.deck.name} — ${this.deck.cards.length} cards`;

    const side = this.game.sideboard?.cards || [];

    const list = document.createElement('div');
    list.style.display = 'grid';
    list.style.gridTemplateColumns = '1fr';
    list.style.gap = '6px';

    const unique = {};
    for (const c of side) {
      const k = String(c.id);
      unique[k] = unique[k] || { card: c, count: 0 };
      unique[k].count++;
    }

    const keys = Object.keys(unique).filter((key) => this.matchesFilter(unique[key].card));

    for (const key of keys) {
      const entry = unique[key];
      const item = document.createElement('div');
      item.style.display = 'flex';
      item.style.justifyContent = 'space-between';
      item.style.alignItems = 'center';
      item.style.padding = '6px';
      item.style.border = '1px solid #444';

      const left = document.createElement('div');
      left.textContent = `${entry.card.name} (${entry.card.rarity || 'Common'}) x${entry.count}`;

      const right = document.createElement('div');

      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.textContent = 'Add';
      addBtn.addEventListener('click', () => this.addToDeck(entry.card.id));

      right.appendChild(addBtn);
      item.appendChild(left);
      item.appendChild(right);
      list.appendChild(item);
    }

    this.leftCol.appendChild(list);

    // deck view
    const deckView = document.createElement('div');
    deckView.style.display = 'grid';
    deckView.style.gridTemplateColumns = '1fr';
    deckView.style.gap = '6px';

    this.deck.cards.forEach((id, idx) => {
      const c = this.game.sideboard.cards.find(s => String(s.id) === String(id)) || this.game.cardLibrary.cards.find(s => String(s.id) === String(id)) || { name: id };
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.justifyContent = 'space-between';
      row.style.alignItems = 'center';
      row.style.padding = '6px';
      row.style.border = '1px solid #444';

      const left = document.createElement('div');
      left.textContent = `${c.name} (${c.rarity || 'Common'})`;

      const right = document.createElement('div');
      const rem = document.createElement('button');
      rem.type = 'button';
      rem.textContent = 'Remove';
      rem.addEventListener('click', () => this.removeFromDeck(idx));
      right.appendChild(rem);

      row.appendChild(left);
      row.appendChild(right);
      deckView.appendChild(row);
    });

    this.rightCol.appendChild(deckView);
  }

  addToDeck(cardId) {
    // enforce sideboard counts and 10-copy limit
    const copiesInSide = this.game.sideboard.cards.filter(c => String(c.id) === String(cardId)).length;
    const copiesInDeck = this.deck.cards.filter(c => String(c) === String(cardId)).length;
    if (copiesInDeck >= 10) return;
    if (copiesInDeck >= copiesInSide) return; // can't add more than owned
    this.deck.cards.push(cardId);
    this.render();
  }

  removeFromDeck(idx) {
    if (idx < 0 || idx >= this.deck.cards.length) return;
    this.deck.cards.splice(idx, 1);
    this.render();
  }

  saveDeck() {
    this.game.profile.deck = this.deck;
    this.game.saveProfile?.();
    this.close();
  }
}
