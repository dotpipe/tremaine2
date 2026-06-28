export class Input {
  constructor() {
    this.down = new Set();
    this.pressed = new Set();
    window.addEventListener("keydown", (e) => {
      const k = e.key.toLowerCase();
      if (!this.down.has(k)) this.pressed.add(k);
      this.down.add(k);
    });
    window.addEventListener("keyup", (e) => {
      const k = e.key.toLowerCase();
      this.down.delete(k);
    });
  }
  isDown(key) { return this.down.has(key.toLowerCase()); }
  consumePressed(key) {
    const k = key.toLowerCase();
    const had = this.pressed.has(k);
    this.pressed.delete(k);
    return had;
  }
  clearPressed() { this.pressed.clear(); }
}
