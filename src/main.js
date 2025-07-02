import Phaser from 'phaser'
import Boot from './scenes/Boot.js'
import Preloader from './scenes/Preloader.js'
import EscMenu from './scenes/EscMenu.js'
import Inventory from './scenes/Inventory.js'
import PlayerUI from './scenes/playerUI.js'
import Home from './scenes/Home.js'
import Level1 from './scenes/Level1.js'
import Level2 from './scenes/Level2.js'
import Level3 from './scenes/Level3.js'
import Level4 from './scenes/Level4.js'
import Level5 from './scenes/Level5.js'
import Level6 from './scenes/Level6.js'
import LevelYaya1 from './scenes/LevelYaya1.js'
import Level7 from './scenes/Leve7.js'

/// <reference path="../types/phaser.d.ts" />


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
        // fps: 60,
        // fixedStep: true,
        tileBias: 55,
        debug: false,
      }
    },
    parent: 'body',
    dom: {
      createContainer: true,
    },
    scene: [Boot, Preloader, Home, Level1, Level2, Level3, Level4, Level5, Level6, Level7, LevelYaya1,
      PlayerUI, Inventory, EscMenu],
};

let game = new Phaser.Game(config);