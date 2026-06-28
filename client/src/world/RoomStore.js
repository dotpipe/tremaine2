export class RoomStore {
  constructor(){ this.rooms = new Map(); }
  key(depth, roomX, roomY){ return `${depth}:${roomX}:${roomY}`; }
  has(depth, roomX, roomY){ return this.rooms.has(this.key(depth,roomX,roomY)); }
  load(depth, roomX, roomY){ return this.rooms.get(this.key(depth,roomX,roomY)); }
  save(depth, roomX, roomY, room){
    this.rooms.set(this.key(depth,roomX,roomY), structuredClone(room));
  }
}
