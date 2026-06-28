export class IsoRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.tileW = 64;
    this.tileH = 32;

    // how tall walls appear
    this.wallHeight = 18;

    this.tilt = (7 * Math.PI) / 180;
  }

  resize() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.floor(rect.width * dpr);
    this.canvas.height = Math.floor(rect.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  project(gridX, gridY, z = 0) {
    const x = (gridX - gridY) * (this.tileW / 2);
    const y = (gridX + gridY) * (this.tileH / 2) * 0.5;

    const skew = Math.tan(this.tilt) * (gridX + gridY) * 2;

    return {
      x,
      y: y + skew - z
    };
  }

  drawTileTop(ctx, x, y, color, stroke = "#96a5b8") {
    const w = this.tileW / 2;
    const h = this.tileH / 2;

    ctx.beginPath();
    ctx.moveTo(x, y - h);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x - w, y);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }

  drawWall(ctx, x, y, height, baseColor = "#3a4a5c") {
    const w = this.tileW / 2;
    const h = this.tileH / 2;

    const topY = y - height;

    // left face
    ctx.beginPath();
    ctx.moveTo(x - w, y);
    ctx.lineTo(x - w, topY);
    ctx.lineTo(x, topY - h);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fillStyle = "#2c3947";
    ctx.fill();

    // right face
    ctx.beginPath();
    ctx.moveTo(x + w, y);
    ctx.lineTo(x + w, topY);
    ctx.lineTo(x, topY - h);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fillStyle = "#1f2a36";
    ctx.fill();

    // top face
    ctx.beginPath();
    ctx.moveTo(x, topY - h);
    ctx.lineTo(x + w, topY);
    ctx.lineTo(x, topY + h);
    ctx.lineTo(x - w, topY);
    ctx.closePath();
    ctx.fillStyle = baseColor;
    ctx.fill();
    ctx.strokeStyle = "#101820";
    ctx.stroke();
  }

  drawCave(ctx, x, y, type, palette) {
    const w = this.tileW / 2;
    const h = this.tileH / 2;
    const color = type === "up" ? palette.caveUp : palette.caveDown;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.shadowBlur = 24;
    ctx.shadowColor = type === "up" ? "#f2c94c" : "#00ffff";

    ctx.beginPath();
    ctx.ellipse(x, y + 1, w * 0.48, h * 0.48, 0, 0, Math.PI * 2);
    ctx.fillStyle = type === "up" ? "rgba(242,201,76,.35)" : "rgba(0,255,255,.25)";
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(x, y + 1, w * 0.34, h * 0.34, 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = type === "up" ? "#7b5b00" : "#f6f8fb";
    ctx.stroke();

    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = type === "up" ? "#7b5b00" : "#f6f8fb";
    ctx.fillText(type === "up" ? "↑" : "↓", x, y + 6);

    ctx.font = "bold 9px Arial";
    ctx.fillStyle = type === "up" ? "#7b5b00" : "#9efcff";
    ctx.fillText(type === "up" ? "ENTRANCE" : "EXIT", x, y + 28);

    ctx.restore();
  }

  drawGrid(ctx, grid, centerX, centerY, palette) {
    const rows = grid.length;
    const cols = grid[0]?.length || 0;

    const cells = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) cells.push({ x, y });
    }

    // draw back to front
    cells.sort((a, b) => (a.x + a.y) - (b.x + b.y));

    for (const c of cells) {
      const tile = grid[c.y][c.x];
      const p = this.project(c.x, c.y, 0);
      const screenX = centerX + p.x;
      const screenY = centerY + p.y;

      const type = tile?.type ?? (tile?.wall ? 2 : 3);

      if (type === 2) {
        this.drawWall(ctx, screenX, screenY, this.wallHeight, palette.wall);
        continue;
      }

      this.drawTileTop(ctx, screenX, screenY, type === 3 ? palette.floor : "#d9e4ef", palette.stroke);

      if (type === 0 || type === 1) {
        this.drawCave(ctx, screenX, screenY, tile.cave || (type === 0 ? "up" : "down"), palette);
      } else if (type === 4) {
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = "#e2b64b";
        ctx.strokeStyle = "#8d6c1c";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.rect(screenX - 9, screenY - 11, 18, 22);
        ctx.stroke();
        ctx.fillStyle = "rgba(226,182,75,.25)";
        ctx.fill();
        ctx.restore();
      }
    }
  }

  drawEntity(ctx, gridX, gridY, centerX, centerY, color, label = "") {
    const p = this.project(gridX, gridY, 0);

    const x = centerX + p.x;
    const y = centerY + p.y - 10;

    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    if (label) {
      ctx.font = "bold 11px Arial";
      ctx.fillStyle = "#102033";
      ctx.fillText(label, x + 12, y + 4);
    }
  }
}
