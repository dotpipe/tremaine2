export class HandTray {
  constructor(game) {
    this.game = game;
    this.el = document.getElementById("cardList");
    this.meta = document.getElementById("handMeta");
    this.turnMeta = document.getElementById("turnMeta");
    this.lastSignature = "";
  }

  render() {
    const battle = this.game.battle;
    const hand = battle?.deck?.hand || [];
    const active = battle?.active && this.game.mode === "combat";
    const canDiscard = active && battle?.owner === "player" && battle?.discardMode;
    const signature = JSON.stringify({
      active,
      owner: battle?.owner,
      phase: battle?.phase,
      roll: battle?.phaseRoll,
      budget: battle?.phaseBudget,
      discardMode: battle?.discardMode,
      phi: battle?.rules?.phi?.player,
      hand: hand.slice(0, 6).map(card => card?.id)
    });

    if (signature === this.lastSignature) return;
    this.lastSignature = signature;

    this.meta.textContent = active
      ? `Hand ${hand.length}/6 | ${battle.discardMode ? "DISCARD" : battle.phaseLabel()}`
      : "No battle active";
    this.turnMeta.textContent = active
      ? `${battle.owner.toUpperCase()} / ${battle.phase.toUpperCase()}`
      : "Explore";

    this.el.innerHTML = "";
    hand.slice(0, 6).forEach((card, index) => {
      const btn = document.createElement("button");
      btn.className = `card ${card.type.toLowerCase()} ${(card.rarity || "common").toLowerCase()}`;
      btn.disabled = !active || (!canDiscard && !battle.canPlayCard(card));
      btn.innerHTML = `
        <div class="rarity">${card.rarity || "Common"}</div>
        <div class="name">${card.name}</div>
        <div class="stats"><span>${card.type}</span><span>${card.cost > 0 && card.type === "Spell" ? `Φ${card.cost}` : ""}</span></div>
        <div class="meta">ATK ${card.attack} / DEF ${card.defense}</div>
        <div class="special">${card.special || "—"}</div>
      `;
      btn.addEventListener("click", () => this.game.playCard(index));
      this.el.appendChild(btn);
    });

    while (this.el.children.length < 6) {
      const empty = document.createElement("div");
      empty.className = "card disabled";
      empty.innerHTML = `
        <div class="rarity">Empty</div>
        <div class="name">No card</div>
        <div class="meta">Draw more after play or phase</div>
      `;
      this.el.appendChild(empty);
    }
  }
}
