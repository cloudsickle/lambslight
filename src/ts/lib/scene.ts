import * as device from './device.js';
import * as utils  from './utils.js';

export class Scene {
    isRendered: boolean;
    map       : SceneMap;
    tiles     : HTMLImageElement;
    topLeft   : utils.Position;

    // FIXME: Move to load() method or use .ready attrirbute to allow load time.
    constructor(sceneAsset: string) {
        this.isRendered = false;

        this.map = <SceneMap> JSON.parse(sceneAsset);
        this.topLeft = new utils.Position(this.map.startTopX, this.map.startTopY);

        this.tiles     = new Image();
        this.tiles.src = this.map.imageAsset;
    }

    canMoveTo(position: utils.Position): boolean {
        return this.map.collision[this.tileIndex(position.x, position.y)] === 0;
    }

    // TODO: Should the rendering responsibility be moved elsewhere? Camera?
    moveView(screen: device.GameScreen, dx: number, dy: number): void {
        this.topLeft.x += dx;
        this.topLeft.y += dy;

        if (!this.isRendered) {
            this.renderFull(screen);
        } else {
            this.renderShift(screen, dx, dy);
        }
    }

    renderFull(screen: device.GameScreen): void {
        const tSize = this.map.tSize;
        const endX  = this.topLeft.x + (screen.width /this.map.tSize);
        const endY  = this.topLeft.y + (screen.height/this.map.tSize);

        for (let x = this.topLeft.x; x < endX; x++) {
            for (let y = this.topLeft.y; y < endY; y++) {
                const tIndex = this.tileIndex(x, y);
                const bgTile = this.map.background[tIndex];
                const fgTile = this.map.foreground[tIndex];

                screen.background.drawImage(
                    this.tiles,
                    (bgTile % tSize)*tSize,
                    Math.floor(bgTile/tSize)*tSize,
                    tSize,
                    tSize,
                    x*tSize,
                    y*tSize,
                    tSize,
                    tSize
                );

                if (fgTile > 0) {
                    screen.background.drawImage(
                        this.tiles,
                        (fgTile % tSize)*tSize,
                        Math.floor(fgTile/tSize)*tSize,
                        tSize,
                        tSize,
                        x*tSize,
                        y*tSize,
                        tSize,
                        tSize
                    );
                }
            }
        }

        this.isRendered = true;
    }

    renderShift(screen: device.GameScreen, dx:number, dy: number): void {
        screen.background.shift(dx, dy);

        if (dx) {
            // FIXME: Render new column(s) on left or right.
        }

        if (dy) {
            // FIXME: Render new row(s) on top or bottom.
        }
    }

    tileIndex(x: number, y: number): number {
        return y*this.map.width + x;
    }
}

interface SceneMap {
    background: number[];
    collision : number[];
    foreground: number[];
    height    : number;
    imageAsset: string;
    startTopX : number;
    startTopY : number;
    tSize     : number;
    width     : number;
}
