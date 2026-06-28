// append inside existing HUD render only
const depth = game?.state?.player?.depth ?? 0;
const roomX = game?.state?.player?.roomX ?? 25;
const roomY = game?.state?.player?.roomY ?? 25;
const roomText = `Depth ${depth} • Room (${roomX}, ${roomY})`;
// add roomText into existing HUD content; do not replace canvas
