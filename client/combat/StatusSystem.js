export class StatusSystem {
  constructor() {
    this.sides = {
      player: new Map(),
      enemy: new Map()
    };
  }

  getStore(side) {
    return this.sides[side];
  }

  apply(side, unitId, name, value = 1, duration = 1) {
    const store = this.getStore(side);
    const cur = store.get(unitId) || {};
    cur[name] = { value, duration };
    store.set(unitId, cur);
  }

  has(side, unitId, name) {
    const store = this.getStore(side);
    const cur = store.get(unitId);
    return !!cur?.[name];
  }

  get(side, unitId) {
    return this.getStore(side).get(unitId) || {};
  }

  remove(side, unitId, name) {
    const store = this.getStore(side);
    const cur = store.get(unitId);
    if (!cur) return;
    delete cur[name];
    store.set(unitId, cur);
  }

  tick(side, onTick) {
    const store = this.getStore(side);
    for (const [unitId, statuses] of store.entries()) {
      for (const [name, data] of Object.entries(statuses)) {
        onTick?.(unitId, name, data);
        data.duration -= 1;
        if (data.duration <= 0) delete statuses[name];
      }
      store.set(unitId, statuses);
    }
  }
}
