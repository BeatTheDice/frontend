import { LevelEngine } from './classes/LevelEngine';
import { DiceHandler } from './classes/DiceHandler';
import { DiceCollection } from './collection classes/DiceCollection';
import { ArtifactHandler } from './classes/ArtifactHandler';
import { EnemyCollection } from './collection classes/EnemyCollection';

declare global {
    interface Window {
        levelEngine?: LevelEngine;
        diceHandler?: DiceHandler;
        artifactHandler?: ArtifactHandler;
        diceCollection?: DiceCollection;
        enemyCollection?: EnemyCollection;
    }
}

export {};