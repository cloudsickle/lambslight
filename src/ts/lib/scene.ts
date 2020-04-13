import * as device from './device.js';
import * as utils  from './utils.js';

export function developer(screen: device.GameScreen): Promise<void> {
    screen.foreground.fillStyle = '#000000';
    screen.foreground.fillRect(0, 0, screen.width, screen.height);

    const points: [number, number][] = [
        [109, 72], [109, 71], [109, 70], [109, 69], [110, 68], [110, 67],
        [110, 66], [111, 65], [111, 64], [112, 63], [113, 62], [114, 61],
        [115, 61], [116, 60], [117, 60], [118, 60], [119, 60], [120, 60],
        [121, 60], [122, 61], [123, 61], [124, 62], [124, 63], [125, 64]
    ];

    return new Promise((resolve) => {
        let bg = new Image();
        bg.onload = async () => {
            screen.background.drawImage(bg, 0, 0);
            await screen.foreground.fade('#000000', 1000, false);

            screen.foreground.fillStyle = '#cbdbfc';
            await screen.foreground.trace(points, 100, 3);

            await screen.foreground.fade('#000000', 1000, true);
            screen.background.clear();
            resolve();
        };
        bg.src = '../../assets/images/cloudsickle.png';
    });
}

export function gameLogo(screen: device.GameScreen): Promise<void> {
    screen.foreground.fillStyle = '#000000';
    screen.foreground.fillRect(0, 0, screen.width, screen.height);

    return new Promise((resolve) => {
        let logo = new Image();
        logo.onload = async () => {
            screen.background.fillStyle = '#222034';
            screen.background.fillRect(0, 0, screen.width, screen.height);
            screen.background.drawImage(logo, 16, 58);
            await screen.foreground.fade('#000000', 1000, false);
            await utils.sleep(2000);
            setTimeout(function() {
                let pressStart = new Image();
                pressStart.onload = () => {
                    screen.background.drawImage(pressStart, 88, 136);
                    resolve();
                };
                pressStart.src = '../../assets/images/pressstart.png';
            }, 2000);
        };
        logo.src = '../../assets/images/lambslight.png';
    });
}