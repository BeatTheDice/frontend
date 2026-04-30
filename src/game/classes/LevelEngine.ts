import { Scene,  } from 'phaser';
import { Enemy } from './Enemy';
import { DiceHandler } from './DiceHandler';

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
                this.currentEnemy = new Enemy('Slime', 18, 'slime_idle', 'slime_damage_low', 'slime_damage_high', 'slime_win', 'slime_dead'); //TODO Passende Leben
                this.enemySprite= this.scene.add.sprite(1048, 620, this.currentEnemy.idleTexture);
                this.enemySprite.setScale(0.25, 0.25);
                break;
            case 2:
                this.currentEnemy = new Enemy('Skeleton',30, 'skeleton_idle', 'skeleton_damage_low', 'skeleton_damage_high', 'skeleton_win', 'skeleton_dead'); //TODO Passende Leben
                this.enemySprite= this.scene.add.sprite(1048, 520, this.currentEnemy.idleTexture);
                this.enemySprite.setScale(0.25, 0.25);
                break;
            case 3:
                this.currentEnemy = new Enemy('Goblin', 43, 'goblin_idle', 'goblin_damage_low', 'goblin_damage_high', 'goblin_win', 'goblin_dead'); //TODO Passende Leben
                this.enemySprite= this.scene.add.sprite(1048, 520, this.currentEnemy.idleTexture);
                this.enemySprite.setScale(0.25, 0.25);
                break;
            case 4:
                this.currentEnemy = new Enemy('Dwarf', 60, 'dwarf_idle', 'dwarf_damage_low', 'dwarf_damage_high', 'dwarf_win', 'dwarf_dead'); //TODO Passende Leben
                this.enemySprite= this.scene.add.sprite(1048, 520, this.currentEnemy.idleTexture);
                this.enemySprite.setScale(0.25, 0.25);
                break;
            case 5:
                this.currentEnemy = new Enemy('Vampire', 70, 'vampire_idle', 'vampire_hit_light', 'vampire_hit_heavy', 'vampire_victory', 'vampire_dead');
                this.enemySprite= this.scene.add.sprite(1048, 520, this.currentEnemy.idleTexture);
                this.enemySprite.setScale(1.1, 1.1);
                break;
            default:      
                this.currentEnemy = new Enemy('Dwarf', 35 + level, 'dwarf_idle', 'dwarf_damage_low', 'dwarf_damage_high', 'dwarf_win', 'dwarf_dead'); //TODO Passende Leben
                this.enemySprite= this.scene.add.sprite(1048, 520, this.currentEnemy.idleTexture);
                this.enemySprite.setScale(0.25, 0.25);
                break;  
           }
    }

    updateEnemyTexture(lastThrow: boolean) {
        // Ensure scene is set
        if (!this.scene) {
            console.error('Scene is not set in LevelEngine');
            return;
        }

        if (lastThrow && this.currentEnemy.currentHitPoints > 0) {
            this.enemySprite.setTexture(this.currentEnemy.winTexture);
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

    dealDamageToEnemy(damage: number, lastThrow: boolean) {
        if (damage >= this.currentEnemy.currentHitPoints) {
            this.currentEnemy.currentHitPoints = 0;
        }
        else {
            this.currentEnemy.currentHitPoints -= damage;
        }
        this.updateEnemyTexture(lastThrow);
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

    healEnemy(amount: number) {
        if (!this.currentEnemy) return;
        this.currentEnemy.currentHitPoints = Math.min(this.currentEnemy.currentHitPoints + amount, this.currentEnemy.maxHitPoints);
        this.updateEnemyTexture(false);
    }

    reset() {
        this.currentLevel = 0;
        this.remainingThrows = 3;
        if (this.enemySprite) {
            this.enemySprite.destroy();
        }
        window.diceHandler = new DiceHandler(this.scene);
    }

    setEnemyWinTexture() {
        if (this.enemySprite) {
            this.enemySprite.setTexture(this.currentEnemy.winTexture);
        }
    }
}