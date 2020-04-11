import * as device from './device.js';
import * as utils  from './utils.js';

export class Scene {
    isRendered : boolean;
    map        : SceneMap | null;
    tiles      : HTMLImageElement;
    lastTopLeft: utils.Position | null;

    // FIXME: Move to load() method or use .ready attrirbute to allow load time.
    constructor(sceneAsset: string) {
        this.isRendered = false;

        let req = new XMLHttpRequest();
        req.open('GET', '../../assets/scenes/' + sceneAsset);
        req.responseType = 'text';
        req.send();
        req.onload = () => {
            this.map = <SceneMap> JSON.parse(req.response);
        }
        req.onerror = () => {
            throw 'Error loading scene.'
        }

        this.lastTopLeft = null;

        this.tiles     = new Image();
        this.tiles.src = this.map.imageAsset;
    }

    canMoveTo(position: utils.Position): boolean {
        return this.map.collision[this.tileIndex(position.x, position.y)] === 0;
    }

    // TODO: Should the rendering responsibility be moved elsewhere? Camera?
    render(screen: device.GameScreen, topLeft: utils.Position): void {
        /*
         * There are two cases in rendering the screen. Either the screen has
         * already been rendered, or it's blank. If the screen is blank, render
         * the map to the entire screen. If the screen has already been
         * rendered, then it is shifted and two rectangles are rendered to fill
         * in the remaining screen area.
         */
        if (this.lastTopLeft === null) {
            this.renderRect(
                screen, 
                topLeft,
                screen.width /this.map.tSize,
                screen.height/this.map.tSize
            );
        } else {
            // FIXME: Calculate hx, hy, vx, vy so code below works.
            let dx = this.lastTopLeft.x - topLeft.x;
            let dy = this.lastTopLeft.y - topLeft.y;

            let hx: number = 0;
            let hy: number = 0;
            let vx: number = 0;
            let vy: number = 0;
            if (dx > 0) {
                hx = topLeft.x + screen.width - dx;
                vx = 0;
            } else {
                hx = topLeft.x + dx;
                vx = 0;
            }
            if (dy > 0) {
                hy = 0;
                vy = 0;
            } else {
                hy = 0;
                vy = 0;
            }

            screen.background.shift(dx, dy);
            screen.mainobject.shift(dx, dy);
            // Fill in the horizontal area.
            this.renderRect(
                screen, 
                new utils.Position(hx, hy),
                screen.width/this.map.tSize,
                Math.abs(dy)/this.map.tSize
            );
            // Fill in the vertical area.
            this.renderRect(
                screen, 
                new utils.Position(vx, vy),
                Math.abs(dx)/this.map.tSize,
                (screen.height - Math.abs(dy))/this.map.tSize
            );
        }

        // TODO: Second rendering method needs to work, then uncomment below.
        // this.lastTopLeft = { ...topLeft };  // TODO: Is spread needed?
    }

    renderRect(screen: device.GameScreen, topLeft: utils.Position, hTiles: number,
               vTiles: number): void {
        const tSize = this.map.tSize;
        const endX  = topLeft.x + hTiles;
        const endY  = topLeft.y + vTiles;

        for (let x = topLeft.x; x < endX; x++) {
            for (let y = topLeft.y; y < endY; y++) {
                const tIndex = this.tileIndex(x, y);
                const bgTile = this.map.background[tIndex];
                const moTile = this.map.mainobject[tIndex];

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

                if (moTile > 0) {
                    screen.background.drawImage(
                        this.tiles,
                        (moTile % tSize)*tSize,
                        Math.floor(moTile/tSize)*tSize,
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

    tileIndex(x: number, y: number): number {
        return y*this.map.width + x;
    }
}

interface SceneMap {
    background: number[];
    collision : number[];
    height    : number;
    imageAsset: string;
    mainobject: number[];
    startTopX : number;
    startTopY : number;
    tSize     : number;
    width     : number;
}
