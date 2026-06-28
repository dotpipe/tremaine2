import { TILE, createTile } from "./TileCodec.js";
import { buildRaidCounts, buildRaidLedger } from "../../world/RaidLedger.js";

export class CampaignMap {
  constructor(width = 24, height = 24, maxDepth = 666, totalRaids = 3000) {
    this.width = width;
    this.height = height;
    this.maxDepth = maxDepth;
    this.totalRaids = totalRaids;
    this.nodes = [];
    this.currentIndex = 0;
    this.generateCampaign();
  }

  mulberry32(seed) {
    let t = seed >>> 0;
    return function () {
      t += 0x6D2B79F5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  generateCampaign() {
    const raidCounts = buildRaidCounts(this.maxDepth, this.totalRaids);
    this.nodes = [];

    for (let i = 0; i < this.maxDepth; i++) {
      const depth = i + 1;
      this.nodes.push({
        id: i,
        depth,
        name: `Depth ${depth}`,
        grid: this.generateGrid(depth),
        enemies: [],
        raidCount: raidCounts[i],
        raids: buildRaidLedger(depth, raidCounts[i]),
        raidsCompleted: 0,
        cleared: false
      });
    }

    this.linkCaves();
  }

  currentNode() {
    return this.nodes[this.currentIndex];
  }

  nextNode() {
    if (this.currentIndex < this.nodes.length - 1) this.currentIndex++;
    return this.currentNode();
  }

  previousNode() {
    if (this.currentIndex > 0) this.currentIndex--;
    return this.currentNode();
  }

  generateGrid(depthSeed = 1) {
const rng=this.mulberry32(depthSeed*9176+123);
const grid=[];
for(let y=0;y<this.height;y++){
 const row=[];
 for(let x=0;x<this.width;x++){
   row.push(createTile(TILE.FLOOR));
 }
 grid.push(row);
}
for(let x=0;x<this.width;x++){grid[0][x]=createTile(TILE.WALL);grid[this.height-1][x]=createTile(TILE.WALL);}
for(let y=0;y<this.height;y++){grid[y][0]=createTile(TILE.WALL);grid[y][this.width-1]=createTile(TILE.WALL);}
for(let i=0;i<28;i++){
 let cx=2+Math.floor(rng()*(this.width-4));
 let cy=2+Math.floor(rng()*(this.height-4));
 grid[cy][cx]=createTile(TILE.WALL);
}
const openings=[
[Math.floor(this.height/2),0],
[Math.floor(this.height/2),this.width-1],
[0,Math.floor(this.width/2)],
[this.height-1,Math.floor(this.width/2)]
];
for(const [y,x] of openings){grid[y][x]=createTile(TILE.DOOR);}
this.clearZone(grid,2,2,4);
return grid;
}

  clearZone(grid, sx, sy, size) {
    for (let y = sy; y < sy + size; y++) {
      for (let x = sx; x < sx + size; x++) {
        if (grid[y]?.[x]) grid[y][x] = createTile(TILE.FLOOR);
      }
    }
  }

  findOpenTileNear(grid, startX, startY) {
    for (let radius = 0; radius < Math.max(this.width, this.height); radius++) {
      for (let y = Math.max(1, startY - radius); y < Math.min(this.height - 1, startY + radius + 1); y++) {
        for (let x = Math.max(1, startX - radius); x < Math.min(this.width - 1, startX + radius + 1); x++) {
          const tile = grid[y]?.[x];
          if (tile && !tile.wall) return { x, y };
        }
      }
    }
    return { x: startX, y: startY };
  }

  placeTile(grid, type, preferredX, preferredY, cave = null) {
    const pos = this.findOpenTileNear(grid, preferredX, preferredY);
    grid[pos.y][pos.x] = createTile(type);
    if (cave) grid[pos.y][pos.x].cave = cave;
    return pos;
  }

  linkCaves() {
    for (let i = 0; i < this.nodes.length; i++) {
      const grid = this.nodes[i].grid;

      // surface marker
      this.placeTile(grid, TILE.ENTRANCE, 2, 2, "up");

      // only if there is a deeper node
      if (i < this.nodes.length - 1) {
        this.placeTile(grid, TILE.EXIT, this.width - 4, this.height - 4, "down");
      }

      // back entrance from deeper node
      if (i > 0) {
        this.placeTile(grid, TILE.ENTRANCE, 3, 3, "up");
      }
    }
  }
}
