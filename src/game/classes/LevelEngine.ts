import type { GameObjects, Scene } from 'phaser';
import { Enemy } from '../base classes/Enemy';
import { DiceHandler } from './DiceHandler';
import { EnemyLabelKey, t } from '../labels';
import { EnemyCollection } from '../collection classes/EnemyCollection';
import { ArtifactHandler } from './ArtifactHandler';

export class LevelEngine {
    scene: Scene;
    currentEnemy : Enemy;
    currentLevel : number;
    remainingThrows: number;
    bonusThrows: number = 0;
    enemySprite: GameObjects.Sprite;
    enemyCollection: EnemyCollection;
    artifactHandler: ArtifactHandler;
    isEndlessMode: boolean = false;

    constructor(scene: Scene) {
        this.scene = scene;
        this.artifactHandler = window.artifactHandler as ArtifactHandler;
        this.enemyCollection = window.enemyCollection as EnemyCollection;
        this.currentLevel = 0;
        this.remainingThrows = 3;
        this.bonusThrows = 0;
    }
    
    startLevel(level: number) {
        if (this.enemySprite) {
            this.enemySprite.destroy();
        }

        switch (level) {
            case 1:
                this.currentEnemy = new Enemy('enemy.name.slime', 16, 'slime_green_idle', 'slime_green_damage_low', 'slime_green_damage_high', 'slime_green_win', 'slime_green_dead');
                this.enemySprite= this.scene.add.sprite(1048, 550, this.currentEnemy.idleTexture);
                this.enemySprite.setScale(0.25, 0.25);
                break;
            case 2:
                this.currentEnemy = new Enemy('enemy.name.skeleton', 26, 'skeleton_idle', 'skeleton_damage_low', 'skeleton_damage_high', 'skeleton_win', 'skeleton_dead');
                this.enemySprite= this.scene.add.sprite(1048, 550, this.currentEnemy.idleTexture);
                this.enemySprite.setScale(0.25, 0.25);
                break;
            case 3:
                this.currentEnemy = new Enemy('enemy.name.goblin', 36, 'goblin_green_idle', 'goblin_green_damage_low', 'goblin_green_damage_high', 'goblin_green_win', 'goblin_green_dead');
                this.enemySprite= this.scene.add.sprite(1048, 550, this.currentEnemy.idleTexture);
                this.enemySprite.setScale(0.25, 0.25);
                break;
            case 4:
                this.currentEnemy = new Enemy('enemy.name.dwarf', 48, 'dwarf_idle', 'dwarf_damage_low', 'dwarf_damage_high', 'dwarf_win', 'dwarf_dead');
                this.enemySprite= this.scene.add.sprite(1048, 550, this.currentEnemy.idleTexture);
                this.enemySprite.setScale(0.25, 0.25);
                break;
            case 5:
                this.currentEnemy = new Enemy('enemy.name.vampire', 60, 'vampire_idle', 'vampire_damage_low', 'vampire_damage_high', 'vampire_win', 'vampire_dead');
                this.enemySprite= this.scene.add.sprite(1048, 520, this.currentEnemy.idleTexture);
                this.enemySprite.setScale(0.25, 0.25);
                break;
            default:      
                this.generateEndlessLevel(level);
                break;  
           }
    }

    updateEnemyTexture(lastThrow: boolean) {
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

    generateEndlessLevel(level: number) {
        const newHp = Math.floor(50 + 2 * (level - 5) + 1.2 * Math.pow(level - 5, 2));
        var template = this.enemyCollection.getEnemyTemplateByNumber(level - 6);
        const newEnemy = new Enemy(template.name as EnemyLabelKey, newHp, template.idleTexture, template.lowDamageTexture, template.highDamageTexture, template.winTexture, template.deadTexture);
        this.currentEnemy = newEnemy;
        this.enemySprite= this.scene.add.sprite(1048, 550, this.currentEnemy.idleTexture);
        this.enemySprite.setScale(0.25, 0.25);
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
        return t(this.currentEnemy.name);
    }

    healEnemy(amount: number, lastThrow: boolean) {
        if (!this.currentEnemy) return;
        this.currentEnemy.currentHitPoints = Math.min(this.currentEnemy.currentHitPoints + amount, this.currentEnemy.maxHitPoints);
        this.updateEnemyTexture(lastThrow);
    }

    reset() {
        this.currentLevel = 0;
        this.remainingThrows = 3;
        this.bonusThrows = 0;
        this.isEndlessMode = false;
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

    getSpecialScene(): 'Merchant' | 'Magician' | null {
        console.log('Checking for special scene on level', this.currentLevel);
        if (this.currentLevel < 5) {
            return null;
        }

        console.log('Level for special scene:', this.currentLevel);
        console.log('Offset % 4:', this.currentLevel % 4);
        if (this.currentLevel % 4 === 3) {
            return 'Magician';
        }
        
        console.log('Offset % 2:', this.currentLevel % 2);
        if (this.currentLevel % 2 === 1) {
            return 'Merchant';
        }

        return null;
    }

    addBonusThrow(): void {
        if (this.bonusThrows < 3) {
            this.bonusThrows++;
        }
    }

    useBonusThrow(): boolean {
        if (this.bonusThrows > 0) {
            this.bonusThrows--;
            return true;
        }
        return false;
    }

    getAvailableThrows(): number {
        return this.remainingThrows + this.bonusThrows;
    }
}