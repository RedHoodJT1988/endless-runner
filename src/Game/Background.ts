namespace RunGoblinRun {

    export class Background extends Phaser.Group {

        private static TREE_DIST_MIN = 300;
        private static TREE_DIST_MAX = 800;

        private _treesBg: Phaser.TileSprite;
        private _trees: Phaser.Group;
        private _hill: Phaser.TileSprite;
        private _mud: Phaser.TileSprite;

        private _nextTree: number = 0;
        private _treeWidth: number;

        // -------------------------------------------------------------------------
        public constructor(game: Phaser.Game, parent: PIXI.DisplayObjectContainer) {
            super(game, parent);

            // heights
            let treesHeight = game.cache.getImage("TreesBg").height;
            let hillHeight = game.cache.getImage("Hill").height;
            let mudHeight = game.cache.getImage("Mud").height;

            // trees bg
            this._treesBg = new Phaser.TileSprite(game, 0, 0, game.width, treesHeight, "TreesBg");
            this._treesBg.fixedToCamera = true;
            this.add(this._treesBg);

            // trees group / pool
            this._trees = new Phaser.Group(game, this);
            this._trees.createMultiple(4, "Sprites", "Tree", false);
            // width of tree sprite
            this._treeWidth = game.cache.getFrameByName("Sprites", "Tree").width;

            // hill
            this._hill = new Phaser.TileSprite(game, 0, game.height - mudHeight - hillHeight, game.width, hillHeight, "Hill");
            this._hill.fixedToCamera = true;
            this.add(this._hill);

            // mud
            this._mud = new Phaser.TileSprite(game, 0, game.height - mudHeight, game.width, mudHeight, "Mud");
            this._mud.fixedToCamera = true;
            this.add(this._mud);
        }

        // -------------------------------------------------------------------------
        public updateLayers(x: number): void {
            // move all three tilesprites
            this._mud.tilePosition.x = -x + Math.sin(Phaser.Math.degToRad((this.game.time.time / 30) % 360)) * 20;
            this._hill.tilePosition.x = -x * 0.5;
            this._treesBg.tilePosition.x = -x * 0.25;

            // move trees layer and remove/add trees
            this.manageTrees(x * 0.5);
        }

        // -------------------------------------------------------------------------
        private manageTrees(x: number): void {
            // move trees layer
            this._trees.x = x;

            // remove old
            this._trees.forEachExists(function (tree: Phaser.Sprite) {
                if (tree.x < x - this._treeWidth) {
                    tree.exists = false;
                }
            }, this);


            // add new tree(s)
            while (this._nextTree < x + this.game.width) {
                // save new tree position
                let treeX = this._nextTree;

                // calcultate position for next tree
                this._nextTree += this.game.rnd.integerInRange(Background.TREE_DIST_MIN, Background.TREE_DIST_MAX);

                // get unused tree sprite
                let tree = <Phaser.Sprite>this._trees.getFirstExists(false);
                // if no free sprites, exit loop
                if (tree === null) {
                    break;
                }

                // position tree and make it exist
                tree.x = treeX;
                tree.exists = true;
            }
        }

        // -------------------------------------------------------------------------
        public resize(): void {
            let newWidth = this.game.width;

            this._treesBg.width = newWidth;
            this._hill.width = newWidth;
            this._mud.width = newWidth;
        }
    }
}