import * as utils from './utils.js';
export class Scene {
    // FIXME: Move to load() method or use .ready attrirbute to allow load time.
    constructor(sceneAsset) {
        this.isRendered = false;
        console.log('../../assets/scenes/' + sceneAsset);
        let req = new XMLHttpRequest();
        req.open("GET", '../../assets/scenes/' + sceneAsset, false);
        req.send(null);
        this.map = JSON.parse(req.responseText);
        this.lastTopLeft = null;
        this.tiles = new Image();
        this.tiles.src = this.map.imageAsset;
    }
    canMoveTo(position) {
        return this.map.collision[this.tileIndex(position.x, position.y)] === 0;
    }
    // TODO: Should the rendering responsibility be moved elsewhere? Camera?
    render(screen, topLeft) {
        /*
         * There are two cases in rendering the screen. Either the screen has
         * already been rendered, or it's blank. If the screen is blank, render
         * the map to the entire screen. If the screen has already been
         * rendered, then it is shifted and two rectangles are rendered to fill
         * in the remaining screen area.
         */
        if (this.lastTopLeft === null) {
            this.renderRect(screen, topLeft, screen.width / this.map.tSize, screen.height / this.map.tSize);
        }
        else {
            // FIXME: Calculate hx, hy, vx, vy so code below works.
            let dx = this.lastTopLeft.x - topLeft.x;
            let dy = this.lastTopLeft.y - topLeft.y;
            let hx = 0;
            let hy = 0;
            let vx = 0;
            let vy = 0;
            if (dx > 0) {
                hx = topLeft.x + screen.width - dx;
                vx = 0;
            }
            else {
                hx = topLeft.x + dx;
                vx = 0;
            }
            if (dy > 0) {
                hy = 0;
                vy = 0;
            }
            else {
                hy = 0;
                vy = 0;
            }
            screen.background.shift(dx, dy);
            screen.mainobject.shift(dx, dy);
            // Fill in the horizontal area.
            this.renderRect(screen, new utils.Position(hx, hy), screen.width / this.map.tSize, Math.abs(dy) / this.map.tSize);
            // Fill in the vertical area.
            this.renderRect(screen, new utils.Position(vx, vy), Math.abs(dx) / this.map.tSize, (screen.height - Math.abs(dy)) / this.map.tSize);
        }
        // TODO: Second rendering method needs to work, then uncomment below.
        // this.lastTopLeft = { ...topLeft };  // TODO: Is spread needed?
    }
    renderRect(screen, topLeft, hTiles, vTiles) {
        const tSize = this.map.tSize;
        const endX = topLeft.x + hTiles;
        const endY = topLeft.y + vTiles;
        for (let x = topLeft.x; x < endX; x++) {
            for (let y = topLeft.y; y < endY; y++) {
                const tIndex = this.tileIndex(x, y);
                const bgTile = this.map.background[tIndex];
                const moTile = this.map.mainobject[tIndex];
                screen.background.drawImage(this.tiles, (bgTile % tSize) * tSize, Math.floor(bgTile / tSize) * tSize, tSize, tSize, x * tSize, y * tSize, tSize, tSize);
                if (moTile > 0) {
                    screen.background.drawImage(this.tiles, (moTile % tSize) * tSize, Math.floor(moTile / tSize) * tSize, tSize, tSize, x * tSize, y * tSize, tSize, tSize);
                }
            }
        }
        this.isRendered = true;
    }
    tileIndex(x, y) {
        return y * this.map.width + x;
    }
}
//# sourceMappingURL=scene.js.map