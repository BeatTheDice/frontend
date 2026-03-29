import { Scene,  } from 'phaser';
import { Enemy } from './Enemy';

export class LevelEngine {
    scene: Scene;
    currentEnemy : Enemy;
    currentLevel : number;

    constructor(scene: Scene) {
        this.scene = scene;
        this.currentLevel = 1;
        this.startLevel(this.currentLevel)
    }

    startLevel(level: number) {       
        //Level Nummer wird später genutzt für Prozedurale Formeln von Gegnern etc.  
        this.currentEnemy = new Enemy('Slime', 'slime_idle', 20);
        const enemySprite = this.scene.add.sprite(1048, 620, this.currentEnemy.texture);
        enemySprite.setScale(0.25, 0.25);
    }

    getCurrentEnemyHitPoints() {
        return this.currentEnemy.currentHitPoints;
    }

    getEnemyMaxHitPoints() {
        return this.currentEnemy.maxHitPoints;
    }

    getEnemyName() {
        return this.currentEnemy.name;
    }
}