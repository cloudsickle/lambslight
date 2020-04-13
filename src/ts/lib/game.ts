import * as area   from './area.js';
import * as device from './device.js';
import * as scene  from './scene.js';
import * as sprite from './sprite.js';
import * as utils  from './utils.js';

const WALK_FPS = 3;

export class Game {
    input  : device.GameInput;
    area   : area.Area | null;
    screen : device.GameScreen;
    sprite : sprite.Sprite;
    topLeft: utils.TilePosition | null;
    
    constructor() {
        try {
            this.input   = new device.GameInput();
            this.area   = null;
            this.screen  = new device.GameScreen();
            this.sprite  = new sprite.Sprite();
            this.topLeft = null;
        }
        catch(error) {
            throw error;
        }
    }

    async load(areaAsset: string, spriteAsset: string) {
        await scene.developer(this.screen);
        await scene.gameLogo(this.screen);

        await this.sprite.loadSpritesheet(spriteAsset);
        this.area = await area.loadArea(areaAsset);
        this.topLeft = new utils.TilePosition(
            this.area.map.startTopLeftX,
            this.area.map.startTopLeftY
        );
        this.area.render(this.screen, this.topLeft);
        this.sprite.render(this.screen);
    }

    async loop() {
        if (this.input.isArrowPressed()) {
            let newDirection = utils.Direction.N;  // Arbitrary intial value.
            switch (this.input.prioritizedArrow()) {
                case device.GameButton.Down:
                    newDirection = utils.Direction.S;
                    break;
                case device.GameButton.Left:
                    newDirection = utils.Direction.W;
                    break;
                case device.GameButton.Right:
                    newDirection = utils.Direction.E;
                    break;
                case device.GameButton.Up:
                    newDirection = utils.Direction.N;
                    break;
                case null:
                    break;
                default:
                    break;
            }

            /*
             * If the new direction is different than the current direction, the
             * sprite just turns around in place, the position stays constant.
             * So we only deal with area rendering if the sprite direction
             * hasn't changed.
             * 
             * All this is assuming the camera always follows the main character
             * which is true now just for testing.
             *
             * There are time delays to control walking speed. This is likely 
             * not the most efficient way to do things. But, the character needs
             * to move slower than the rAF. The rAF should stay as fast as
             * possible so the keyboard/mouse events are responsive.
             * 
             * One last note -- the character walks two tiles per move, so that
             * is why the camera and sprite moves are doubled up.
             */
            if (this.sprite.direction === newDirection) {

                // TODO: This has to change when the sprite is not always centered.
                let newSpritePosition = this.topLeft!
                    .copy()
                    .move(newDirection)
                    .move(newDirection)
                    .shift(14, 9);
                let canMove = this.area!.canMoveTo(newSpritePosition);
                
                if (canMove) { this.moveCamera(newDirection) };
                this.sprite.render(this.screen);
                await utils.sleep(1000/WALK_FPS/2);

                if (canMove) { this.moveCamera(newDirection) };
                this.sprite.render(this.screen);
                await utils.sleep(1000/WALK_FPS/2);
            } else {
                this.sprite.direction = newDirection;
                this.sprite.render(this.screen);
                await utils.sleep(1000/WALK_FPS);
            }
        }

        window.requestAnimationFrame(() => this.loop());
    }

    /**
     * Moves the background and mainobject layers.
     */
    moveCamera(direction: utils.Direction) {
        let newTopLeft = this.topLeft!.move(direction);
        this.area!.render(this.screen, this.topLeft!);
    }
}
