var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as device from './device.js';
import * as scene from './scene.js';
import * as sprite from './sprite.js';
import * as utils from './utils.js';
const WALK_FPS = 2.5;
export class Game {
    constructor(intialSceneAsset) {
        try {
            this.input = new device.GameInput();
            this.scene = new scene.Scene(intialSceneAsset); // TODO: Slow...
            this.screen = new device.GameScreen();
            this.sprite = new sprite.Sprite();
            this.topLeft = new utils.Position(this.scene.map.startTopX, this.scene.map.startTopY);
        }
        catch (error) {
            throw error;
        }
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.sprite.loadSpritesheet('../../assets/spritesheet.png');
        });
    }
    loop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.input.isArrowPressed()) {
                let newDirection = utils.Direction.N; // Arbitrary intial value.
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
                 */
                if (this.sprite.direction === newDirection) {
                    // TODO: Ensure sprite can move to new position.
                    this.moveCamera(newDirection);
                    // TODO: Move sprite in scene.
                    this.scene.render(this.screen, this.topLeft);
                }
                else {
                    this.sprite.direction = newDirection;
                }
                this.sprite.render(this.screen);
                /*
                 * Slow down the character when walking. You don't want to walk at
                 * the speed of the game loop, it's way too fast. You also don't
                 * want to slow down the speed of the game loop because you need to
                 * listen for quick input events.
                 */
                yield utils.sleep(1000 / WALK_FPS);
            }
            window.requestAnimationFrame(() => this.loop());
        });
    }
    moveCamera(direction) {
        switch (direction) {
            case utils.Direction.N:
                this.topLeft.y -= 1;
                break;
            case utils.Direction.E:
                this.topLeft.x += 1;
                break;
            case utils.Direction.S:
                this.topLeft.y += 1;
                break;
            case utils.Direction.W:
                this.topLeft.x -= 1;
                break;
            default:
                break;
        }
    }
}
//# sourceMappingURL=game.js.map