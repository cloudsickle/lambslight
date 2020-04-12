import * as device from './device.js';
import * as scene  from './scene.js';
import * as sprite from './sprite.js';
import * as utils  from './utils.js';

const WALK_FPS = 3;

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
             * There are time delays to control walking speed. This is likely 
             * not the most efficient way to do things. But, the character needs
             * to move slower than the rAF. The rAF should stay as fast as
             * possible so the keyboard/mouse events are responsive.
             * 
             * One last note -- the character walks two tiles per move, so that
             * is why the camera and sprite moves are doubled up.
             */
            if (this.sprite.direction === newDirection) {
                this.moveCamera(newDirection);
                this.sprite.render(this.screen);
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

        window.requestAnimationFrame(() => this.loop());
    }

    /**
     * Moves the background and mainobject layers. Returns true if the camera
     * was moved, else false indicating there was a collision.
     */
    moveCamera(direction: utils.Direction): boolean {
        let newTopLeft = <utils.TilePosition> { ...this.topLeft! };

        switch (direction) {
            case utils.Direction.N:
                newTopLeft.y -= 1;
                break;
            case utils.Direction.E:
                newTopLeft.x += 1;
                break;
            case utils.Direction.S:
                newTopLeft.y += 1;
                break;
            case utils.Direction.W:
                newTopLeft.x -= 1;
                break;
            default:
                break;
        }

        // TODO: This has to change when the sprite isn't always centered.
        let newSpritePosition = new utils.TilePosition(newTopLeft.x + 14, newTopLeft.y + 9);

        let canMove = this.scene!.canMoveTo(newSpritePosition);
        if (canMove) {
            this.topLeft = newTopLeft;
            this.scene!.render(this.screen, this.topLeft!);
        }

        return canMove;
    }
}
