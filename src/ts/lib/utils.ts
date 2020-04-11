/**
 * The poorly named utils module collects several short functions and
 * classes that are used throughout the larger package.
 */

/**
 * Define a simple direction enum. This is used for sprite movement and
 * rendering.
 */
export enum Direction {
    N,
    E,
    S,
    W
}

/**
 * Infamous point-like class.
 */
export class Position {
    constructor(public x: number, public y: number) {
        this.x = x;
        this.y = y;
    }
}

/**
 * Poisiton class in tile units. Used for type-safety.
 */
export type TilePosition = Position;


/**
 * Convert a hex color string (#000000) to r, g, b values.
 */
export function hexToRGB(colorcode: string): [number, number, number] {
    const hex = parseInt(colorcode.slice(1), 16);
    const r = (hex >> 16) & 255;
    const g = (hex >>  8) & 255;
    const b =         hex & 255;

    return [r, g, b];
}

/**
 * Sleeps for t milliseconds. Usage: await sleep(10);
 */
export function sleep(t: number): Promise<null> {
    return new Promise((resolve) => setTimeout(resolve, t));
}
