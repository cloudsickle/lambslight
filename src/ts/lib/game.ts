import * as device from './device.js';
import * as scene  from './scene.js';
import * as sprite from './sprite.js';
import * as utils  from './utils.js';

const WALK_FPS = 2.5;

export class Game {
    input  : device.GameInput;
    scene  : scene.Scene | null;
    screen : device.GameScreen;
    sprite : sprite.Sprite;
    topLeft: utils.TilePosition | null;
    
    constructor() {
        try {
            this.input   = new device.GameInput();
            this.scene   = null;
            this.screen  = new device.GameScreen();
            this.sprite  = new sprite.Sprite();
            this.topLeft = null;
        }
        catch(error) {
            throw error;
        }
    }

    async load(sceneAsset: string, spriteAsset: string) {
        await this.sprite.loadSpritesheet(spriteAsset);
        this.scene = await scene.loadScene(sceneAsset);
        this.topLeft = new utils.TilePosition(
            this.scene.map.startTopLeftX,
            this.scene.map.startTopLeftY
        );
        this.scene.render(this.screen, this.topLeft);
        this.sprite.render(this.screen);
    }

    async loop() {
        if (this.input.isArrowPressed()) {
            let newDirection = utils.Direction.N;  // Arbitrary intial value.
            switch (this.input.lastPressedArrow) {
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
                default:
                    break;
            }

            /*
             * If the new direction is different than the current direction, the
             * sprite just turns around in place, the position stays constant.
             * So we only deal with scene rendering if the sprite direction
             * hasn't changed.
             * 
             * All this is assuming the camera always follows the main character
             * which is true now just for testing.
             * 
             * One last note -- the character walks two tiles per move, so that
             * is why the camera and sprite moves are doubled up.
             */
            if (this.sprite.direction === newDirection) {
                console.log('Moving same direction');
                // TODO: Ensure sprite can move to new position.
                this.moveCamera(newDirection);
                this.sprite.render(this.screen);

                /*
                * Slow down the character when walking. You don't want to walk at
                * the speed of the game loop, it's way too fast. You also don't
                * want to slow down the speed of the game loop because you need to
                * listen for quick input events.
                */
                await utils.sleep(1000/WALK_FPS/2);

                this.moveCamera(newDirection);
                this.sprite.render(this.screen);

                await utils.sleep(1000/WALK_FPS/2);
            } else {
                this.sprite.direction = newDirection;
                this.sprite.render(this.screen);
                await utils.sleep(1000/WALK_FPS);
            }
        }

        // Temporarily stopped.
        window.requestAnimationFrame(() => this.loop());
    }

    moveCamera(direction: utils.Direction) {
        switch (direction) {
            case utils.Direction.N:
                this.topLeft!.y -= 1;
                break;
            case utils.Direction.E:
                this.topLeft!.x += 1;
                break;
            case utils.Direction.S:
                this.topLeft!.y += 1;
                break;
            case utils.Direction.W:
                this.topLeft!.x -= 1;
                break;
            default:
                break;
        }

        this.scene!.render(this.screen, this.topLeft!);
    }
}
