namespace RunGoblinRun {
  export class Game extends Phaser.Game {

    // -------------------------------------------------------------------------
    public constructor() {
        // init game
        super(Global.GAME_WIDTH, Global.GAME_HEIGHT, Phaser.AUTO, "content");

        // load saved settings
        Preferences.instance.load();

        // states
        this.state.add("Boot", Boot);
        this.state.add("Preload", Preload);
        this.state.add("Play", Play);
        this.state.add("Menu", Menu);

        // start
        this.state.start("Boot");
    }
}
}