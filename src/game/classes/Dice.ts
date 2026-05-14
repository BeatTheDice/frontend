import { t, DiceLabelKey } from '../labels';

export class Dice {
    // Speichert Key-Values, Key: Augenzahl, Value: Entsprechendes PNG aus dem preloader
    faces: Record<number, string>[];
    name: DiceLabelKey;

    constructor(faces: Record<number, string>[], name: DiceLabelKey) {
        this.faces = faces;
        this.name = name;
    }

    roll(): Record<number, string> {
        return this.faces[Math.floor(Math.random() * this.faces.length)];
    }

    getFaceValues(): number[] {
        return this.faces.map(face => Number(Object.keys(face)[0]));
    }

    getFaceTextures(): string[] {
        return this.faces.map(face => Object.values(face)[0]);
    }

    getFaceValueLabel(): string {
        const values = this.getFaceValues();
        return this.formatFaceValues(values);
    }

    getDisplayName(): string {
        return t(this.name);
    }

    getDisplayTexture(): string {
        const textures = this.getFaceTextures();
        return textures[textures.length - 1] ?? textures[0] ?? '';
    }

    getHoverLabel(): string {
        const values = this.getFaceValues();
        return `${this.getDisplayName()}: ${this.formatFaceValues(values)}`;
    }

    private formatFaceValues(values: number[]): string {
        const sorted = [...values].sort((a, b) => a - b);
        const isSequential = sorted.every((value, index) => index === 0 || value === sorted[index - 1] + 1);
        if (isSequential) {
            return `${sorted[0]}–${sorted[sorted.length - 1]}`;
        }
        return sorted.join(', ');
    }
}