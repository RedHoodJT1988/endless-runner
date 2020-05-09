namespace RunGoblinRun {
  export class Shadow extends Phaser.Sprite {

    private _playerPosition: Phaser.Point;
    private _walls: Phaser.Group;

    // -------------------------------------------------------------------------
    public constructor(game: Phaser.Game, playerPosition: Phaser.Point, walls: Phaser.Group) {
        super(game, 0, 0, "Sprites", "Shadow");

        this._playerPosition = playerPosition;
        this._walls = walls;

        this.anchor.set(0.5, 0.5);
        this.visible = false;
    }

    // -------------------------------------------------------------------------
    public postUpdate(): void {

        // left edge of shadow sprite
        let xLeft = this._playerPosition.x - 20;
        let minYleft = Number.MAX_VALUE;

        // right edge of shadow sprite
        let xRight = this._playerPosition.x + 20;
        let minYright = Number.MAX_VALUE;


        // go through all walls and find the top one under left and right edge
        for (let i = 0; i < this._walls.length; i++) {
            let wall = <Phaser.Sprite>this._walls.getChildAt(i);

            // is left edge on this wall tile?
            if (wall.x <= xLeft && wall.x + 64 > xLeft) {
                // is it higher than previous wall
                minYleft = Math.min(minYleft, wall.y);
            }

            // is right edge on this wall tile?
            if (wall.x <= xRight && wall.x + 64 > xRight) {
                // is it higher than previous wall
                minYright = Math.min(minYright, wall.y);
            }
        }

        // if:
        //  1. found some tile under left edge AND
        //  2. right egde is on the same height level AND
        //  3. both are under (with higher y) player
        // then calculate shadow scale and display it
        if (minYleft < Number.MAX_VALUE && minYleft === minYright && minYleft > this._playerPosition.y) {
            // calculate x scale for shadow. Higher the player above platform, smaller the scale
            let scale = 1 / (1 + (minYleft - this._playerPosition.y) / 500);
            this.scale.x = scale;

            // update shadow position and make it visible
            this.position.set(this._playerPosition.x, minYleft);
            this.visible = true;
        } else {
            // if conditions for displaying shadow are not met, hide it
            this.visible = false;
        }
    }
}
}