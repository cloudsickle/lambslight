var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * Functions and classes related to the virutal game device.
 */
import * as utils from './utils.js';
;
CanvasRenderingContext2D.prototype.clear = function () {
    this.clearRect(0, 0, this.canvas.width, this.canvas.height);
};
CanvasRenderingContext2D.prototype.fade = function (color, duration, to) {
    return new Promise((resolve) => {
        let [r, g, b] = utils.hexToRGB(color);
        let interval = 0;
        let opacity = 0;
        interval = setInterval(() => {
            this.clear();
            this.fillStyle = `rgba(${r}, ${g}, ${b}, ${(to ? opacity : 100 - opacity) / 100})`;
            this.fillRect(0, 0, this.canvas.width, this.canvas.height);
            opacity += 1;
            if (Math.abs(opacity) === 101) {
                clearInterval(interval);
                this.clear();
                resolve();
            }
        }, duration / 100);
    });
};
CanvasRenderingContext2D.prototype.shift = function (x, y) {
    this.globalCompositeOperation = 'copy';
    this.drawImage(this.canvas, x, y);
    this.globalCompositeOperation = 'source-over';
    return this;
};
CanvasRenderingContext2D.prototype.trace = function (points, dt, tail = 0) {
    console.assert(0 <= tail && tail <= points.length, 'CanvasRenderingContext2D.trace: Invalid tail length.');
    return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < points.length + tail; i++) {
            if (i < points.length) {
                this.fillRect(points[i][0], points[i][1], 1, 1);
            }
            if (i > tail) {
                const j = i - tail - 1;
                this.clearRect(points[j][0], points[j][1], 1, 1);
            }
            yield utils.sleep(dt);
        }
        resolve();
    }));
};
/**
 * GameScreen stores four canvas rendering contexts that make up the
 * "layers" of the device screen. Other convenience methods are attached
 * to simplify common operations.
 */
export class GameScreen {
    constructor() {
        let bg = document.getElementById('background_layer');
        let mo = document.getElementById('mainobject_layer');
        let ch = document.getElementById('characters_layer');
        let fg = document.getElementById('foreground_layer');
        if (!bg || !mo || !ch || !fg) {
            throw 'Failed to retrieve canvas elements.';
        }
        let bgctx = bg.getContext('2d', { 'alpha': false });
        let moctx = mo.getContext('2d');
        let chctx = ch.getContext('2d');
        let fgctx = fg.getContext('2d');
        if (!bgctx || !moctx || !chctx || !fgctx) {
            throw 'Failed to retrieve canvas contexts.';
        }
        this.background = bgctx;
        this.mainobject = moctx;
        this.characters = chctx;
        this.foreground = fgctx;
        this.width = this.background.canvas.width;
        this.height = this.background.canvas.height;
    }
}
export var GameButton;
(function (GameButton) {
    GameButton[GameButton["A"] = 0] = "A";
    GameButton[GameButton["B"] = 1] = "B";
    GameButton[GameButton["Down"] = 2] = "Down";
    GameButton[GameButton["Left"] = 3] = "Left";
    GameButton[GameButton["Right"] = 4] = "Right";
    GameButton[GameButton["Start"] = 5] = "Start";
    GameButton[GameButton["Up"] = 6] = "Up";
})(GameButton || (GameButton = {}));
export class GameInput {
    constructor() {
        this.pressed = {
            [GameButton.A]: false,
            [GameButton.B]: false,
            [GameButton.Down]: false,
            [GameButton.Left]: false,
            [GameButton.Right]: false,
            [GameButton.Start]: false,
            [GameButton.Up]: false,
        };
        this.lastPressedArrow = null;
        const buttons = ['btn-a', 'btn-b', 'btn-d', 'btn-l', 'btn-r', 'btn-s',
            'btn-u'];
        const functions = [
            this.handleMouseA,
            this.handleMouseB,
            this.handleMouseDown,
            this.handleMouseLeft,
            this.handleMouseRight,
            this.handleMouseStart,
            this.handleMouseUp,
        ];
        // Assign listeners for mouse events.
        for (let i = 0; i < buttons.length; i++) {
            let button = document.getElementById(buttons[i]);
            if (!button) {
                throw 'Failed to retrieve device button.';
            }
            button.addEventListener('mousedown', functions[i]);
            button.addEventListener('mouseup', functions[i]);
        }
        // Assign listeners for keyboard events.
        document.addEventListener('keydown', this.handleKeyboard);
        document.addEventListener('keyup', this.handleKeyboard);
    }
    isArrowPressed() {
        return (this.pressed[GameButton.Down]
            || this.pressed[GameButton.Left]
            || this.pressed[GameButton.Right]
            || this.pressed[GameButton.Up]);
    }
    isPressed(button) {
        return this.pressed[button];
    }
    handleKeyboard(event) {
        event.preventDefault();
        let button = GameButton.A; // Initilize with any button.
        switch (event.keyCode) {
            case 37: // Left arrow.
                button = GameButton.Left;
                break;
            case 38: // Up arrow.
                button = GameButton.Up;
                break;
            case 39: // Right arrow.
                button = GameButton.Right;
                break;
            case 40: // Down arrow.
                button = GameButton.Down;
                break;
            case 65: // A.
                button = GameButton.A;
                break;
            case 66: // B.
                button = GameButton.B;
                break;
            case 83: // S, alternate to B.
                button = GameButton.B;
                break;
            case 192: // `. Start button for now.
                button = GameButton.Start;
                break;
            default:
                break;
        }
        this.pressOrRelease(button, event.type === 'keydown');
    }
    handleMouseA(event) {
        this.pressOrRelease(GameButton.A, event.type === 'mousedown');
    }
    handleMouseB(event) {
        this.pressOrRelease(GameButton.B, event.type === 'mousedown');
    }
    handleMouseDown(event) {
        this.pressOrRelease(GameButton.Down, event.type === 'mousedown');
    }
    handleMouseLeft(event) {
        this.pressOrRelease(GameButton.Left, event.type === 'mousedown');
    }
    handleMouseRight(event) {
        this.pressOrRelease(GameButton.Right, event.type === 'mousedown');
    }
    handleMouseStart(event) {
        this.pressOrRelease(GameButton.Start, event.type === 'mousedown');
    }
    handleMouseUp(event) {
        this.pressOrRelease(GameButton.Up, event.type === 'mousedown');
    }
    pressOrRelease(button, press) {
        this.pressed[button] = press;
        if (isArrow(button)) {
            this.lastPressedArrow = button;
        }
        else if (!this.isArrowPressed()) {
            this.lastPressedArrow = null;
        }
    }
}
function isArrow(button) {
    return [
        GameButton.Down,
        GameButton.Left,
        GameButton.Right,
        GameButton.Up
    ].indexOf(button) > -1;
}
//# sourceMappingURL=device.js.map