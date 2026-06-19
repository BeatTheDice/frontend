import type { GameObjects, Scene } from 'phaser';
import { Enemy } from '../base classes/Enemy';
import { DiceHandler } from './DiceHandler';
import { EnemyLabelKey, t } from '../labels';
import { EnemyCollection } from '../collection classes/EnemyCollection';
import { ArtifactHandler } from './ArtifactHandler';

// --- Endlosmodus: HP-Skalierung der Gegner ---
// Level 1-5 sind fest definiert. Ab Level 6 werden Gegner prozedural erzeugt und
// ihre HP wachsen quadratisch mit der Endlos-Stufe n (= Level - LAST_FIXED_LEVEL):
//   HP = ENDLESS_BASE_HP + ENDLESS_HP_LINEAR_FACTOR * n + ENDLESS_HP_QUADRATIC_FACTOR * n^2
//
// Warum kombiniert linear + quadratisch (und nicht nur eins davon)?
//  - Rein LINEAR (base + a*n): konstante Steigung -> die Schwierigkeit steigt gleich
//    schnell wie der Schadens-Output des Spielers. Der Lauf wird nie wirklich schwerer
//    und koennte theoretisch ewig weitergehen -> kein natuerliches Ende.
//  - Rein QUADRATISCH (base + c*n^2): die Kurve ist bei kleinem n fast flach
//    (n^2 ~ 0), die ersten Endlos-Level fuehlen sich also kaum schwerer an ("toter"
//    Anfang), danach explodiert sie schlagartig.
//  - KOMBINIERT: Der lineare Term garantiert von der ersten Stufe an einen spuerbaren,
//    gleichmaessigen Zuwachs (kein flacher Start), waehrend der quadratische Term die
//    Schwierigkeit beschleunigt, sodass jeder Lauf irgendwann zwangslaeufig endet
//    (weicher Soft-Cap). Ergebnis: eine glatte, stetig ansteigende und sich
//    beschleunigende Schwierigkeitskurve.
// ENDLESS_BASE_HP ist dabei so gewaehlt, dass der erste Endlos-Gegner (~53 HP) nahtlos
// an den letzten festen Gegner (Vampir, 60 HP auf Level 5) anschliesst.
const LAST_FIXED_LEVEL = 5;              // letztes fest definiertes Level; Endlosmodus beginnt ab Level 6
const ENDLESS_BASE_HP = 50;              // Basis-HP des ersten Endlos-Gegners
const ENDLESS_HP_LINEAR_FACTOR = 2;      // linearer HP-Zuwachs pro Endlos-Stufe
const ENDLESS_HP_QUADRATIC_FACTOR = 1.2; // quadratischer HP-Zuwachs (greift bei hohen Leveln stark)

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

    gameWindow = globalThis as typeof globalThis & Window;

    constructor(scene: Scene) {
        this.scene = scene;
        this.artifactHandler = this.gameWindow.artifactHandler as ArtifactHandler;
        this.enemyCollection = this.gameWindow.enemyCollection as EnemyCollection;
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

    updateEnemyTexture() {
        if (!this.scene) {
            console.error('Scene is not set in LevelEngine');
            return;
        }

        if (!this.hasAvailableThrows() && this.currentEnemy.currentHitPoints > 0) {
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
        // Endlos-Stufe relativ zum letzten festen Level (Level 6 -> Stufe 1, Level 7 -> Stufe 2, ...)
        const endlessStage = level - LAST_FIXED_LEVEL;
        // HP = Basis + linearer Anteil + quadratischer Anteil, auf ganze HP abgerundet
        const newHp = Math.floor(
            ENDLESS_BASE_HP +
            ENDLESS_HP_LINEAR_FACTOR * endlessStage +
            ENDLESS_HP_QUADRATIC_FACTOR * Math.pow(endlessStage, 2)
        );
        // Gegner-Template anhand des 0-basierten Index wählen (Level 6 -> Template 0)
        let template = this.enemyCollection.getEnemyTemplateByNumber(endlessStage - 1);
        this.currentEnemy = new Enemy(template.name as EnemyLabelKey, newHp, template.idleTexture, template.lowDamageTexture, template.highDamageTexture, template.winTexture, template.deadTexture);
        this.enemySprite= this.scene.add.sprite(1048, 550, this.currentEnemy.idleTexture);
        this.enemySprite.setScale(0.25, 0.25);
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
        return t(this.currentEnemy.name);
    }

    healEnemy(amount: number) {
        if (!this.currentEnemy) return;
        this.currentEnemy.currentHitPoints = Math.min(this.currentEnemy.currentHitPoints + amount, this.currentEnemy.maxHitPoints);
        this.updateEnemyTexture();
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
        if (!this.isEndlessMode) {
            return;
        }

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

    hasAvailableThrows(): boolean {
        return this.getAvailableThrows() > 0;
    }
}