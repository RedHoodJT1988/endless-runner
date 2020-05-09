namespace RunGoblinRun {
  export interface IAudioSprite {
    start: number;
    end: number;
    loop: boolean;
}

export interface ISpriteMap {
    [n: string]: IAudioSprite;
}

export interface IAudioJSON {
    resources: string[];
    spritemap: ISpriteMap;
}


export class Sounds {

    // sfx
    public static sfx: Phaser.AudioSprite;
    // musix
    public static musicGame: Phaser.Sound;
    public static musicMenu: Phaser.Sound;

    // definition of markers for sfx
    public static AUDIO_JSON: IAudioJSON = {
        "resources": [
            "assets\\Sfx.ogg",
            "assets\\Sfx.m4a"
        ],
        "spritemap": {
            "end": {
                "start": 0,
                "end": 1.2299319727891156,
                "loop": false
            },
            "bonus_jump": {
                "start": 3,
                "end": 3.225736961451247,
                "loop": false
            },
            "gold": {
                "start": 5,
                "end": 5.395873015873016,
                "loop": false
            },
            "hit": {
                "start": 7,
                "end": 7.09859410430839,
                "loop": false
            },
            "jump": {
                "start": 9,
                "end": 9.184943310657596,
                "loop": false
            },
            "land": {
                "start": 11,
                "end": 11.123083900226757,
                "loop": false
            },
            "mud_fall": {
                "start": 13,
                "end": 13.482630385487528,
                "loop": false
            },
            "select": {
                "start": 15,
                "end": 15.052879818594104,
                "loop": false
            }
        }
    };
}
}