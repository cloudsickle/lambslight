import * as device from './device.js';
import * as utils  from './utils.js';

export class Scene {
    map  : SceneMap;
    tiles: HTMLImageElement;

    // FIXME: Move to load() method or use .ready attrirbute to allow load time.
    constructor(sceneAsset: string) {
        this.map = <SceneMap> JSON.parse(sceneAsset);

        this.tiles     = new Image();
        this.tiles.src = this.map.imageAsset;
    }

    canMoveTo(position: utils.Position): boolean {
        return this.map.collision[this.tileIndex(position.x, position.y)] === 0;
    }

    // TODO: Should the rendering responsibility be moved elsewhere? Camera?
    render(screen: device.GameScreen, topLeft: utils.Position): void {
        const tSize = this.map.tSize;
        const endX  = topLeft.x + (screen.width /this.map.tSize);
        const endY  = topLeft.y + (screen.height/this.map.tSize);

        for (let x = topLeft.x; x < endX; x++) {
            for (let y = 0; y < endY; y++) {
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
    }

    tileIndex(x: number, y: number): number {
        return y*this.map.width + x;
    }
}

interface SceneMap {
    height    : number;
    width     : number;
    tSize     : number;
    imageAsset: string;
    collision : number[];
    background: number[];
    foreground: number[];
}
