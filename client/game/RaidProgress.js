export class RaidProgress {
  constructor(game) {
    this.game = game;
  }

  completed() {
    const node =
      this.game.campaign?.currentNode?.();

    return (
      node?.raidsCompleted ??
      0
    );
  }

  total() {
    const node =
      this.game.campaign?.currentNode?.();

    return (
      node?.raidCount ??
      3000
    );
  }

  currentRaid() {
    return Math.min(
      this.completed() + 1,
      this.total()
    );
  }

  completeCurrentRaid() {
    const node =
      this.game.campaign?.currentNode?.();

    if (!node) return;

    node.raidsCompleted =
      this.currentRaid();

    this.game.currentRaid =
      this.currentRaid() + 1;

    return this.game.currentRaid;
  }

  activeRaid() {
    const raid =
      this.currentRaid();

    return {
      id: raid,

      roomX:
        (raid * 17) % 50,

      roomY:
        (raid * 31) % 50,

      depth:
        Math.min(
          666,
          Math.floor(
            raid / 5
          ) + 1
        )
    };
  }
}