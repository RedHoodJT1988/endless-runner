namespace RunGoblinRun {
  export class Record extends Phaser.Group {

    // -------------------------------------------------------------------------
    public constructor(game: Phaser.Game, parent: PIXI.DisplayObjectContainer, record: number) {
        super(game, parent);

        // position in pixels in world
        let x = record * 64;

        // dashed line
        let line = new Phaser.Sprite(game, x, 0, "Sprites", "Record");
        line.anchor.x = 0.5;
        this.add(line);

        // number
        let num = new Phaser.BitmapText(game, x, game.height - 15, "Font", "" + record, 40, "center");
        num.anchor.set(0.5, 1);
        this.add(num);
    }
}
}