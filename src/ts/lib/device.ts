/**
 * Functions and classes related to the virutal game device.
 */
import * as utils from './utils.js';

/**
 * Extend CanvasRenderingContext2D with some simple functions used in a variety
 * of places. This helps keep drawing code simple and more error free.
 */
declare global {
    interface CanvasRenderingContext2D  {
        clear(): void;
        fade(color: string, duration: number, to: boolean): Promise<void>
        shift(dx: number, dy: number): void;
        trace(points: [number, number][], dt: number, tail: number): Promise<void>;
    }
};

CanvasRenderingContext2D.prototype.clear = function() {
    this.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

CanvasRenderingContext2D.prototype.fade = function(
    color: string, duration: number, to: boolean): Promise<void> {

    return new Promise((resolve) => {
        let [r, g, b] = utils.hexToRGB(color);

        let interval: number = 0
        let opacity : number = 0;

        interval = setInterval(() => {
            this.clear();
            this.fillStyle = `rgba(${r}, ${g}, ${b}, ${(to ? opacity : 100 - opacity)/100})`;
            this.fillRect(0, 0, this.canvas.width, this.canvas.height);

            opacity += 1;

            if (Math.abs(opacity) === 101) {
                clearInterval(interval);
                this.clear();
                resolve();
            }
        }, duration/100);       
    });
};

CanvasRenderingContext2D.prototype.shift = function(x, y) {
    this.globalCompositeOperation = 'copy';
    this.drawImage(this.canvas, x, y);
    this.globalCompositeOperation = 'source-over';
    return this;
};

CanvasRenderingContext2D.prototype.trace = function(
    points: [number, number][], dt: number, tail:number = 0): Promise<void> {

    console.assert(0 <= tail && tail <= points.length,
                   'CanvasRenderingContext2D.trace: Invalid tail length.');

    return new Promise(async (resolve) => {
        for (let i = 0; i < points.length + tail; i++) {
            if (i < points.length) {
                this.fillRect(points[i][0], points[i][1], 1, 1);
            }
            
            if (i > tail) {
                const j = i - tail - 1;
                this.clearRect(points[j][0], points[j][1], 1, 1);
            }
    
            await utils.sleep(dt);
        }

        resolve();
    });
};

/**
 * GameScreen stores four canvas rendering contexts that make up the
 * "layers" of the device screen. Other convenience methods are attached
 * to simplify common operations.
 */
export class GameScreen {
    background: CanvasRenderingContext2D;
    mainobject: CanvasRenderingContext2D;
    characters: CanvasRenderingContext2D;
    foreground: CanvasRenderingContext2D;
    width     : number;
    height    : number;

    constructor() {
        let bg = <HTMLCanvasElement> document.getElementById('background_layer');
        let mo = <HTMLCanvasElement> document.getElementById('mainobject_layer');
        let ch = <HTMLCanvasElement> document.getElementById('characters_layer');
        let fg = <HTMLCanvasElement> document.getElementById('foreground_layer');

        if (!bg || !mo || !ch || !fg) {
            throw 'Failed to retrieve canvas elements.';
        }

        let bgctx = bg.getContext('2d', {'alpha': false});
        let moctx = mo.getContext('2d');
        let chctx = ch.getContext('2d');
        let fgctx = fg.getContext('2d');

        if (!bgctx || !moctx || !chctx || !fgctx) {
            throw 'Failed to retrieve canvas contexts.'
        }

        this.background = bgctx;
        this.mainobject = moctx;
        this.characters = chctx;
        this.foreground = fgctx;

        this.width  = this.background.canvas.width;
        this.height = this.background.canvas.height;
    }
}

export enum GameButton {
    A,
    B,
    Down,
    Left,
    Right,
    Start,
    Up
}

export class GameInput {
    private pressed = {
        [GameButton.A    ]: false,
        [GameButton.B    ]: false,
        [GameButton.Down ]: false,
        [GameButton.Left ]: false,
        [GameButton.Right]: false,
        [GameButton.Start]: false,
        [GameButton.Up   ]: false,
    }
    arrowStack: GameButton[];

    constructor() {
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
            button.addEventListener('mousedown', (event) => { functions[i](event) });
            button.addEventListener('mouseup'  , (event) => { functions[i](event) });
        }

        // Assign listeners for keyboard events.
        document.addEventListener('keydown', (event) => { this.handleKeyboard(event) });
        document.addEventListener('keyup'  , (event) => { this.handleKeyboard(event) });

        this.arrowStack = [];
    }

    isArrowPressed(): boolean {
        return (
               this.pressed[GameButton.Down]
            || this.pressed[GameButton.Left]
            || this.pressed[GameButton.Right]
            || this.pressed[GameButton.Up]
        );
    }

    isPressed(button: GameButton): boolean {
        return this.pressed[button];
    }

    prioritizedArrow(): GameButton | null {
        const lastIndex = this.arrowStack.length - 1;
        if (lastIndex >= 0) {
            return this.arrowStack[lastIndex];
        } else {
            return null;
        }
    }

    private handleKeyboard(event: KeyboardEvent) {
        event.preventDefault();

        /*
         * If more than two arrow keys are being held at the same time, a
         * KeyboardEvent may not be generated when a third arrow key is pressed.
         * This is due to keyboard wiring. In my case, if the down arrow key and
         * a side arrow key are held, I get no event when the other side arrow 
         * key is pressed.
         */

        let button: GameButton | null = null;
        switch (event.keyCode) {
            case 37:  // Left arrow.
                button = GameButton.Left;
                break;
            case 38:  // Up arrow.
                button = GameButton.Up;
                break;
            case 39:  // Right arrow.
                button = GameButton.Right;
                break;
            case 40:  // Down arrow.
                button = GameButton.Down;
                break;
            case 65:  // A.
                button = GameButton.A;
                break;
            case 66:  // B.
                button = GameButton.B;
                break;
            case 83:  // S, alternate to B.
                button = GameButton.B;
                break;
            case 192:  // `. Start button for now.
                button = GameButton.Start;
                break;
            default:
                break;
        }

        if (button !== null) {
            this.pressOrRelease(button, event.type === 'keydown');
        }
    }

    private handleMouseA(event: MouseEvent) {
        this.pressOrRelease(GameButton.A, event.type === 'mousedown');
    }

    private handleMouseB(event: MouseEvent) {
        this.pressOrRelease(GameButton.B, event.type === 'mousedown');
    }

    private handleMouseDown(event: MouseEvent) {
        this.pressOrRelease(GameButton.Down, event.type === 'mousedown');
    }

    private handleMouseLeft(event: MouseEvent) {
        this.pressOrRelease(GameButton.Left, event.type === 'mousedown');
    }

    private handleMouseRight(event: MouseEvent) {
        this.pressOrRelease(GameButton.Right, event.type === 'mousedown');
    }

    private handleMouseStart(event: MouseEvent) {
        this.pressOrRelease(GameButton.Start, event.type === 'mousedown');
    }

    private handleMouseUp(event: MouseEvent) {
        this.pressOrRelease(GameButton.Up, event.type === 'mousedown');
    }
    
    private pressOrRelease(button: GameButton, press: boolean) {
        this.pressed[button] = press;

        if (isArrow(button)) {
            const index = this.arrowStack.indexOf(button);
            if (press && (index === -1)) {
                this.arrowStack.push(button);
            } else if (!press) {
                this.arrowStack.splice(index, 1);
            }
        }
    }
}

function isArrow(button: GameButton): boolean {
    return [
        GameButton.Down,
        GameButton.Left,
        GameButton.Right,
        GameButton.Up
    ].indexOf(button) > -1;
}
