export class Arsenal {

  build(
    flank,
    energy
  ) {

    return {

      id:
        crypto
          .randomUUID(),

      atk:
        flank.atk,

      def:
        flank.def,

      energy
    };

  }

}