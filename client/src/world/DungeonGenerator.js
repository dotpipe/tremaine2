export class DungeonGenerator {
  constructor(width = 25, height = 25) {
    this.width = width;
    this.height = height;
  }

  generate(seed = 1) {

    const grid = [];

    for (let y = 0; y < this.height; y++) {
      grid[y] = [];

      for (let x = 0; x < this.width; x++) {
        grid[y][x] = 0;
      }
    }

    // border walls
    for (let x = 0; x < this.width; x++) {
      grid[0][x] = 1;
      grid[this.height - 1][x] = 1;
    }

    for (let y = 0; y < this.height; y++) {
      grid[y][0] = 1;
      grid[y][this.width - 1] = 1;
    }

    // cover formations
    const formations = 18;

    for (let i = 0; i < formations; i++) {

      const cx = 2 + Math.floor(Math.random() * (this.width - 5));
      const cy = 2 + Math.floor(Math.random() * (this.height - 5));

      const w = 2 + Math.floor(Math.random() * 3);
      const h = 2 + Math.floor(Math.random() * 3);

      for (let yy = cy; yy < cy + h; yy++) {
        for (let xx = cx; xx < cx + w; xx++) {
          grid[yy][xx] = 1;
        }
      }
    }

    // guaranteed spawn region
    for (let y = 10; y <= 14; y++) {
      for (let x = 10; x <= 14; x++) {
        grid[y][x] = 0;
      }
    }

    return grid;
  }
}
