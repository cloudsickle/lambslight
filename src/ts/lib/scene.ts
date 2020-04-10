import * as device from './device.js';
import * as utils  from './utils.js';

export class Scene {
    map: SceneMap;

    constructor(asset: string) {
        this.map = <SceneMap> JSON.parse(asset);
    }

    canMoveTo(position: utils.Position) {
        return this.map.collision[this.tileIndex(position.x, position.y)] === 0;
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

// TODO: Can this really be used instead of a Promise?
async function load(asset: string) {
    return new Scene(asset);
}
