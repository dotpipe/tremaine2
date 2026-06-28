export class FoundryCard {

  static fromWeapon(
    weapon
  ) {

    return {

      id:
        weapon.id,

      type:
        "foundry",

      title:
        weapon.name,

      atk:
        weapon.atk,

      def:
        weapon.def,

      energy:
        weapon.energy,

      text:

`Deploy
ATK +${weapon.atk}
DEF +${weapon.def}`,

      play(
        battle
      ) {

        const flank =

          battle
          .selectedFlank

          ??

          0;

        const unit =

          battle
          .playerSquad[
            flank
          ];

        if (
          !unit
        ) {
          return;
        }

        unit.atk +=
          weapon.atk;

        unit.def +=
          weapon.def;
      }
    };
  }

}