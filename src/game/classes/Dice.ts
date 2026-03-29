export class Dice {
    // Speichert Key-Values, Key: Augenzahl, Value: Entsprechendes PNG aus dem preloader
    faces: Record<number, string>[];
    name: string;

    constructor(faces: Record<number, string>[], name: string) {
        this.faces = faces;
        this.name = name;
    }

    roll(): Record<number, string> {
        return this.faces[Math.floor(Math.random() * this.faces.length)];
    }
}