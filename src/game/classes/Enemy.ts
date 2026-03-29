export class Enemy {
    name: string;
    texture: string;
    currentHitPoints: number;
    maxHitPoints: number;
    
    constructor(name: string, texture: string, maxHitPoints: number) {
        this.name = name;
        this.texture = texture;
        this.maxHitPoints = maxHitPoints;
        this.currentHitPoints = maxHitPoints;
    }

}