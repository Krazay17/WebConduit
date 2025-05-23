import Boot from './Scenes/Boot.js';
import Preloader from './Scenes/Preloader.js';
import EscMenu from './Scenes/EscMenu.js';
import Inventory from './Scenes/Inventory.js';
import Home from './Scenes/Home.js';
import Level1 from './Scenes/Level1.js';
import Level3 from './Scenes/Level3.js';


const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#000000',
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: {y: 720, x: 0},
        timescale: 1,
        fps: 60,
        fixedStep: true,
        debug: false,
      }
    },
    scene: [Boot, Preloader, Home, Level1, Level3,
      Inventory, EscMenu],
};

let game = new Phaser.Game(config);