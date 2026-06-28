export class RoamingSystem {
  constructor(map) {
    this.map = map;
    this.squads = [];
    this.tick = 0;
  }

  addSquad(squad) {
    this.squads.push({
      ...squad,
      cooldown: 0,
      path: [],
      anchor: { ...squad.pos }
    });
  }

  update(playerPos) {
    this.tick++;

    for (const squad of this.squads) {
      squad.cooldown--;

      // only move every few ticks
      if (squad.cooldown > 0) continue;
      squad.cooldown = 20 + Math.random() * 20;

      const target = this.pickTarget(squad, playerPos);

      squad.path = this.findStep(squad.pos, target);

      if (squad.path) {
        squad.pos = squad.path;
      }
    }
  }

  pickTarget(squad, playerPos) {
    const dx = playerPos.x - squad.pos.x;
    const dy = playerPos.y - squad.pos.y;

    const dist = Math.abs(dx) + Math.abs(dy);

    // aggressive squads chase
    if (dist < 6) return playerPos;

    // otherwise patrol around anchor
    return {
      x: squad.anchor.x + Math.floor(Math.random() * 3 - 1),
      y: squad.anchor.y + Math.floor(Math.random() * 3 - 1)
    };
  }

  findStep(from, to) {
    const dirs = [
      [1,0],[-1,0],[0,1],[0,-1]
    ];

    let best = from;
    let bestDist = Infinity;

    for (const [dx, dy] of dirs) {
      const nx = from.x + dx;
      const ny = from.y + dy;

      if (!this.map.isWalkable(nx, ny)) continue;

      const d = Math.abs(to.x - nx) + Math.abs(to.y - ny);

      if (d < bestDist) {
        bestDist = d;
        best = { x: nx, y: ny };
      }
    }

    return best;
  }
}