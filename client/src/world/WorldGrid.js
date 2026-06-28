export class WorldGrid {
  constructor(w = 40, h = 40) {
    this.w = w;
    this.h = h;
    this.tiles = this.generate();
  }

  generate() {
    const g = [];
    for (let y = 0; y < this.h; y++) {
      const row = [];
      for (let x = 0; x < this.w; x++) {
        row.push({
          x, y,
          wall: Math.random() < 0.12,
          cost: 1
        });
      }
      g.push(row);
    }

    // ensure spawn safe zone
    g[2][2].wall = false;
    g[3][2].wall = false;
    g[2][3].wall = false;

    return g;
  }

  isWalkable(x, y) {
    if (!this.tiles[y] || !this.tiles[y][x]) return false;
    return !this.tiles[y][x].wall;
  }
}