/**
 * The poorly named utils module collects several short functions and
 * classes that are used throughout the larger package.
 */
/**
 * Define a simple direction enum. This is used for sprite movement and
 * rendering.
 */
export var Direction;
(function (Direction) {
    Direction[Direction["N"] = 0] = "N";
    Direction[Direction["E"] = 1] = "E";
    Direction[Direction["S"] = 2] = "S";
    Direction[Direction["W"] = 3] = "W";
})(Direction || (Direction = {}));
/**
 * Infamous point-like class.
 */
export class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.x = x;
        this.y = y;
    }
}
/**
 * Convert a hex color string (#000000) to r, g, b values.
 */
export function hexToRGB(colorcode) {
    const hex = parseInt(colorcode.slice(1), 16);
    const r = (hex >> 16) & 255;
    const g = (hex >> 8) & 255;
    const b = hex & 255;
    return [r, g, b];
}
/**
 * Sleeps for t milliseconds. Usage: await sleep(10);
 */
export function sleep(t) {
    return new Promise((resolve) => setTimeout(resolve, t));
}
//# sourceMappingURL=utils.js.map