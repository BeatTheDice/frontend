import { Scene,  } from 'phaser';
import { Enemy } from './Enemy';

export class LevelEngine {
    scene: Scene;
    currentEnemy : Enemy;
    currentLevel : number;
    remainingThrows: number;
    enemySprite: Phaser.GameObjects.Sprite;

    constructor(scene: Scene) {
        this.scene = scene;
        this.currentLevel = 0;
        this.remainingThrows = 3;
    }
    
    startLevel(level: number) {       
        // Entferne alten Enemy-Sprite, falls vorhanden
        if (this.enemySprite) {
            this.enemySprite.destroy();
        }

        switch (level) {
            case 1:
                this.currentEnemy = new Enemy('Slime', 15 + level, 'slime_idle', 'slime_damage_low', 'slime_damage_high', 'slime_win', 'slime_dead'); //TODO Passende Leben
                this.enemySprite= this.scene.add.sprite(1048, 620, this.currentEnemy.idleTexture);
                this.enemySprite.setScale(0.25, 0.25);
                break;
            case 2:
                this.currentEnemy = new Enemy('Skeleton', 20 + level, 'skeleton_idle', 'skeleton_damage_low', 'skeleton_damage_high', 'skeleton_win', 'skeleton_dead'); //TODO Passende Leben
                this.enemySprite= this.scene.add.sprite(1048, 520, this.currentEnemy.idleTexture);
                this.enemySprite.setScale(0.25, 0.25);
                break;
            case 3:
                this.currentEnemy = new Enemy('Goblin', 25 + level, 'goblin_idle', 'goblin_damage_low', 'goblin_damage_high', 'goblin_win', 'goblin_dead'); //TODO Passende Leben
                this.enemySprite= this.scene.add.sprite(1048, 520, this.currentEnemy.idleTexture);
                this.enemySprite.setScale(0.25, 0.25);
                break;
            case 4:
                this.currentEnemy = new Enemy('Dwarf', 30 + level, 'dwarf_idle', 'dwarf_damage_low', 'dwarf_damage_high', 'dwarf_win', 'dwarf_dead'); //TODO Passende Leben
                this.enemySprite= this.scene.add.sprite(1048, 520, this.currentEnemy.idleTexture);
                this.enemySprite.setScale(0.25, 0.25);
                break;
            default:      
                this.currentEnemy = new Enemy('Dwarf', 35 + level, 'dwarf_idle', 'dwarf_damage_low', 'dwarf_damage_high', 'dwarf_win', 'dwarf_dead'); //TODO Passende Leben
                this.enemySprite= this.scene.add.sprite(1048, 520, this.currentEnemy.idleTexture);
                this.enemySprite.setScale(0.25, 0.25);
                break;  
           }
    }

    updateEnemyTexture() {
        // Ensure scene is set
        if (!this.scene) {
            console.error('Scene is not set in LevelEngine');
            return;
        }

        const percentageHitpoints = this.currentEnemy.currentHitPoints / this.currentEnemy.maxHitPoints;
        switch (true) {
            case percentageHitpoints === 0:
                this.enemySprite.setTexture(this.currentEnemy.deadTexture);
                break;
            case percentageHitpoints <= 0.5:
                this.enemySprite.setTexture(this.currentEnemy.highDamageTexture);
                break;
            case percentageHitpoints < 1:
                this.enemySprite.setTexture(this.currentEnemy.lowDamageTexture);
                break;
            default:
                this.enemySprite.setTexture(this.currentEnemy.idleTexture);
                break;
        }
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

    nextLevel() {
        this.currentLevel++;
        this.remainingThrows = 3;
        this.startLevel(this.currentLevel);
    }

    getEnemyName() {
        return this.currentEnemy.name;
    }
}