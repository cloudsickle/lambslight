import * as device from './device.js';
import * as utils  from './utils.js';

const TSIZE = 8;

export class Area {
    lastTopLeft: utils.TilePosition | null;
    map        : AreaMap;
    tiles      : HTMLImageElement;

    constructor(map: AreaMap, tiles: HTMLImageElement) {
        this.lastTopLeft = null;
        this.map         = map;
        this.tiles       = tiles;
    }

    canMoveTo(position: utils.TilePosition): boolean {
        // Because the sprite occupies four tiles, all need to be walkable.
        return !(
               this.map.collision[this.tileIndex(position.x    , position.y    )] === 1
            || this.map.collision[this.tileIndex(position.x    , position.y + 1)] === 1
            || this.map.collision[this.tileIndex(position.x + 1, position.y    )] === 1
            || this.map.collision[this.tileIndex(position.x + 1, position.y + 1)] === 1
        );
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

            let gapTopLeft = topLeft.copy();

            if ((Math.abs(dx) + Math.abs(dy)) === 1) {
                if (dx === -1) { gapTopLeft.x += screen.width /TSIZE - 1; }
                if (dy === -1) { gapTopLeft.y += screen.height/TSIZE - 1; }
            } else {
                console.error('Error rendering screen shift.');
                throw 'Error rendering screen shift.'
            }

            screen.background.shift(dx*TSIZE, dy*TSIZE);
            screen.mainobject.shift(dx*TSIZE, dy*TSIZE);

            this.renderRect(
                screen, 
                gapTopLeft,
                Math.max(Math.abs(dy)*(screen.width /TSIZE), 1),
                Math.max(Math.abs(dx)*(screen.height/TSIZE), 1)
            );
        }

        this.lastTopLeft = topLeft.copy();
    }

    renderRect(screen: device.GameScreen, topLeft: utils.TilePosition, hTiles: number,
               vTiles: number): void {

        let offsetX = 0;
        let offsetY = 0;
        if (this.lastTopLeft !== null) {
            offsetX = Math.max(topLeft.x - this.lastTopLeft.x - 1, 0);
            offsetY = Math.max(topLeft.y - this.lastTopLeft.y - 1, 0);
        }
        
        for (let i = 0; i < hTiles; i++) {
            for (let j = 0; j < vTiles; j++) {
                const tIndex = this.tileIndex(topLeft.x + i, topLeft.y + j);
                const bgTile = this.map.background[tIndex];
                const moTile = this.map.mainobject[tIndex];

                console.assert(tIndex < this.map.background.length);

                screen.background.drawImage(
                    this.tiles,
                    (bgTile % this.map.tileMapWidth)*TSIZE,
                    Math.floor(bgTile/this.map.tileMapWidth)*TSIZE,
                    TSIZE,
                    TSIZE,
                    (i + offsetX)*TSIZE,
                    (j + offsetY)*TSIZE,
                    TSIZE,
                    TSIZE
                );

                if (moTile > 0) {
                    screen.mainobject.drawImage(
                        this.tiles,
                        (moTile % this.map.tileMapWidth)*TSIZE,
                        Math.floor(moTile/this.map.tileMapWidth)*TSIZE,
                        TSIZE,
                        TSIZE,
                        (i + offsetX)*TSIZE,
                        (j + offsetY)*TSIZE,
                        TSIZE,
                        TSIZE
                    );
                }
            }
        }
    }

    tileIndex(x: number, y: number): number {
        return y*this.map.width + x;
    }
}

/**
 * Create a new Area from JSON Area data.
 */
export function loadArea(areaAsset: string): Promise<Area> {
    return new Promise((resolve) => {
        let req = new XMLHttpRequest();
        req.open('GET', '../../assets/areas/' + areaAsset);
        req.responseType = 'text';
        req.send();
        req.onload = () => {
            let map   = <AreaMap> JSON.parse(req.response);
            let tiles = new Image();
            tiles.onload = () => {
                resolve(new Area(map, tiles));
            };
            tiles.src = '../../assets/images/' + map.imageAsset;
        };
    });
}

interface AreaMap {
    background   : number[];
    collision    : number[];
    height       : number;
    imageAsset   : string;
    mainobject   : number[];
    startTopLeftX: number;
    startTopLeftY: number;
    tileMapWidth : number;
    width        : number;
}
