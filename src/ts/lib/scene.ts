import * as device from './device.js';
import * as utils  from './utils.js';

const TSIZE = 8;

export class Scene {
    isRendered : boolean;
    lastTopLeft: utils.TilePosition | null;
    map        : SceneMap;
    tiles      : HTMLImageElement;

    constructor(map: SceneMap, tiles: HTMLImageElement) {
        this.isRendered  = false;
        this.lastTopLeft = null;
        this.map         = map;
        this.tiles       = tiles;
    }

    canMoveTo(position: utils.TilePosition): boolean {
        return this.map.collision[this.tileIndex(position.x, position.y)] === 0;
    }

    // TODO: Should the rendering responsibility be moved elsewhere? Camera?
    render(screen: device.GameScreen, topLeft: utils.TilePosition): void {
        /*
         * There are two cases in rendering the screen. Either the screen has
         * already been rendered, or it's blank. If the screen is blank, render
         * the map to the entire screen. If the screen has already been
         * rendered, then it is shifted and the unrendered area is filled in.
         * 
         * This method (and others) depend on three assumptions:
         *     1. Partial map tiles are never rendered.
         *     2. All map tiles are 8x8 px squares.
         *     3. The map is only shifted one row or column at a time.
         */
        if (this.lastTopLeft === null) {
            this.renderRect(
                screen, 
                topLeft,
                screen.width /TSIZE,
                screen.height/TSIZE
            );
        } else {
            let dx = this.lastTopLeft.x - topLeft.x;
            let dy = this.lastTopLeft.y - topLeft.y;

            let gapTopLeft = <utils.TilePosition> { ...this.lastTopLeft };
            let hTiles = Math.abs(dx) === TSIZE ? 1 : 0;
            let vTiles = Math.abs(dy) === TSIZE ? 1 : 0;

            switch (hTiles + vTiles) {
                case 0:
                    console.error('Attempted to render non-TSIZE shift.');
                    throw 'Attempted to render non-TSIZE shift.'
                case 2:
                    console.error('Attempted to render diagonal shift.')
                    throw 'Attempted to render diagonal shift.'
                default:
                    if (dx === -TSIZE) { gapTopLeft.x = screen.width /TSIZE - 1; }
                    if (dy === -TSIZE) { gapTopLeft.y = screen.height/TSIZE - 1; }
                    break;
            }

            screen.background.shift(dx*TSIZE, dy*TSIZE);
            screen.mainobject.shift(dx*TSIZE, dy*TSIZE);

            this.renderRect(
                screen, 
                gapTopLeft,
                hTiles,
                vTiles
            );
        }

        // TODO: This may not be the best way to do this in TypeScript.
        this.lastTopLeft = <utils.TilePosition> { ...topLeft };
    }

    renderRect(screen: device.GameScreen, topLeft: utils.TilePosition, hTiles: number,
               vTiles: number): void {
        const endX  = topLeft.x + hTiles;
        const endY  = topLeft.y + vTiles;

        for (let x = topLeft.x; x < endX; x++) {
            for (let y = topLeft.y; y < endY; y++) {
                const tIndex = this.tileIndex(x, y);
                const bgTile = this.map.background[tIndex];
                const moTile = this.map.mainobject[tIndex];

                screen.background.drawImage(
                    this.tiles,
                    (bgTile % TSIZE)*TSIZE,
                    Math.floor(bgTile/TSIZE)*TSIZE,
                    TSIZE,
                    TSIZE,
                    x*TSIZE,
                    y*TSIZE,
                    TSIZE,
                    TSIZE
                );

                if (moTile > 0) {
                    screen.background.drawImage(
                        this.tiles,
                        (moTile % TSIZE)*TSIZE,
                        Math.floor(moTile/TSIZE)*TSIZE,
                        TSIZE,
                        TSIZE,
                        x*TSIZE,
                        y*TSIZE,
                        TSIZE,
                        TSIZE
                    );
                }
            }
        }

        this.isRendered = true;
    }

    tileIndex(x: number, y: number): number {
        return y*this.map.width + x;
    }
}

/**
 * Create a new Scene from JSON Scene data.
 */
export async function load(sceneAsset: string): Promise<Scene> {
    let req = new XMLHttpRequest();
    req.open('GET', '../../assets/scenes/' + sceneAsset);
    req.responseType = 'text';
    req.send();
    req.onerror = () => {
        throw 'Error loading scene.'
    };
    req.onload = () => {
        let map   = <SceneMap> JSON.parse(req.response);
        let tiles = new Image();
        tiles.onload = () => {
            return new Scene(map, tiles);
        };
        tiles.src = map.imageAsset;
    };
}

interface SceneMap {
    background: number[];
    collision : number[];
    height    : number;
    imageAsset: string;
    mainobject: number[];
    startTopX : number;
    startTopY : number;
    width     : number;
}
