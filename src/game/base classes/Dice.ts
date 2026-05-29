import { t, DiceLabelKey } from '../labels';
import { Enchantment } from './Enchantment';

export class Dice {
    // Speichert Key-Values, Key: Augenzahl, Value: Entsprechendes PNG aus dem preloader
    faces: Record<number, string>[];
    name: DiceLabelKey;
    appearanceLevel: number;
    enchantment: Enchantment | null = null;
    constructor(faces: Record<number, string>[], name: DiceLabelKey, appearanceLevel: number = 0) {
        this.faces = faces;
        this.name = name;
        this.appearanceLevel = appearanceLevel;
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

    /**
     * Addiert eine Verzauberung zu diesem Würfel
     */
    addEnchantment(enchantment: Enchantment): void {
        this.enchantment = enchantment;
    }

    /**
     * Entfernt die Verzauberung von diesem Würfel
     */
    removeEnchantment(): void {
        this.enchantment = null;
    }

    /**
     * Gibt die Verzauberung mit Beschreibung zurück (falls vorhanden)
     */
    getEnchantmentInfo(): string {
        if (this.enchantment) {
            return ` [${this.enchantment.name}]`;
        }
        return '';
    }

    /**
     * Wendet eine Verzauberung auf einen gewürfelten Wert an (falls vorhanden)
     */
    applyEnchantmentToValue(value: number): number {
        if (this.enchantment) {
            return this.enchantment.applyEnchantment(value);
        }
        return value;
    }

    /**
     * Erzeugt eine flache Kopie dieses Dice-Objekts (ohne Verzauberung).
     * Nützlich, um nur den ausgewählten Würfel zu verändern, ohne alle Instanzen gleichen Typs zu beeinflussen.
     */
    clone(): Dice {
        const facesCopy = this.faces.map(f => ({ ...f }));
        const d = new Dice(facesCopy, this.name, this.appearanceLevel);
        return d;
    }
}