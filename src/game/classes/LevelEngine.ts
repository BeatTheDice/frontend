import { Scene } from 'phaser';
import { Enemy } from './Enemy';
import { DiceHandler } from './DiceHandler';
import { EnemyLabelKey, t } from '../labels';
import { EnemyCollection } from './EnemyCollection';
import { Artifact } from './Artifact';

export class LevelEngine {
    scene: Scene;
    currentEnemy : Enemy;
    currentLevel : number;
    remainingThrows: number;
    bonusThrows: number = 0;
    enemySprite: Phaser.GameObjects.Sprite;
    enemyCollection: EnemyCollection;
    hasArtifact: boolean = false;
    currentArtifact: Artifact | null = null;
    isEndlessMode: boolean = false;
    
    constructor(scene: Scene) {
        this.scene = scene;
        this.currentLevel = 0;
        this.remainingThrows = 3;
        this.bonusThrows = 0;
        this.enemyCollection = window.enemyCollection as EnemyCollection;
    }
    
    startLevel(level: number) {       
        // Entferne alten Enemy-Sprite, falls vorhanden
        if (this.enemySprite) {
            this.enemySprite.destroy();
        }

        switch (level) {
            case 1:
                this.currentEnemy = new Enemy('enemy.name.slime', 16, 'slime_green_idle', 'slime_green_damage_low', 'slime_green_damage_high', 'slime_green_win', 'slime_green_dead'); //TODO Passende Leben
                this.enemySprite= this.scene.add.sprite(1048, 550, this.currentEnemy.idleTexture);
                this.enemySprite.setScale(0.25, 0.25);
                break;
            case 2:
                this.currentEnemy = new Enemy('enemy.name.skeleton',26, 'skeleton_idle', 'skeleton_damage_low', 'skeleton_damage_high', 'skeleton_win', 'skeleton_dead'); //TODO Passende Leben
                this.enemySprite= this.scene.add.sprite(1048, 550, this.currentEnemy.idleTexture);
                this.enemySprite.setScale(0.25, 0.25);
                break;
            case 3:
                this.currentEnemy = new Enemy('enemy.name.goblin', 36, 'goblin_green_idle', 'goblin_green_damage_low', 'goblin_green_damage_high', 'goblin_green_win', 'goblin_green_dead'); //TODO Passende Leben
                this.enemySprite= this.scene.add.sprite(1048, 550, this.currentEnemy.idleTexture);
                this.enemySprite.setScale(0.25, 0.25);
                break;
            case 4:
                this.currentEnemy = new Enemy('enemy.name.dwarf', 48, 'dwarf_idle', 'dwarf_damage_low', 'dwarf_damage_high', 'dwarf_win', 'dwarf_dead'); //TODO Passende Leben
                this.enemySprite= this.scene.add.sprite(1048, 550, this.currentEnemy.idleTexture);
                this.enemySprite.setScale(0.25, 0.25);
                break;
            case 5:
                this.currentEnemy = new Enemy('enemy.name.vampire', 60, 'vampire_idle', 'vampire_damage_low', 'vampire_damage_high', 'vampire_victory', 'vampire_dead');
                this.enemySprite= this.scene.add.sprite(1048, 520, this.currentEnemy.idleTexture);
                this.enemySprite.setScale(0.25, 0.25);
                break;
            default:      
                this.generateEndlessLevel(level);
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

    generateEndlessLevel(level: number) {
        const newHp = Math.floor(60 + 2 * (level - 5) + 1.2 * Math.pow(level - 5, 2));
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
        this.hasArtifact = false;
        this.currentArtifact = null;
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

    /**
     * Prüft, ob ein Merchant nach diesem Level erscheinen soll
     * Merchant kommt am Start des Endlos-Modus (nach Level 5) und dann alle 10 Level
     * Also nach Level 5, 15, 25, 35...
     */
    shouldShowMerchant(): boolean {
        if (!this.isEndlessMode) return false;
        if (this.currentLevel === 5) return true;
        if (this.currentLevel > 5 && (this.currentLevel - 5) % 10 === 0) return true;
        return false;
    }

    /**
     * Prüft, ob ein Magician nach diesem Level erscheinen soll
     * Magician kommt nach Level 10 und dann alle 10 Level
     * Also nach Level 10, 20, 30, 40...
     */
    shouldShowMagician(): boolean {
        if (!this.isEndlessMode) return false;
        if (this.currentLevel < 10) return false;
        if ((this.currentLevel - 10) % 10 === 0) return true;
        return false;
    }

    /**
     * Prüft, ob nach diesem Level eine Würfel-Belohnung erscheinen soll
     * Im Endlos-Modus jeden 2. Level ab Level 6 (Level 6, 8, 10, 12...)
     */
    shouldShowReward(): boolean {
        if (!this.isEndlessMode) return false;
        if (this.currentLevel < 7) return false;
        if ((this.currentLevel - 7) % 2 === 0) return true;
        return false;
    }

    /**
     * Sammelt einen Bonus-Wurf (wird bei Kritischen Treffern aufgerufen)
     * Maximum 3 Bonus-Würfe
     */
    addBonusThrow(): void {
        if (this.hasArtifact && this.bonusThrows < 3) {
            this.bonusThrows++;
        }
    }

    /**
     * Nutzt einen Bonus-Wurf
     */
    useBonusThrow(): boolean {
        if (this.bonusThrows > 0) {
            this.bonusThrows--;
            return true;
        }
        return false;
    }

    /**
     * Getter für verfügbare Würfe (Normal + Bonus)
     */
    getAvailableThrows(): number {
        return this.remainingThrows + this.bonusThrows;
    }
}