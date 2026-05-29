import { LevelEngine } from './classes/LevelEngine';
import { DiceHandler } from './classes/DiceHandler';
import { DiceCollection } from './collection classes/DiceCollection';

declare global {
    interface Window {
        levelEngine?: LevelEngine;
        diceHandler?: DiceHandler;
        diceCollection?: DiceCollection;
        enemyCollection?: EnemyCollection;
    }
}

export {};