export class Dice {

    // Anzahl Seiten (Standard: 6)
    sides: number;

    constructor(sides: number = 6) {
        this.sides = sides;
    }

    // Würfeln
    roll(): number {
        const result = Math.floor(Math.random() * this.sides) + 1;
        console.log(`Gewürfelt: ${result}`);
        return result;
    }
}