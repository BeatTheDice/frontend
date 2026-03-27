export class Dice {
    faces: number[];
    name: string;

    constructor(sides: number[], name: string) {
        this.faces = sides;
        this.name = name;
    }

    roll(): number {
        const result = this.faces[Math.floor(Math.random() * this.faces.length)];
        return result;
    }
}