export class GridMap {
  constructor(w = 13, h = 13) {
    this.w = w;
    this.h = h;
    this.grid = this.createEmpty();
  }

  createEmpty() {
    return Array.from({ length: this.h }, () =>
      Array.from({ length: this.w }, () => 1) // 1 = wall
    );
  }

  generate() {
    this.grid = this.createEmpty();

    // start carving from player spawn
    const start = { x: 1, y: 1 };
    this.carve(start.x, start.y);

    // ensure outer borders are walls
    for (let x = 0; x < this.w; x++) {
      this.grid[0][x] = 1;
      this.grid[this.h - 1][x] = 1;
    }
    for (let y = 0; y < this.h; y++) {
      this.grid[y][0] = 1;
      this.grid[y][this.w - 1] = 1;
    }

    return this.grid;
  }

  carve(x, y) {
    this.grid[y][x] = 0; // 0 = floor

    const dirs = this.shuffle([
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1]
    ]);

    for (const [dx, dy] of dirs) {
      const nx = x + dx * 2;
      const ny = y + dy * 2;

      if (this.inBounds(nx, ny) && this.grid[ny][nx] === 1) {
        this.grid[y + dy][x + dx] = 0;
        this.carve(nx, ny);
      }
    }
  }

  inBounds(x, y) {
    return x > 0 && y > 0 && x < this.w - 1 && y < this.h - 1;
  }

  shuffle(a) {
    return a.sort(() => Math.random() - 0.5);
  }

  isWalkable(x, y) {
    return this.grid?.[y]?.[x] === 0;
  }
}