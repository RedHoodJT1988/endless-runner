namespace RunGoblinRun {

    export class ScoreUI extends Phaser.Group {

        private _icon: Phaser.Sprite;
        private _text: Phaser.BitmapText;

        private _tween: Phaser.Tween;

        // -------------------------------------------------------------------------
        public constructor(game: Phaser.Game, parent: PIXI.DisplayObjectContainer) {
            super(game, parent);

            // icon
            this._icon = new Phaser.Sprite(game, 0, 0, "Sprites", "GoldUI");
            this._icon.anchor.set(0.5, 0.5);
            this.add(this._icon);

            // text
            this._text = new Phaser.BitmapText(game, this._icon.width / 2 * 1.2, 0,
                "Font", "0", 40, "left");
            this._text.anchor.y = 0.5;
            this.add(this._text);

            // tween
            this._tween = game.add.tween(this._icon.scale).
                to({ x: 1.2, y: 1.2 }, 100,
                function (k: number) {
                    return Math.sin(Math.PI * k);
                }, false, 0);
        }

        // -------------------------------------------------------------------------
        public set score(score: number) {
            this._text.text = "" + score;
        }

        // -------------------------------------------------------------------------
        public bounce(): void {
            if (!this._tween.isRunning) {
                this._tween.start();
            }
        }
    }
}