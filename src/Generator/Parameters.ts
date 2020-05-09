namespace Generator {

  export class Parameters {

      // grid
      public static GRID_HEIGHT = 10;
      public static CELL_SIZE = 64;
      public static CELL_STEPS = 4;

      // gravity
      public static GRAVITY = 2400;

      // player body dimensions
      public static PLAYER_BODY_WIDTH = 30;
      public static PLAYER_BODY_HEIGHT = 90;

      // jump height params
      public static HEIGHT_MIN = Parameters.CELL_SIZE * 0.75;
      public static HEIGHT_MAX = Parameters.CELL_SIZE * 2.90;
      public static HEIGHT_STEPS = 4;

      // horizontal speed
      public static VELOCITY_X = 300;

      // bounds for generating platforms
      public static UBOUND = 2;
      public static LBOUND = 8;


      // --- GENERATOR ---
      // probability to generate random piece in percent
      public static GENERATE_RANDOM = 50;
      // keep length of all platforms in pattern the same? (in percent)
      public static KEEP_LENGTH_IN_PATTERN = 75;


      // --- DIFFICULTY ---
      // platform length
      public static PLATFORM_LENGTH_MIN = 2;
      public static PLATFORM_LENGTH_MAX = 5;
      public static PLATFORM_LENGTH_DECREASER_MIN = 0;
      public static PLATFORM_LENGTH_DECREASER_MAX = -2;
      public static PLATFORM_LENGTH_DECREASER_START_TILE = 100;
      public static PLATFORM_LENGTH_DECREASER_END_TILE = 200;

      // jump length
      public static JUMP_LENGTH_DECREASER_MIN = -1;
      public static JUMP_LENGTH_DECREASER_MAX = 0;
      public static JUMP_LENGTH_DECREASER_START_TILE = 0;
      public static JUMP_LENGTH_DECREASER_END_TILE = 50;

      // spikes
      public static SPIKES_PROB_MIN = 0;
      public static SPIKES_PROB_MAX = 25;
      public static SPIKES_PROB_START_TILE = 30;
      public static SPIKES_PROB_END_TILE = 80;

      // bonus jump probability
      public static BONUS_JUMP_PROB_MIN = 0;
      public static BONUS_JUMP_PROB_MAX = 30;
      public static BONUS_JUMP_START_TILE = 50;
      public static BONUS_JUMP_END_TILE = 200;

      // bonus jump count
      public static BONUS_JUMP_COUNT_MIN = 1;
      public static BONUS_JUMP_COUNT_MAX = 3;
      public static BONUS_JUMP_COUNT_START_TILE = 50;
      public static BONUS_JUMP_COUNT_END_TILE = 300;


      // --- SPIKE PATTERNS ---
      public static SPIKE_PATTERNS: number[][] = [
          [],                                     // 0
          [],                                     // 1
          [],                                     // 2
          [],                                     // 3
          [],                                     // 4
          [0b00100],                              // 5
          [0b001100],                             // 6
          [0b0011100, 0b0010100],                 // 7
          [0b00011000, 0b00100100],               // 8
          [0b000111000, 0b001101100, 0b001000100] // 9
      ];
  }
}
