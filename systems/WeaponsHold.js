export class WeaponsHold {

  constructor() {

    this.side =
      "atk";

    this.flank =
      0;

    this.items =
      [];
  }

  selectSide(
    side
  ) {

    if (
      side !== "atk" &&
      side !== "def"
    ) {
      return;
    }

    this.side =
      side;
  }

  selectFlank(
    index
  ) {

    this.flank =
      index;
  }

  store(
    item
  ) {

    this.items
      .push(
        item
      );
  }

}