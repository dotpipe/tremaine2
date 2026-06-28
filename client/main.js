import { Game } from "./game/Game.js";

const canvas = document.getElementById("mapCanvas");
const game = new Game(canvas);
await game.init();
game.start();
