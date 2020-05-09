namespace Generator {

	const UNDEFINED = -10000;

	export class Generator {

			// signals
			// dispatch new piece, previous piece
			public onRandomPlatform: Phaser.Signal = new Phaser.Signal();
			// dispatch new piece, previous piece, position in pattern, repeat order, pattern base piece
			public onPatternPlatform: Phaser.Signal = new Phaser.Signal();
			// dispatch new piece, previous piece, jump number
			public onBonusJump: Phaser.Signal = new Phaser.Signal();


			private _rnd: Phaser.RandomDataGenerator;
			private _jumpTables: JumpTables;

			private _piecesPool: Helper.Pool<Piece>;

			private _lastGeneratedPiece: Piece = null;

			// pieces queue
			private _piecesQueue: Generator.Piece[] = [];
			private _piecesQueueTop: number = 0;
			private _hlpPoint: Phaser.Point = new Phaser.Point();

			// -------------------------------------------------------------------------
			public constructor(rnd: Phaser.RandomDataGenerator) {
					// random numbers generator
					this._rnd = rnd;

					// reference to jump tables
					this._jumpTables = JumpTables.instance;

					// pool of pieces
					this._piecesPool = new Helper.Pool<Piece>(Piece, 16);
			}

			// -------------------------------------------------------------------------
			private createPiece(): Piece {
					let piece = this._piecesPool.createItem();

					if (piece === null) {
							console.error("No free pieces in pool");
					}

					return piece;
			}

			// -------------------------------------------------------------------------
			public destroyPiece(piece: Piece): void {
					this._piecesPool.destroyItem(piece);
			}

			// -------------------------------------------------------------------------
			public get hasPieces(): boolean {
					return this._piecesQueueTop > 0;
			}

			// -------------------------------------------------------------------------
			private addPieceIntoQueue(piece: Generator.Piece): void {
					// put new piece into queue and increase its length
					this._piecesQueue[this._piecesQueueTop++] = piece;
			}

			// -------------------------------------------------------------------------
			public getPieceFromQueue(): Generator.Piece {
					// if no pieces in queue then return null
					if (this._piecesQueueTop === 0) {
							return null;
					}

					// get first piece in queue
					let piece = this._piecesQueue[0];

					// shift remaining pieces left by 1
					for (let i = 0; i < this._piecesQueueTop - 1; i++) {
							this._piecesQueue[i] = this._piecesQueue[i + 1];
					}

					// clear last slot in queue and decrease queue top
					this._piecesQueue[--this._piecesQueueTop] = null;

					return piece;
			}

			// -------------------------------------------------------------------------
			public setPiece(x: number, y: number, length: number, offsetX: number = 0, offsetY: number = 0): Piece {
					let piece = this.createPiece();

					piece.position.set(x, y);
					piece.offset.set(offsetX, offsetY);
					piece.length = length;

					this.addPieceIntoQueue(piece);

					return piece;
			}

			// -------------------------------------------------------------------------
			private generate(lastPosition: Phaser.Point, difficulty: Difficulty,
					length: number, offsetX: number, offsetY: number, bonusJump: boolean): Piece {

					let piece = this.createPiece();

					let ubound = Parameters.UBOUND;
					let lbound = Parameters.LBOUND;


					// Y POSITION
					// how high can jump max
					let minY = this._jumpTables.maxOffsetY();
					// how deep can fall max
					// let maxY = lbound - ubound;
					let maxY = -minY;

					// clear last y from upper bound, so it starts from 0
					let currentY = lastPosition.y - ubound;

					let shiftY = offsetY;
					if (shiftY === UNDEFINED) {
							// new random y position - each y level on screen has the same probability
							shiftY = this._rnd.integerInRange(0, lbound - ubound);
							// substract currentY from shiftY - it will split possible y levels to negative
							// (how much step up (-)) and positive (how much to step down (+))
							shiftY -= currentY;
							// clamp step to keep it inside interval given with maximum 
							// jump offset up (minY) and maximum fall down (maxX)
							shiftY = Phaser.Math.clamp(shiftY, minY, maxY);
					}

					// new level for platform
					// limit once more against game limits (2 free tiles on top, 1 water tile at bottom)
					let newY = Phaser.Math.clamp(currentY + shiftY, 0, lbound - ubound);

					// shift by upper bound to get right y level on screen
					piece.position.y = newY + ubound;
					// offset of new piece relative to last position (end position of last piece)
					piece.offset.y = piece.position.y - lastPosition.y;


					// X POSITION
					let shiftX = offsetX;
					// calculate is offsetX is not forced or offsetY was forced, but final value is different
					if (shiftX === UNDEFINED || (offsetY !== UNDEFINED && offsetY !== piece.offset.y)) {
							let minX = this._jumpTables.minOffsetX(piece.offset.y);
							let maxX = this._jumpTables.maxOffsetX(piece.offset.y);

							// if bonus jump or previous piece was bonus jump,
							// then make gap at least one cell width (if possible) (= offset 2)
							if (bonusJump || (this._lastGeneratedPiece !== null && this._lastGeneratedPiece.bonusJump)) {
									minX = Math.min(Math.max(minX, 2), maxX);
							}

							// decrease maximum jump distance with jump decreaser in difficulty to
							// make jumps easier in the beginning of game
							// But be sure it does not fall under minX
							if (!bonusJump) {
									maxX = Math.max(minX, maxX + difficulty.jumpLengthDecrease);
							}

							// position of next tile in x direction
							shiftX = this._rnd.integerInRange(minX, maxX);
					}

					// new absolute x position
					piece.position.x = lastPosition.x + shiftX;
					// offset of new piece relative to last position (end position of last piece)
					piece.offset.x = shiftX;


					// LENGTH
					if (length !== UNDEFINED) {
							piece.length = length;
					} else {
							// decrease maximum length of platform with difficulty progress
							piece.length = this._rnd.integerInRange(Parameters.PLATFORM_LENGTH_MIN,
									Parameters.PLATFORM_LENGTH_MAX + difficulty.platformLengthDecrease);
					}


					// SPIKES
					if (this._lastGeneratedPiece !== null && this._lastGeneratedPiece.spikesPattern === 0 &&
							!bonusJump &&
							(this._rnd.integerInRange(0, 99) < difficulty.spikesProbability)) {

							// adjust length - make piece longer
							piece.length = this._rnd.integerInRange(5, 9);

							// choose spikes pattern randomly
							let patternDefs = Parameters.SPIKE_PATTERNS[piece.length];
							piece.spikesPattern = patternDefs[this._rnd.integerInRange(0, patternDefs.length - 1)];

					} else {
							piece.spikesPattern = 0;
					}


					// BONUS JUMP
					piece.bonusJump = bonusJump;


					// console.log(difficulty.toString());


					// RESULT
					this._lastGeneratedPiece = piece;
					return piece;
			}

			// -------------------------------------------------------------------------
			public generatePieces(lastTile: Phaser.Point, difficulty: Difficulty): void {
					let probability = this._rnd.integerInRange(0, 99);

					if (probability < difficulty.bonusJumpProbability &&
							this._lastGeneratedPiece !== null && !this._lastGeneratedPiece.bonusJump) {
							this.generateBonusJump(lastTile, difficulty);
					} else {
							probability = this._rnd.integerInRange(0, 99);

							if (probability < Parameters.GENERATE_RANDOM) {
									this.generateRandomly(lastTile, difficulty);
							} else {
									this.generatePattern(lastTile, difficulty);
							}
					}
			}

			// -------------------------------------------------------------------------
			private generateRandomly(lastTile: Phaser.Point, difficulty: Difficulty): void {
					let prevPiece = this._lastGeneratedPiece;
					let piece = this.generate(lastTile, difficulty, UNDEFINED, UNDEFINED, UNDEFINED, false);

					// add to queue
					this.addPieceIntoQueue(piece);

					// dispatch signal - let listeners know, random platform has been generated
					// pass: new piece, previous piece
					this.onRandomPlatform.dispatch(piece, prevPiece);
			}

			// -------------------------------------------------------------------------
			private generatePattern(lastTile: Phaser.Point, difficulty: Difficulty): void {
					// save index of first new piece
					let oldQueueTop = this._piecesQueueTop;
					// where to start generating
					let hlpPos = this._hlpPoint;
					hlpPos.copyFrom(lastTile);


					// same length for all pices?
					let length = UNDEFINED;
					if (this._rnd.integerInRange(0, 99) < Parameters.KEEP_LENGTH_IN_PATTERN) {
							length = this._rnd.integerInRange(Parameters.PLATFORM_LENGTH_MIN,
									Parameters.PLATFORM_LENGTH_MAX + difficulty.platformLengthDecrease);
					}


					// how many pieces to repeat in pattern
					let basePices = 2;

					for (let i = 0; i < basePices; i++) {
							let prevPiece = this._lastGeneratedPiece;
							let piece = this.generate(hlpPos, difficulty, length, UNDEFINED, UNDEFINED, false);

							hlpPos.copyFrom(piece.position);
							// get last tile of piece
							hlpPos.x += piece.length - 1;

							// add to queue
							this.addPieceIntoQueue(piece);

							// dispatch signal - let listeners know, pattern platform has been generated
							// pass: new piece, previous piece, position in pattern, repeat order, pattern base piece
							this.onPatternPlatform.dispatch(piece, prevPiece, i, 0, null);
					}


					// repeat pattern X times
					let repeat = 1;

					for (let i = 0; i < repeat; i++) {

							// repeat all pieces in pattern
							for (let p = 0; p < basePices; p++) {
									let prevPiece = this._lastGeneratedPiece;
									// get first piece in pattern to repeat as template
									let templetePiece = this._piecesQueue[oldQueueTop + p];

									// replicate it
									let piece = this.generate(hlpPos, difficulty, length,
											templetePiece.offset.x, templetePiece.offset.y, false);

									hlpPos.copyFrom(piece.position);
									hlpPos.x += piece.length - 1;

									// add to stack
									this.addPieceIntoQueue(piece);

									// dispatch signal - let listeners know, pattern platform has been generated
									// pass: new piece, previous piece, position in pattern, repeat order, pattern base piece
									this.onPatternPlatform.dispatch(piece, prevPiece, p, i + 1, templetePiece);
							}
					}
			}

			// -------------------------------------------------------------------------
			private generateBonusJump(lastTile: Phaser.Point, difficulty: Difficulty): void {
					// random number of consecutive jump bonuses
					let jumps = this._rnd.integerInRange(Parameters.BONUS_JUMP_COUNT_MIN, difficulty.bonusJumpCount);

					let piece;
					let prevPiece: Piece = this._lastGeneratedPiece;

					for (let i = 0; i < jumps; i++) {
							// first jump in row of jumps?
							if (i === 0) {
									piece = this.generate(lastTile, difficulty, 1, UNDEFINED, UNDEFINED, true);
							} else {
									piece = this.generate(prevPiece.position, difficulty, 1, prevPiece.offset.x, prevPiece.offset.y, true);
							}

							// add to stack
							this.addPieceIntoQueue(piece);

							// dispatch signal
							this.onBonusJump.dispatch(piece, prevPiece, i);

							prevPiece = piece;
					}
			}
	}
}
