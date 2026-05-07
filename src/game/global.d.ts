import { LevelEngine } from './classes/LevelEngine';
import { DiceHandler } from './classes/DiceHandler';

declare global {
    interface Window {
        levelEngine?: LevelEngine;
        diceHandler?: DiceHandler;
        diceCollection?: DiceCollection;
    }
}

export {};