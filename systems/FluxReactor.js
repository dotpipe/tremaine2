export class FluxReactor {

  activate(
    profile,
    flank,
    side
  ) {

    const strength =

      side ===
      "atk"

      ?

      flank.atk

      :

      flank.def;

    const phi =
      strength
      *
      2;

    if (
      profile.phi
      <
      phi
    ) {

      return null;
    }

    profile.phi
      -=
      phi;

    return {

      phi,

      flux:
        phi
    };
  }

}