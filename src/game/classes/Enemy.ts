import { EnemyLabelKey } from '../labels';

export class Enemy {
    name: EnemyLabelKey;
    currentState: string;
    idleTexture: string;
    lowDamageTexture: string;
    highDamageTexture: string;
    winTexture: string
    deadTexture: string;
    currentHitPoints: number;
    maxHitPoints: number;
    
    constructor(name: EnemyLabelKey, maxHitPoints: number, idleTexture: string, lowDamageTexture: string, highDamageTexture: string, winTexture: string, deadTexture: string) {
        this.currentState = 'idle';
        this.name = name;
        this.maxHitPoints = maxHitPoints;
        this.currentHitPoints = maxHitPoints;
        this.idleTexture = idleTexture;
        this.lowDamageTexture = lowDamageTexture;
        this.highDamageTexture = highDamageTexture;
        this.winTexture = winTexture;
        this.deadTexture = deadTexture;
    }

}