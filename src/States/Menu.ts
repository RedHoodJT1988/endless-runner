namespace RunGoblinRun {

  export class Menu extends Phaser.State {

    private static GROUND_HEIGHT = 250;
    private static GROUND_CP_Y = 50;

    private static GOBLIN_Y = Menu.GROUND_CP_Y - 10;
    private static GOBLIN_SPEED = 200;

    private static BG_SPEED_X = 10;

    private static SOUND_BUTTON_OFFSET = 50;


    private _ground: Phaser.Sprite;
    private _treesBg: Phaser.TileSprite;
    private _sound: Phaser.Button;

    private _goblin: Spriter.SpriterGroup;
    private _runDirection: number;

    // -------------------------------------------------------------------------
    public create() {

        // light green color for background
        this.stage.backgroundColor = 0x03CABF;

        // setup camera and world bounds
        this.setView(this.game.width, this.game.height);

        // trees bg
        let treesHeight = this.cache.getImage("TreesBg").height;
        this._treesBg = this.add.tileSprite(0, -this.game.height / 2, this.game.width, treesHeight, "TreesBg");
        this._treesBg.anchor.x = 0.5;

        // ground sprite
        this._ground = this.game.add.sprite(0, this.game.height / 2, this.generateGround());
        this._ground.anchor.set(0.5, 1);


        // objects on menu screen
        this.createGoblin();
        this.createTitle();
        this.createStartButton();

        // sound button
        this.createSoundButton();

        // set sound and start music
        this.sound.mute = !Preferences.instance.sound;
        Sounds.musicMenu.play();
    }

    // -------------------------------------------------------------------------
    private setView(width: number, height: number): void {

        // set bounds
        this.world.setBounds(-width / 2, -height / 2, width / 2, height / 2);

        // focus on game center
        this.camera.focusOnXY(0, 0);
    }

    // -------------------------------------------------------------------------
    private generateGround(): PIXI.RenderTexture {

        let g = new Phaser.Graphics(this.game);

        // fill color
        g.beginFill(0x2B4940);

        // draw a shape
        g.moveTo(0, 0);
        g.quadraticCurveTo(this.game.width / 2, Menu.GROUND_CP_Y, this.game.width, 0);
        g.lineTo(this.game.width, Menu.GROUND_HEIGHT);
        g.lineTo(0, Menu.GROUND_HEIGHT);
        g.endFill();

        // generate texture from ggraphics
        let texture = g.generateTexture();

        // we do not need graphics anymore
        g.destroy();

        return texture;
    }

    // -------------------------------------------------------------------------
    private createGoblin(): void {
        // random direction
        this._runDirection = this.rnd.sign();

        // create Spriter loader - class that can change Spriter file into internal structure
        let spriterLoader = new Spriter.Loader();
        let spriterFile = new Spriter.SpriterXml(this.cache.getXML("GoblinAnim"));
        let spriterData = spriterLoader.load(spriterFile);

        this._goblin = new Spriter.SpriterGroup(this.game, spriterData, "Sprites", "Goblin", "run", 100);
        this._goblin.scale.x = this._runDirection;

        // set position size
        this._goblin.position.set((this.game.width / 2 + 200) * this._runDirection, Menu.GOBLIN_Y);

        // adds SpriterGroup to Phaser.World to appear on screen
        this.world.add(this._goblin);
    }

    // -------------------------------------------------------------------------
    private createTitle(): void {
        // title
        let title = this.add.sprite(0, -40, "Sprites", "Logo");
        title.anchor.set(0.5, 0.5);

        // title tweens
        this.add.tween(title).to({ angle: 3 }, 2500, function (k: number) {
            return Math.sin(k * 2 * Math.PI);
        }, true, 0, -1);
        this.add.tween(title.scale).to({ x: 1.02, y: 1.02 }, 1250, function (k: number) {
            return Math.sin(k * 2 * Math.PI);
        }, true, 0, -1);
    }

    // -------------------------------------------------------------------------
    private createStartButton(): void {
        // start button
        let start = this.add.button(0, 220, "Sprites", function () {
            this.game.state.start("Play");
        }, this, "Start", "Start", "Start", "Start");

        start.anchor.set(0.5, 0.5);

        // input down callback
        start.onInputDown.add(function () {
            start.scale.set(0.9, 0.9);
            Sounds.sfx.play("select");
        }, this);

        // start button tween
        this.add.tween(start.scale).to({ x: 1.2, y: 0.9 }, 750, function (k: number) {
            let period = k * 3;
            let decay = -k * 2;
            return Math.sin(period * Math.PI * 2) * Math.exp(decay);
        }, true, 2000, -1).repeatDelay(2000);
    }

    // -------------------------------------------------------------------------
    private createSoundButton(): void {
        let frameName = Preferences.instance.sound ? "Sound_on" : "Sound_off";

        let sound = this.add.button(this.game.width / 2 - Menu.SOUND_BUTTON_OFFSET,
            -this.game.height / 2 + Menu.SOUND_BUTTON_OFFSET,
            "Sprites", function () {
                let prefs = Preferences.instance;

                // toggle sound setting
                prefs.sound = !prefs.sound;
                this.sound.mute = !prefs.sound;

                // change button icon
                let frameName = prefs.sound ? "Sound_on" : "Sound_off";
                sound.setFrames(frameName, frameName, frameName, frameName);

                Sounds.sfx.play("select");

                prefs.save();
            }, this, frameName, frameName, frameName, frameName);

        sound.anchor.set(0.5, 0.5);

        this._sound = sound;
    }

    // -------------------------------------------------------------------------
    public update() {

        // elapsed time in seconds
        let delta = this.time.elapsed / 1000;

        // move bg
        this._treesBg.tilePosition.x -= Menu.BG_SPEED_X * delta;

        // update goblin anim
        this._goblin.updateAnimation();


        // update goblin x poisiton
        this._goblin.x += Menu.GOBLIN_SPEED * delta * this._runDirection;
        // check if too far on right or left.
        if (this._goblin.x * this._runDirection > this.game.width / 2 + 200) {
            this._runDirection *= -1;
            this._goblin.x = -(this.game.width / 2 + 200) * this._runDirection;
            this._goblin.scale.x = this._runDirection;
        }

        // calculate goblin Y position
        // three points for quadratic bezier curve (start point - control point - end point)
        // we need to calculate only y position so we can omit x coordinates
        let y0 = 0;
        let cy = Menu.GROUND_CP_Y;
        let y1 = 0;

        // map current goblin's position on screen into interval 0..1
        let t = Phaser.Math.clamp(
            Phaser.Math.mapLinear(this._goblin.x, -this.game.width / 2, this.game.width / 2, 0, 1),
            0, 1);

        // calculate y position
        this._goblin.y = Menu.GOBLIN_Y + Phaser.Math.linear(
            Phaser.Math.linear(y0, cy, t),
            Phaser.Math.linear(cy, y1, t),
            t);
    }

    // -------------------------------------------------------------------------
    public shutdown() {
        // stop music when leaving this state
        Sounds.musicMenu.stop();
    }

    // -------------------------------------------------------------------------
    public onResize(width: number, height: number): void {
        // resize vamera position and world bounds
        this.setView(width, height);

        // recreate ground texture
        this._ground.setTexture(this.generateGround());

        // change tilesprite width
        this._treesBg.width = width;

        // reposition sound button
        this._sound.position.set(this.game.width / 2 - Menu.SOUND_BUTTON_OFFSET,
            -this.game.height / 2 + Menu.SOUND_BUTTON_OFFSET);
    }
}
}