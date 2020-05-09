namespace RunGoblinRun {

    export class Play extends Phaser.State {

        // background
        private _bg: Background;

        // main layer with platforms
        private _mainLayer: MainLayer;

        // player
        private _player: Player;
        private _jumpTimer: number = 0;
        private _bonusJump: boolean = false;
        // shadow
        private _shadow: Shadow;

        // status
        private _gameOver: boolean = false;

        // input
        private _jumpKey: Phaser.Key;
        private _justDown: boolean = false;
        private _justUp: boolean = false;

        // score
        private _score: number = 0;
        private _scoreUI: ScoreUI;

        // dust emitter
        private _dustEmitter: Phaser.Particles.Arcade.Emitter;
        private _touchingDown: boolean = false;
        private _runCounter: number = 0;

        // -------------------------------------------------------------------------
        public render() {
            // this._mainLayer.render();
            //this.game.debug.body(this._player, "RGBA(255, 0, 0, 0.2)");
        }

        // -------------------------------------------------------------------------
        public create() {
            this.stage.backgroundColor = 0x03CABF;

            // camera
            this.camera.bounds = null;

            // physics
            this.physics.arcade.gravity.y = Generator.Parameters.GRAVITY;


            //Generator.JumpTables.setDebug(true, GoblinRun.Global);
            Generator.JumpTables.instance;

            // this.game.add.sprite(0, 0, Generator.JumpTables.debugBitmapData);


            // background layers
            this._bg = new Background(this.game, this.world);

            // layer with platforms
            this._mainLayer = new MainLayer(this.game, this.world);


            // set player
            this._player = new Player(this.game);
            this._player.position.set(96, 64 * 1);
            this.world.add(this._player);

            // create shadow
            this._shadow = new Shadow(this.game, this._player.position, this._mainLayer.walls);
            // we want to place shadow on platforms, but under items
            let wallIndex = this._mainLayer.getChildIndex(this._mainLayer.walls);
            this._mainLayer.addChildAt(this._shadow, wallIndex + 1);


            // dust particles
            let emitter = new Phaser.Particles.Arcade.Emitter(this.game, 0, 0, 16);
            emitter.makeParticles("Sprites", ["DustParticle"]);
            emitter.setYSpeed(-50, -20);
            emitter.setRotation(0, 0);
            emitter.setAlpha(1, 0, 500, Phaser.Easing.Linear.None);
            emitter.gravity = -Generator.Parameters.GRAVITY;

            this.world.add(emitter);
            this._dustEmitter = emitter;


            // score UI on screen
            this._scoreUI = new ScoreUI(this.game, this.world);
            this._scoreUI.fixedToCamera = true;
            this._scoreUI.cameraOffset.set(45, 30);


            // input
            // key
            this._jumpKey = this.game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
            // mouse
            this.game.input.onDown.add(function () {
                this._justDown = true;
            }, this);
            this.game.input.onUp.add(function () {
                this._justUp = true;
            }, this);

            // reset variables
            this._gameOver = false;
            this._score = 0;
            this._bonusJump = false;
            this._justDown = this._justUp = false;

            // start music
            Sounds.musicGame.play();
        }

        // -------------------------------------------------------------------------
        public update() {
            if (!this._gameOver) {
                this.updatePhysics();

                // move camera
                this.camera.x = this._player.x - 256; //192;

                // generate level
                this._mainLayer.generate(this.camera.x / Generator.Parameters.CELL_SIZE);
            }


            // check if player is still on screen
            if (this._player.y > this.game.height - 104) {
                this._player.y = this.game.height - 104;
                this.gameOver();

                // stop music
                Sounds.musicGame.stop();

                this._player.animateDeath();
                console.log("GAME OVER - fall");
            }


            // update player animations
            let body = <Phaser.Physics.Arcade.Body>this._player.body;
            this._player.updateAnim(body.velocity.y >= 0 && body.touching.down, body.velocity.y, this._gameOver);


            // dust particles when landing
            if (!this._touchingDown && body.touching.down && !this._gameOver) {
                this.emitDustLanding();
            }
            this._touchingDown = body.touching.down;
            // dust particles when running
            this.emitDustRunning();


            // move background
            this._bg.updateLayers(this.camera.x);
        }

        // -------------------------------------------------------------------------
        private updatePhysics(): void {
            let body = <Phaser.Physics.Arcade.Body>this._player.body;

            // overlap with items - spikes, bonuses, ...
            this.physics.arcade.overlap(this._player, this._mainLayer.items, this.onOverlap, null, this);
            if (this._gameOver) {
                return;
            }


            // clear touching
            body.touching.none = true;
            body.touching.up = body.touching.down = body.touching.left = body.touching.right = false;

            // collision with walls
            let wallCollision = this.physics.arcade.collide(this._player, this._mainLayer.walls);


            // move
            if (wallCollision && body.touching.right) {
                body.velocity.set(0, 0);
                this.gameOver();

                this._player.animateHit();
                console.log("GAME OVER - hit");
                return;
            }

            // set body velocity
            body.velocity.x = Generator.Parameters.VELOCITY_X;


            // read keyboard
            if (this._jumpKey.justDown) {
                this._justDown = true;
            }
            if (this._jumpKey.justUp) {
                this._justUp = true;
            }

            let jumpTable = Generator.JumpTables.instance;

            // start jump
            if ((this._justDown && body.touching.down && this.game.time.now > this._jumpTimer) ||
                (this._justDown && this._bonusJump)) {
                body.velocity.y = jumpTable.maxJumpVelocity;
                this._jumpTimer = this.game.time.now + 150;
                this._justDown = false;
                this._bonusJump = false;

                this._player.animateJump();
            }

            // stop jump
            if (this._justUp && body.velocity.y < jumpTable.minJumpVelocity) {
                body.velocity.y = jumpTable.minJumpVelocity;
            }


            // if down pressed, but player is going up, then clear it
            if (body.velocity.y <= 0) {
                this._justDown = false;
            }

            // if key is released then clear down press
            if (this._justUp) {
                this._justDown = false;
            }

            // just up was processed - clear it
            this._justUp = false;
        }

        // -------------------------------------------------------------------------
        private onOverlap(player: Phaser.Sprite, item: Item): void {

            if (item.itemType === eItemType.SPIKE) {
                <Phaser.Physics.Arcade.Body>this._player.body.velocity.set(0, 0);

                this._player.animateHit();
                console.log("GAME OVER - spike");

                this.gameOver();

            } else if (item.itemType === eItemType.BONUS_JUMP) {
                this._bonusJump = true;
                this._mainLayer.removeItem(item);

                Sounds.sfx.play("bonus_jump");

            } else if (item.itemType === eItemType.GOLD) {
                this._mainLayer.removeItem(item);

                Sounds.sfx.play("gold");

                // add score and make bounce effect of score icon
                this._score += 100;
                this._scoreUI.score = this._score;
                this._scoreUI.bounce();
            }
        }

        // -------------------------------------------------------------------------
        public emitDustLanding(): void {
            this._dustEmitter.emitX = this._player.x + 20;
            this._dustEmitter.emitY = this._player.y + 90;
            this._dustEmitter.setXSpeed(-100, 0);
            this._dustEmitter.explode(500, 2);
            this._dustEmitter.setXSpeed(0, 100);
            this._dustEmitter.explode(500, 2);
        }

        // -------------------------------------------------------------------------
        public emitDustRunning(): void {
            if (this._player.animName !== "run") {
                return;
            }

            let counter = Math.floor(this.game.time.time / 250);
            if (counter > this._runCounter) {
                this._runCounter = counter;

                this._dustEmitter.emitX = this._player.x;
                this._dustEmitter.emitY = this._player.y + 80;
                this._dustEmitter.setXSpeed(-100, 0);
                this._dustEmitter.emitParticle();
            }
        }

        // -------------------------------------------------------------------------
        private gameOver(): void {
            // game over already set?
            if (this._gameOver) {
                return;
            }

            this._gameOver = true;

            // check distance for new record
            let settings = Preferences.instance;
            let newDistance = Math.floor(this._player.x / 64);
            // new record?
            if (newDistance > settings.record) {
                settings.record = newDistance;
                settings.save();
            }

            // return to menu
            this.time.events.add(3000, function () {
                this.game.state.start("Menu");
            }, this);
        }

        // -------------------------------------------------------------------------
        public onResize(width: number, height: number): void {
            this._bg.resize();
        }

        // -------------------------------------------------------------------------
        public onPause(): void {
            this.game.paused = true;
        }

        // -------------------------------------------------------------------------
        public onResume(): void {
            this.game.paused = false;
        }
    }
}
