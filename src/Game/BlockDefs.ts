namespace RunGoblinRun {

    export interface ITileDef {
        name: string;
        anchorX: number;
        anchorY: number;
        bodyOffsetX: number;
        bodyOffsetY: number;
        bodyWidth: number;
        bodyHeight: number;
    }


    export class BlockDefs {

        public static PLATFORM: ITileDef[][] = [
            [
                { name: "PlatformLeft", anchorX: 0, anchorY: 0.2, bodyOffsetX: 0, bodyOffsetY: 16, bodyWidth: 64, bodyHeight: 48 },
                { name: "PlatformMiddle", anchorX: 0, anchorY: 0.2, bodyOffsetX: 0, bodyOffsetY: 16, bodyWidth: 64, bodyHeight: 48 },
                { name: "PlatformRight", anchorX: 0, anchorY: 0.2, bodyOffsetX: 0, bodyOffsetY: 16, bodyWidth: 64, bodyHeight: 48 }
            ]
        ];

        public static BLOCK: ITileDef[][] = [
            [
                { name: "BlockTopLeft", anchorX: 0, anchorY: 0.2, bodyOffsetX: 0, bodyOffsetY: 16, bodyWidth: 64, bodyHeight: 64 },
                { name: "BlockTopMiddle", anchorX: 0, anchorY: 0.2, bodyOffsetX: 0, bodyOffsetY: 16, bodyWidth: 64, bodyHeight: 64 },
                { name: "BlockTopRight", anchorX: 0, anchorY: 0.2, bodyOffsetX: 0, bodyOffsetY: 16, bodyWidth: 64, bodyHeight: 64 }
            ],

            [
                { name: "BlockMiddleLeft", anchorX: 0, anchorY: 0, bodyOffsetX: 0, bodyOffsetY: 0, bodyWidth: 64, bodyHeight: 64 },
                { name: "BlockMiddleMiddle", anchorX: 0, anchorY: 0, bodyOffsetX: 0, bodyOffsetY: 0, bodyWidth: 64, bodyHeight: 64 },
                { name: "BlockMiddleRight", anchorX: 0, anchorY: 0, bodyOffsetX: 0, bodyOffsetY: 0, bodyWidth: 64, bodyHeight: 64 }
            ],

            [
                { name: "BlockBottomLeft", anchorX: 0, anchorY: 0, bodyOffsetX: 0, bodyOffsetY: 0, bodyWidth: 64, bodyHeight: 64 },
                { name: "BlockBottomMiddle", anchorX: 0, anchorY: 0, bodyOffsetX: 0, bodyOffsetY: 0, bodyWidth: 64, bodyHeight: 64 },
                { name: "BlockBottomRight", anchorX: 0, anchorY: 0, bodyOffsetX: 0, bodyOffsetY: 0, bodyWidth: 64, bodyHeight: 64 }
            ]
        ];

        public static LOW_BLOCK: ITileDef[][] = [
            [
                { name: "LowBlockLeft", anchorX: 0, anchorY: 0.2, bodyOffsetX: 0, bodyOffsetY: 16, bodyWidth: 64, bodyHeight: 64 },
                { name: "LowBlockMiddle", anchorX: 0, anchorY: 0.2, bodyOffsetX: 0, bodyOffsetY: 16, bodyWidth: 64, bodyHeight: 64 },
                { name: "LowBlockRight", anchorX: 0, anchorY: 0.2, bodyOffsetX: 0, bodyOffsetY: 16, bodyWidth: 64, bodyHeight: 64 }
            ]
        ];


        // SPIKES
        public static SPIKES: ITileDef = { name: "spikes", anchorX: 0.5, anchorY: 1, bodyOffsetX: 9, bodyOffsetY: 17, bodyWidth: 45, bodyHeight: 34 };

        // BONUS JUMP
        public static BONUS_JUMP: ITileDef = { name: "bonusJump", anchorX: 0.5, anchorY: 0.5, bodyOffsetX: 7, bodyOffsetY: 7, bodyWidth: 50, bodyHeight: 50 };

        // GOLD
        public static GOLD: ITileDef = { name: "Gold", anchorX: 0.5, anchorY: 1, bodyOffsetX: 0, bodyOffsetY: 0, bodyWidth: 43, bodyHeight: 43 };
    }
}