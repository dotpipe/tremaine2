export const TILE = Object.freeze({
  ENTRANCE: 0,
  EXIT: 1,
  WALL: 2,
  FLOOR: 3,
  DOOR: 4
});

export function createTile(type = TILE.FLOOR) {
  return {
    type,
    wall: type === TILE.WALL,
    cave: type === TILE.ENTRANCE ? "up" : type === TILE.EXIT ? "down" : null
  };
}

export function tileLabel(type) {
  switch (type) {
    case TILE.ENTRANCE: return "Entrance";
    case TILE.EXIT: return "Exit";
    case TILE.WALL: return "Wall";
    case TILE.FLOOR: return "Floor";
    case TILE.DOOR: return "Door";
    default: return "Unknown";
  }
}

function toBase64(str) {
  if (typeof btoa === "function") return btoa(str);
  if (typeof Buffer !== "undefined") return Buffer.from(str, "utf8").toString("base64");
  return str;
}

function fromBase64(str) {
  if (typeof atob === "function") return atob(str);
  if (typeof Buffer !== "undefined") return Buffer.from(str, "base64").toString("utf8");
  return str;
}

export function encodeRoom(grid) {
  const raw = grid.map(row => row.map(cell => String(cell?.type ?? TILE.FLOOR)).join("")).join("|");
  return toBase64(raw);
}

export function decodeRoom(encoded) {
  const raw = fromBase64(encoded || "");
  if (!raw) return [];
  return raw.split("|").map(row =>
    row.split("").map(ch => createTile(Number(ch) || TILE.FLOOR))
  );
}
