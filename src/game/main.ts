import { Boot } from './setup/Boot';
import { DiceList } from './scenes/DiceList';
import { GameOver } from './scenes/GameOver';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { Reward } from './scenes/Reward';
import { Winner } from './scenes/Winner';
import { Merchant } from './scenes/Merchant';
import { Magician } from './scenes/Magician';
import { AUTO, Game, Scale, type Types } from 'phaser';
import { Preloader } from './setup/Preloader';

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Types.Core.GameConfig = {
    type: AUTO,
    width: 1536,
    height: 1024,
    parent: 'game-container',
    backgroundColor: '#000000',
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH,
        expandParent: true
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        DiceList,
        MainGame,
        Reward,
        Winner,
        GameOver,
        Merchant,
        Magician
    ]
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;
