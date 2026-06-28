export class RulesEngine {
  constructor(statusSystem) {
    this.queue = [];
    this.logs = [];
    this.statusSystem = statusSystem;
    this.phi = { player: 0, enemy: 0 };
    this.phaseRoll = 0;
    this.phaseBudget = 0;
    this.phase = "attack";
  }

  log(line) {
    this.logs.push(line);
    if (this.logs.length > 30) this.logs.shift();
  }

  rollPhase() {
    this.phaseRoll = 1 + Math.floor(Math.random() * 6);
    this.phaseBudget = this.phaseRoll;
    this.log(`Rolled ${this.phaseRoll} for ${this.phase.toUpperCase()} phase.`);
    return this.phaseRoll;
  }

  canPlay(card, side, battle) {

      if (!battle.active) return false;
      if (this.phaseBudget <= 0) return false;

      if (
          card.type === "Spell" &&
          this.phi[side] < card.cost
      ) {
          return false;
      }

      if (
          card.requirementValues?.length &&
          !card.requirementValues.includes(this.phaseRoll)
      ) {
          return false;
      }

      switch (this.phase) {

          case "attack":
              return (
                  card.type === "Attack" ||
                  card.type === "Spell"
              );

          case "defense":
              return (
                  card.type === "Defense" ||
                  card.type === "Spell"
              );

          default:
              return false;
      }
  }

  playCard(card, side, targetSide, targetIndex, battle) {
    if (!this.canPlay(card, side, battle)) return false;

    this.phaseBudget -= 1;

    if (card.type === "Spell") {
      this.phi[side] -= card.cost;
      this.log(`${side} spends ${card.cost} Phi for ${card.name}.`);
    }

    const action = {
      type: "BASE",
      card,
      side,
      targetSide,
      targetIndex,
      attack: card.attack,
      defense: card.defense,
      special: card.special,
      triggers: card.triggers
    };

    this.queue.push(action);
    this.resolveQueue(battle);
    return true;
  }

  enqueue(action) {
    this.queue.push(action);
  }

  gainPhi(side, amount) {
    this.phi[side] = Math.max(0, this.phi[side] + amount);
    this.log(`${side} gains ${amount} Phi.`);
  }

  resolveQueue(battle) {
    while (this.queue.length) {
      const action = this.queue.shift();
      this.resolveAction(action, battle);
    }
  }

  resolveAction(action, battle) {
    const { card, side, targetSide, targetIndex } = action;

    const target = battle.getUnit(targetSide, targetIndex);
    const selectedIndex = typeof battle.getSelectedIndex === "function" ? battle.getSelectedIndex(side) : battle.getActiveIndex(side);
    const caster = battle.getUnit(side, selectedIndex) || battle.getLeader(side);

    if (action.type !== "BASE") {
      switch (action.type) {
        case "DAMAGE":
          battle.damageUnit(action.targetSide, action.targetIndex, action.amount, action.meta || {});
          break;
        case "HEAL":
          battle.healUnit(action.targetSide, action.targetIndex, action.amount);
          break;
        case "APPLY_STATUS":
          battle.applyStatus(action.targetSide, action.targetIndex, action.status, action.value, action.duration);
          break;
        case "GAIN_PHI":
          this.gainPhi(action.side, action.amount);
          break;
        case "DRAW":
          battle.drawCards(action.side, action.amount);
          break;
      }
      return;
    }

    if (!target) return;

    const baseDamage = card.type === "Attack" ? battle.resolveAttackAmount(side, card.attack, card.name) : 0;
    const baseHeal = card.type === "Defense" ? battle.resolveDefenseAmount(side, card.defense) : 0;

    if (baseDamage > 0) {
      battle.damageUnit(targetSide, targetIndex, baseDamage, { pierce: card.special === "Pierce", sourceSide: side });
    }
    if (baseHeal > 0) {
      battle.healUnit(targetSide, targetIndex, baseHeal);
    }

    this.applySpecial(card, side, targetSide, targetIndex, battle, baseDamage, caster);
    this.applyTriggers(card, side, targetSide, targetIndex, battle, baseDamage, caster);
  }

  applySpecial(card, side, targetSide, targetIndex, battle, baseDamage, caster) {
    const special = String(card.special || "").trim();
    if (!special) return;

    const target = battle.getUnit(targetSide, targetIndex);
    const selectedIndex = typeof battle.getSelectedIndex === "function" ? battle.getSelectedIndex(side) : battle.getActiveIndex(side);
    const casterIndex = battle.getActiveIndex(side);
    const selfIndex = targetSide === side ? targetIndex : selectedIndex;
    const casterUnit = battle.getUnit(side, casterIndex) || battle.getLeader(side);

    const s = special;
    switch (s) {
      case "DrainMana":
        this.enqueue({ type: "GAIN_PHI", side, amount: 2 });
        break;
      case "Lifesteal":
        this.enqueue({ type: "HEAL", targetSide: side, targetIndex: selfIndex, amount: Math.max(1, Math.floor((baseDamage || card.attack || 1) / 2)) });
        break;
      case "Burn":
        this.enqueue({ type: "APPLY_STATUS", targetSide, targetIndex, status: "burn", value: 2, duration: 3 });
        break;
      case "Regen":
        this.enqueue({ type: "APPLY_STATUS", targetSide: side, targetIndex: selfIndex, status: "regen", value: 2, duration: 5 });
        break;
      case "Nullify":
        this.enqueue({ type: "APPLY_STATUS", targetSide, targetIndex, status: "nullify", value: 1, duration: 1 });
        break;
      case "Stun":
        this.enqueue({ type: "APPLY_STATUS", targetSide, targetIndex, status: "stun", value: 1, duration: 1 });
        break;
      case "Shield":
        this.enqueue({ type: "APPLY_STATUS", targetSide: side, targetIndex: selfIndex, status: "shield", value: 10, duration: 2 });
        break;
      case "DoubleHit":
        this.enqueue({ type: "DAMAGE", targetSide, targetIndex, amount: baseDamage || card.attack, meta: { pierce: false } });
        break;
      case "Reflect":
        this.enqueue({ type: "APPLY_STATUS", targetSide: side, targetIndex: selfIndex, status: "reflect", value: 50, duration: 2 });
        break;
      case "Freeze":
        this.enqueue({ type: "APPLY_STATUS", targetSide, targetIndex, status: "freeze", value: 1, duration: 1 });
        break;
      case "Barrier":
        this.enqueue({ type: "APPLY_STATUS", targetSide: side, targetIndex: selfIndex, status: "barrier", value: 20, duration: 2 });
        break;
      case "Pierce":
        battle.markPierce(targetSide, targetIndex, true);
        break;
      case "Splash":
        battle.damageAdjacent(targetSide, targetIndex, Math.max(1, Math.floor((baseDamage || card.attack || 1) / 2)), side);
        break;
      case "Poison":
        this.enqueue({ type: "APPLY_STATUS", targetSide, targetIndex, status: "poison", value: 2, duration: 5 });
        break;
      case "Counterattack":
        this.enqueue({ type: "APPLY_STATUS", targetSide: side, targetIndex: selfIndex, status: "counterattack", value: card.attack || 1, duration: 2 });
        break;
      default:
        break;
    }
  }

  applyTriggers(card, side, targetSide, targetIndex, battle, baseDamage, caster) {
    const triggers = Array.isArray(card.triggers) ? card.triggers : [];
    const selfIndex = targetSide === side ? targetIndex : (typeof battle.getSelectedIndex === "function" ? battle.getSelectedIndex(side) : battle.getActiveIndex(side));
    for (const trig of triggers) {
      switch (Number(trig)) {
        case 1:
          this.enqueue({ type: "GAIN_PHI", side, amount: 1 });
          break;
        case 2:
          this.enqueue({ type: "DRAW", side, amount: 1 });
          break;
        case 3:
          this.enqueue({ type: "DAMAGE", targetSide, targetIndex, amount: 2, meta: { pierce: false } });
          break;
        case 4:
          this.enqueue({ type: "HEAL", targetSide: side, targetIndex: selfIndex, amount: 2 });
          break;
        case 5:
          this.enqueue({ type: "DAMAGE", targetSide, targetIndex, amount: baseDamage || card.attack || 1, meta: { pierce: false } });
          break;
        case 6:
          this.enqueue({ type: "GAIN_PHI", side, amount: 3 });
          break;
      }
    }
  }

  endPhase(side, battle) {
    this.gainPhi(side, this.phaseBudget);
    this.phaseBudget = 0;
    battle.tickStatuses(side);
  }
}
