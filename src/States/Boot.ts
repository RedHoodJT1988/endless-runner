namespace RunGoblinRun {


  export class Boot extends Phaser.State {

    private _userScale: Phaser.Point = new Phaser.Point(1, 1);
    private _gameDims: Phaser.Point = new Phaser.Point();

    // -------------------------------------------------------------------------
    public init(): void {

        this.calcGameDims();

        this.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
        this.scale.setUserScale(this._userScale.x, this._userScale.y);
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        this.scale.setResizeCallback(this.gameResized, this);

        if (!this.game.device.desktop) {
            this.scale.forceOrientation(true, false);
            this.scale.onOrientationChange.add(this.orientationChange, this);
        }
    }

    public preload(): void {
        // font 
        this.load.bitmapFont("Font", "assets/Font.png", "assets/Font.xml");
    }

    // -------------------------------------------------------------------------
    public create(): void {
        this.game.state.start("Preload");
    }

    // -------------------------------------------------------------------------
    private calcGameDims(): void {
        let winWidth = window.innerWidth;
        let winHeight = window.innerHeight;

        // calculate scale y. Size after scale is truncated (scaleY * game height).
        // Add small amount to height so scale is bigger for very small amount and we do not loose
        // 1px line because of number precision
        let scaleY = (winHeight + 0.01) / Global.GAME_HEIGHT;

        // get game width with dividing window width with scale y (we want scale y
        // to be equal to scale x to aviod stretching). Then adjust scale x in the same way as scale y
        let gameWidth = Math.round(winWidth / (winHeight / Global.GAME_HEIGHT));
        let scaleX = (winWidth + 0.01) / gameWidth;

        // save new values
        this._userScale.set(scaleY, scaleX);
        this._gameDims.set(gameWidth, Global.GAME_HEIGHT);
    }

    // -------------------------------------------------------------------------
    public gameResized(scaleManger: Phaser.ScaleManager, bounds: Phaser.Rectangle): void {

        if (!scaleManger.incorrectOrientation) {
            let oldScaleX = this._userScale.x;
            let oldScaleY = this._userScale.y;

            // recalculate game dims
            this.calcGameDims();
            let dims = this._gameDims;
            let scale = this._userScale;

            // any change in game size or in scale?
            if (dims.x !== this.game.width || dims.y !== this.game.height ||
                Math.abs(scale.x - oldScaleX) > 0.001 || Math.abs(scale.y - oldScaleY) > 0.001) {

                // set new game size and new scale parameters
                this.scale.setGameSize(dims.x, dims.y);
                this.scale.setUserScale(scale.x, scale.y);

                // has current state onResize method? If yes call it.
                let currentState: Phaser.State = this.game.state.getCurrentState();
                if (typeof (<any>currentState).onResize === "function") {
                    (<any>currentState).onResize(dims.x, dims.y);
                }
            }
        }
    }

    // -------------------------------------------------------------------------
    public orientationChange(scaleManger: Phaser.ScaleManager, previousOrientation: string, previouslyIncorrect: boolean): void {

        if (scaleManger.isLandscape) {
            this.leaveIncorrectOrientation();
        } else {
            this.enterIncorrectOrientation();
        }
    }

    // -------------------------------------------------------------------------
    public enterIncorrectOrientation(): void {
        // show change orientation image
        document.getElementById("orientation").style.display = "block";

        // if current state has onPause method then call it.
        let currentState: Phaser.State = this.game.state.getCurrentState();
        if (typeof (<any>currentState).onPause === "function") {
            (<any>currentState).onPause();
        }
    }

    // -------------------------------------------------------------------------
    public leaveIncorrectOrientation(): void {
        // hide change orientation image
        document.getElementById("orientation").style.display = "none";

        // if current state has onResume method then call it.
        let currentState: Phaser.State = this.game.state.getCurrentState();
        if (typeof (<any>currentState).onResume === "function") {
            (<any>currentState).onResume();
        }
    }
}
}
