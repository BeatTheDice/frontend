import { LevelEngine } from './classes/LevelEngine';
import { DiceHandler } from './classes/DiceHandler';
import { DiceCollection } from './classes/DiceCollection';

declare global {
    interface Window {
        levelEngine?: LevelEngine;
        diceHandler?: DiceHandler;
        diceCollection?: DiceCollection;
    }
}

export {};