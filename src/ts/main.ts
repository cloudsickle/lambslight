import * as game from './lib/game.js';

async function main() {
    let g: game.Game | null = null;

    try {
        g = new game.Game();
    }
    catch(error) {
        console.error(error);
    }

    g!.load('example.json', 'spritesheet.png').then(() => {
        g!.loop();
    });
}

main();
