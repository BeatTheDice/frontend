export class Dice {
    faces: number[];
    name: string;
    private textureMap: Record<number, string>;

    constructor(faces: number[], name: string, textureMap: Record<number, string>) {
        this.faces = faces;
        this.name = name;
        this.textureMap = textureMap;
    }

    roll(): number {
        return this.faces[Math.floor(Math.random() * this.faces.length)];
    }

    getRandomFaceValue(): number {
        return this.faces[Math.floor(Math.random() * this.faces.length)];
    }

    getTextureForValue(value: number): string {
        const texture = this.textureMap[value];

        if (!texture) {
            throw new Error(`Missing texture for value ${value} on dice "${this.name}"`);
        }

        return texture;
    }

    getFirstTexture(): string {
        return this.getTextureForValue(this.faces[0]);
    }
}