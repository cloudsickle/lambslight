import * as device from './device.js';
import * as utils  from './utils.js';

const SPRITESHEET_DIRECTIONS = [
    utils.Direction.N,
    utils.Direction.E,
    utils.Direction.S,
    utils.Direction.W,
];

export class Sprite {
    direction  : utils.Direction  = utils.Direction.S;
    spritesheet: HTMLImageElement = new Image();
    walkFrames : number[]         = [0, 0, 0, 0];

    constructor() {

    }

    loadSpritesheet(src: string): Promise<void> {
        return new Promise((resolve) => {
            this.spritesheet.onload = () => resolve();
            this.spritesheet.src    = src;
        });
    }

    // TODO: Should this be moved to a GameScreen (or Scene) method?
    render(gameScreen: device.GameScreen) {
        let sx = SPRITESHEET_DIRECTIONS.indexOf(this.direction)*16;
        let sy = this.getWalkFrame()*16;

        // TODO: Allow sprite rendering not in the center of the screen.
        // Many of these parameters will become dynamic, and factor in
        // the sprite location. This will allow for scenes where the map
        // is frozen and the character walks to a specific location.
        gameScreen.characters.clearRect(112, 72, 16, 16);
        gameScreen.characters.drawImage(this.spritesheet, sx, sy, 16, 16, 112,
                                        72, 16, 16);
    }

    private getWalkFrame(): number {
        let frame = 0;
        let directionIndex = SPRITESHEET_DIRECTIONS.indexOf(this.direction);

        for (let i = 0; i < this.walkFrames.length; i++) {
            if (i != directionIndex) {
                this.walkFrames[i] = 0;
            } else {
                frame = this.walkFrames[i];
                this.walkFrames[i] = (frame + 1) % 4;
            }
        }

        // If the current frame is 2, we want to return 0 because the first and
        // third frames are the same image. If it's 3, we return 2 because the
        // spritesheet only stores each frame once so the third row is the
        // fourth frame in the sequence.
        // 0 -> 0, 1 -> 1, 2 -> 0, 3 -> 2
        return (frame % 2)*(1 + Math.floor(frame/2));
    }
}
