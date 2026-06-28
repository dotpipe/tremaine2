export class BottomBar {

  constructor(game) {


    this.game = game;

    this.left =
      document.getElementById(
        "leftButtons"
      );

    this.right =
      document.getElementById(
        "rightButtons"
      );

    this.actions = {};
    const mk = (label, action) => {

      const b =
        document.createElement(
          "button"
        );

      b.type =
        "button";

      b.className =
        "action";

      b.textContent =
        label;

      b.onclick =
        () => {

          console.log(
            "BOTTOM:",
            action
          );

          if (
            typeof this.game
              ?.onBottomAction
            ===
            "function"
          ) {

            this.game
              .onBottomAction(
                action
              );

          } else {

            console.warn(
              "Missing onBottomAction"
            );
          }
        };

      return b;
    };

  }



  setActions(actions = {}) {


    const same =
      JSON.stringify(
        actions
      ) ===
      JSON.stringify(
        this.actions
      );

    if (
      same
    ) {
      return;
    }

    this.actions =
      actions;

    this.render();


  }

  makeButton(
    label,
    action
  ) {


    const btn =
      document.createElement(
        "button"
      );

    btn.type =
      "button";

    btn.className =
      "action";

    btn.textContent =
      label;

    btn.onclick =
      (e) => {

        e.preventDefault();

        e.stopPropagation();

        this.game
          ?.onBottomAction
          ?.(
            action
          );
      };

    return btn;


  }

  render() {


    if (
      !this.left ||
      !this.right
    ) {
      return;
    }

    this.left.replaceChildren();

    this.right.replaceChildren();

    const left =
      this.actions.left ||
      [];

    const right =
      this.actions.right ||
      [];

    for (
      const [
        label,
        action
      ]
      of left
    ) {

      this.left
        .appendChild(
          this.makeButton(
            label,
            action
          )
        );
    }

    for (
      const [
        label,
        action
      ]
      of right
    ) {

      this.right
        .appendChild(
          this.makeButton(
            label,
            action
          )
        );
    }


  }
}
