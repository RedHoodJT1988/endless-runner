namespace RunGoblinRun {

    export class Preload extends Phaser.State {

        private static LOADING_BAR_WIDTH = 300;
        
        // music decoded, ready for game
        private _ready: boolean = false;

        // sprite for loading bar
        private _loadingBar: Phaser.Sprite;
        // loading text
        private _loadingText: Phaser.BitmapText;

        // -------------------------------------------------------------------------
        public preload() {

            this.stage.backgroundColor = 0x2B4940;

            this.setView(this.game.width, this.game.height);

            // create graphics for loading bar
            let g = new Phaser.Graphics(this.game);
            // fill color
            g.beginFill(0x03CABF);
            // draw a shape
            g.drawRect(0, 0, 8, 8);
            // loading bar sprite
            this._loadingBar = this.add.sprite(-Preload.LOADING_BAR_WIDTH / 2, 0, g.generateTexture());
            this._loadingBar.width = 0;
            this._loadingBar.height = 48;
            // we do not need graphics anymore
            g.destroy();

            // laoding text
            this._loadingText = this.add.bitmapText(0, 60, "Font", "0%", 40);
            this._loadingText.anchor.x = 0.5;


            //this.load.image("Block", "assets/Block.png");
            //this.load.image("Player", "assets/Player.png");

            // atlas
            this.load.atlas("Sprites", "assets/Sprites.png", "assets/Sprites.json");

            // spriter anim
            this.load.xml("GoblinAnim", "assets/Goblin.xml");

            // background layer sprites
            this.load.image("Mud", "assets/IceRiver.png");
            this.load.image("Hill", "assets/Hill.png");
            this.load.image("TreesBg", "assets/IceTreesBg.png");

            // font
            // this.load.bitmapFont("Font", "assets/Font.png", "assets/Font.xml");

            // sound fx
            // iterate through all audiosprites
            //for (let property in Sounds.AUDIO_JSON.spritemap) {
            //    let audioSprite = Sounds.AUDIO_JSON.spritemap[property];
            //    console.log("name: " + property + ", value: " + JSON.stringify(audioSprite));
            //}
            this.load.audiosprite("Sfx", Sounds.AUDIO_JSON.resources, null, Sounds.AUDIO_JSON);

            // music
            this.load.audio("MusicGame", ["assets/MusicGame.ogg", "assets/MusicGame.m4a"]);
            this.load.audio("MusicMenu", ["assets/MusicMenu.ogg", "assets/MusicMenu.m4a"]);
        }

        // -------------------------------------------------------------------------
        public onResize(width: number, height: number): void {
            this.setView(width, height);
        }

        // -------------------------------------------------------------------------
        public setView(width: number, height: number): void {
            // set bounds
            this.world.setBounds(-width / 2, -height / 2, width / 2, height / 2);
            // focus on game center
            this.camera.focusOnXY(0, 0);
        }

        // -------------------------------------------------------------------------
        public loadUpdate(): void  {
            // update bar width
            this._loadingBar.width = Preload.LOADING_BAR_WIDTH * this.load.progress / 100;

            // update loading text percent
            this._loadingText.text = this.load.progress + "%";
        }

        // -------------------------------------------------------------------------
        public create() {
            // sound
            Sounds.sfx = this.add.audioSprite("Sfx");

            // music
            Sounds.musicGame = this.add.audio("MusicGame");
            Sounds.musicGame.loop = true;
            Sounds.musicMenu = this.add.audio("MusicMenu");
            Sounds.musicMenu.loop = true;
        }

        // -------------------------------------------------------------------------
        public update() {
            // run only once
            if (this._ready === false &&
                this.cache.isSoundDecoded("Sfx") &&
                this.cache.isSoundDecoded("MusicGame") &&
                this.cache.isSoundDecoded("MusicMenu")) {

                this._ready = true;

                // small delay before changing state
                this.time.events.add(500, function () {
                    this.game.state.start("Menu");
                }, this);
            }
        }
    }
}
