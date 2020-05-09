namespace Generator {

    export class JumpTables {

        private static _instance = null;

        // velocities
        private _jumpVelocities: number[] = [];

        // list of possible jumps for each jump velocity and position within cell
        private _jumpDefs: Jump[][][] = [];

        // results of jump table analysis
        private _jumpOffsetsY: number[] = [];
        private _jumpOffsetYMax: number = 0;
        private _jumpOffsetXMins: any = {};
        private _jumpOffsetXMaxs: any = {};
                
        // -------------------------------------------------------------------------
        public static get instance(): JumpTables {
            if (JumpTables._instance === null) {
                JumpTables._instance = new JumpTables();
            }

            return JumpTables._instance;
        }

        // -------------------------------------------------------------------------
        public constructor() {
            this.calculateJumpVelocities();
            this.calculateJumpTables();
        }

        // -------------------------------------------------------------------------
        private calculateJumpVelocities(): void {
            // all height samples
            for (let i = 0; i <= Parameters.HEIGHT_STEPS; i++) {
                // maximum height of jump for this step
                let height = Parameters.HEIGHT_MIN + (Parameters.HEIGHT_MAX - Parameters.HEIGHT_MIN) / Parameters.HEIGHT_STEPS * i;
                // v = sqrt(-(2 * s * g))
                this._jumpVelocities[i] = -Math.sqrt(2 * height * Parameters.GRAVITY);
            }
        }

        // -------------------------------------------------------------------------
        public get minJumpVelocity(): number {
            return this._jumpVelocities[0];
        }

        // -------------------------------------------------------------------------
        public get maxJumpVelocity(): number {
            return this._jumpVelocities[this._jumpVelocities.length - 1];
        }

        // -------------------------------------------------------------------------
        // ---------------------------- JUMP TABLES --------------------------------
        // -------------------------------------------------------------------------
        private calculateJumpTables(): void {
            // all jump velocities
            for (let height = 0; height <= Parameters.HEIGHT_STEPS; height++) {

                this._jumpDefs[height] = [];
                
                // step from left to right on cell
                for (let step = 0; step < 1 /*Parameters.CELL_STEPS*/; step++) {
                    this.calculateJumpCurve(step, height);
                }
            }

            // analyze created jump tables
            this.analyzeJumpTables();
        }

        // -------------------------------------------------------------------------
        private calculateJumpCurve(step: number, jumpIndex: number): void {
            // simulation timestep
            let timeStep = 1 / 60;

            // take jump velocity we calculated previously
            let velocity = this._jumpVelocities[jumpIndex];

            // start at middle of first step to spread samples better over cell
            // x and y positions are in pixels
            let x = step * Parameters.CELL_SIZE / Parameters.CELL_STEPS
                + Parameters.CELL_SIZE / Parameters.CELL_STEPS / 2;
            let y = 0;
            // y position in cells coordinates (row within grid)
            let cellY = 0;

            // help variables to track previous position
            let prevX, prevY;

            // array of jumps from starting position to possible destinations
            let jumpDefs: Jump[] = [];
            // helper object that will help us keep track of visited cells
            let visitedList = {};

            // half of player body width
            let playerWidthHalf = Parameters.PLAYER_BODY_WIDTH / 2 * 0.5;


            // debug
            let debugBitmap = (JumpTables._DEBUG) ? JumpTables.debugBitmapData : null;
            // offset drawing of curve little bit down (by 4 cells),
            // otherwise it will be cut at top as we start jump at point [x, 0]
            let yOffset = Parameters.CELL_SIZE * 4;


            // simulate physics
            while (cellY < Parameters.GRID_HEIGHT) {
                // save previous position
                prevX = x;
                prevY = y;

                // adjust velocity
                velocity += Parameters.GRAVITY * timeStep;

                // new posiiton
                y += velocity * timeStep;
                x += Parameters.VELOCITY_X * timeStep;

                // draw path - small white dot
                if (JumpTables._DEBUG) {
                    debugBitmap.rect(x, y+ yOffset, 2, 2, "#FFFFFF");
                }

                // left and right bottom point based on body width.
                let leftCell, rightCell;
                cellY = Math.floor(y / Parameters.CELL_SIZE);

                // falling down
                if (velocity > 0) {
                    // crossed cell border to next vertical cell?
                    if (cellY > Math.floor(prevY / Parameters.CELL_SIZE)) {
                        // calc as intersection of line from prev. position and current position with grid horizontal line
                        let pixelBorderY = Math.floor(y / Parameters.CELL_SIZE) * Parameters.CELL_SIZE;
                        let pixelBorderX = prevX + (x - prevX) * (pixelBorderY - prevY) / (y - prevY);

                        leftCell = Math.floor((pixelBorderX - playerWidthHalf) / Parameters.CELL_SIZE);
                        rightCell = Math.floor((pixelBorderX + playerWidthHalf) / Parameters.CELL_SIZE);

                        // all cells in x direction occupied with body
                        for (let i = leftCell; i <= rightCell; i++) {
                            let visitedId = i + (cellY << 8);

                            // if not already in list, then add new jump to reach this cell
                            if (typeof visitedList[visitedId] === "undefined") {
                                let jump = new Jump();

                                jump.offsetX = i;
                                jump.offsetY = cellY;

                                jumpDefs.push(jump);

                                //console.log(jump.toString());
                            }
                        }

                        // debug
                        if (JumpTables._DEBUG) {
                            // debug draw
                            let py = pixelBorderY + yOffset;

                            // line with original body width
                            let color = "#4040FF";
                            let pxLeft = pixelBorderX - Parameters.PLAYER_BODY_WIDTH / 2;
                            let pxRight = pixelBorderX + Parameters.PLAYER_BODY_WIDTH / 2;

                            debugBitmap.line(pxLeft, py, pxRight, py, color);

                            color = "#0000FF";
                            pxLeft = pixelBorderX - playerWidthHalf;
                            pxRight = pixelBorderX + playerWidthHalf;

                            // line with shortened body width
                            debugBitmap.line(pxLeft, py, pxRight, py, color);
                            debugBitmap.line(pxLeft, py - 3, pxLeft, py + 3, color);
                            debugBitmap.line(pxRight, py - 3, pxRight, py + 3, color);
                        }
                    }
                }


                leftCell = Math.floor((x - playerWidthHalf) / Parameters.CELL_SIZE);
                rightCell = Math.floor((x + playerWidthHalf) / Parameters.CELL_SIZE);

                // add grid cells to visited
                for (let i = leftCell; i <= rightCell; i++) {
                    // make "id"
                    let visitedId = i + (cellY << 8);
                    if (typeof visitedList[visitedId] === "undefined") {
                        visitedList[visitedId] = visitedId;
                    }
                }
            }

            this._jumpDefs[jumpIndex][step] = jumpDefs;
        }

        // -------------------------------------------------------------------------
        private analyzeJumpTables(): void {
            // min y
            this._jumpOffsetYMax = 0;

            // through all jump velocities
            for (let velocity = 0; velocity < this._jumpDefs.length; velocity++) {
                // get only first x position within cell and first jump for given velocity,
                // because all have the same height
                this._jumpOffsetsY[velocity] = this._jumpDefs[velocity][0][0].offsetY;
                // check for maximum offset in y direction.
                // As it is negative number, we are looking for min in fact
                this._jumpOffsetYMax = Math.min(this._jumpOffsetYMax, this._jumpOffsetsY[velocity]);
            }


            // find minimum and maximum offset in cells to jump to at given height level
            for (let velocity = 1; velocity < this._jumpDefs.length; velocity++) {

                // get only first startX, because it has smallest x offset
                let jumps = this._jumpDefs[velocity][0];

                for (let j = 0; j < jumps.length; j++) {
                    let jump = jumps[j];
                    let currentMin = this._jumpOffsetXMins[jump.offsetY];

                    this._jumpOffsetXMins[jump.offsetY] = (typeof currentMin !== "undefined") ?
                        Math.min(currentMin, jump.offsetX) : jump.offsetX;

                    // console.log("LEVEL: " + jump.offsetY + " - jump from " + this.minOffsetX(jump.offsetY));
                }

                // get only last startX, because it has biggest x offset
                jumps = this._jumpDefs[velocity][this._jumpDefs[velocity].length - 1];

                for (let j = 0; j < jumps.length; j++) {
                    let jump = jumps[j];
                    let currentMax = this._jumpOffsetXMaxs[jump.offsetY];

                    this._jumpOffsetXMaxs[jump.offsetY] = (typeof currentMax !== "undefined") ?
                        Math.max(currentMax, jump.offsetX) : jump.offsetX;

                    // console.log("LEVEL: " + jump.offsetY + " - jump to " + this.maxOffsetX(jump.offsetY));
                }
            }
        }

        // -------------------------------------------------------------------------
        public maxOffsetY(jumpIndex: number = -1): number {
            if (jumpIndex === -1) {
                return this._jumpOffsetYMax;
            } else {
                return this._jumpOffsetsY[jumpIndex];
            }
        }

        // -------------------------------------------------------------------------
        public maxOffsetX(offsetY: number): number {
            let maxX = this._jumpOffsetXMaxs[offsetY];

            if (typeof maxX === "undefined") {
                console.error("max X for offset y = " + offsetY + " does not exist");
                maxX = 0;
            }

            return maxX;
        }

        // -------------------------------------------------------------------------
        public minOffsetX(offsetY: number): number {
            let minX = this._jumpOffsetXMins[offsetY];

            if (typeof minX === "undefined") {
                console.error("min X for offset y = " + offsetY + " does not exist");
                minX = 0;
            }

            return minX;
        }

        // -------------------------------------------------------------------------
        // ------------------------------ DEBUG ------------------------------------
        // -------------------------------------------------------------------------
        private static _DEBUG = false;
        private static _globals: any;
        private static _debugBmd: Phaser.BitmapData;

        // -------------------------------------------------------------------------
        public static setDebug(debug: boolean, gameGlobals?: any): void {
            JumpTables._DEBUG = debug;
            JumpTables._globals = gameGlobals;

            if (debug) {
                if (typeof gameGlobals === "undefined" || gameGlobals === null) {
                    console.warn("No game globals provided - switching debug off");
                    JumpTables._DEBUG = false;
                } else {
                    JumpTables.createDebugBitmap();
                }
            }
        }

        // -------------------------------------------------------------------------
        public static get debugBitmapData(): Phaser.BitmapData {
            return JumpTables._debugBmd;
        }

        // -------------------------------------------------------------------------
        private static createDebugBitmap(): void {
            let global = JumpTables._globals;

            let bmd = new Phaser.BitmapData(global.game, "Grid", global.GAME_WIDTH, global.GAME_HEIGHT);
            bmd.fill(192, 192, 192);

            // horizontal lines
            for (let i = 0; i < global.GAME_HEIGHT; i += Parameters.CELL_SIZE) {
                bmd.line(0, i + 0.5, global.GAME_WIDTH - 1, i + 0.5);
            }

            // vertical lines
            for (let i = 0; i < global.GAME_WIDTH; i += Parameters.CELL_SIZE) {
                bmd.line(i + 0.5, 0, i + 0.5, global.GAME_HEIGHT - 1);
                // add columns header numbers
                bmd.text("" + (i / Parameters.CELL_SIZE), i + 20, 20, "24px Courier", "#FFFF00");
            }

            JumpTables._debugBmd = bmd;
        }
    }
}
