import { Scene,  } from 'phaser';
import { Enemy } from './Enemy';

export class LevelEngine {
    scene: Scene;
    currentEnemy : Enemy;
    currentLevel : number;
    enemySprite: Phaser.GameObjects.Sprite;

    constructor(scene: Scene) {
        this.scene = scene;
        this.currentLevel = 1;
        this.startLevel(this.currentLevel)
    }

    startLevel(level: number) {       
        //Level Nummer wird später genutzt für Prozedurale Formeln von Gegnern etc.  
        this.currentEnemy = new Enemy('Slime', 'slime_idle', 20);
        this.enemySprite= this.scene.add.sprite(1048, 620, this.currentEnemy.texture);
        this.enemySprite.setScale(0.25, 0.25);
    }

    updateEnemyTexture() {
        const percentageHitpoints = this.currentEnemy.currentHitPoints / this.currentEnemy.maxHitPoints;
        switch (true) {
            case percentageHitpoints === 0:
                this.currentEnemy.texture = 'slime_dead';
                break;
            case percentageHitpoints <= 0.5:
                this.currentEnemy.texture = 'slime_damage_high';
                break;
            case percentageHitpoints < 1:
                this.currentEnemy.texture = 'slime_damage_low';
                break;
            default:
                this.currentEnemy.texture = 'slime_idle';
        }
        this.enemySprite.setTexture(this.currentEnemy.texture);
    }

    dealDamageToEnemy(damage: number) {
        if (damage >= this.currentEnemy.currentHitPoints) {
            this.currentEnemy.currentHitPoints = 0;
        }
        else {
            this.currentEnemy.currentHitPoints -= damage;
        }
        this.updateEnemyTexture();
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