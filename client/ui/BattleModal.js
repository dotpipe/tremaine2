export class BattleModal {
  constructor(game) {
    this.game = game;

    this.el = document.getElementById("battleModal");
    this.playerSquad = document.getElementById("playerSquad");
    this.enemySquad = document.getElementById("enemySquad");
    this.logEl = document.getElementById("battleLog");

    this.ownerTag = document.getElementById("battleOwnerTag");
    this.phiTag = document.getElementById("battlePhiTag");
    this.budgetTag = document.getElementById("battleBudgetTag");

    this.phaseText = document.getElementById("battlePhaseText");
    this.playerPhaseText = document.getElementById("playerPhaseText");
    this.enemyPhaseText = document.getElementById("enemyPhaseText");
  }

  show() {
    this.el.classList.add("show");
  }

  hide() {
    this.el.classList.remove("show");
  }

  render(snapshot = {}) {
    if (!snapshot?.active) {
      this.hide();
      return;
    }

    this.show();

    // IMPORTANT FIX: guard missing arrays
    const players = snapshot.playerSquad || [];
    const enemies = snapshot.enemySquad || [];
    const log = snapshot.log || [];

    this.ownerTag.textContent =
      `${snapshot.owner ?? "?"} ${(snapshot.phase ?? "").toUpperCase()}`;

    this.phiTag.textContent = `Phi ${snapshot.phi ?? 0}`;
    this.budgetTag.textContent = `Roll ${snapshot.roll ?? 0}`;

    this.phaseText.textContent = snapshot.phaseText ?? "";
    this.playerPhaseText.textContent = snapshot.playerPhaseText ?? "";
    this.enemyPhaseText.textContent = snapshot.enemyPhaseText ?? "";

    const mkUnit = (u, side) => `
      <div class="unit ${side} ${u.hp <= 0 ? "dead" : ""}">
        <div>
          <strong>${u.name ?? "Unit"}</strong>
          <small>HP ${u.hp ?? 0} • ATK ${u.atk ?? 0} • DEF ${u.def ?? 0}</small>
          <small>${u.statusText ?? "Ready"}</small>
        </div>
        <div class="tag ${side}">
          ${u.hp <= 0 ? "Down" : (u.selected ? "Selected" : "Live")}
        </div>
      </div>
    `;

    this.playerSquad.innerHTML = players.map(u => mkUnit(u, "player")).join("");
    this.enemySquad.innerHTML = enemies.map(u => mkUnit(u, "enemy")).join("");

    this.logEl.innerHTML = log.map(l => `<div class="line">${l}</div>`).join("");
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }
}