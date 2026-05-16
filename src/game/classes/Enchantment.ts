export type EnchantmentType = 'CopyNPaste' | 'ZweiSamkeit';

export class Enchantment {
    type: EnchantmentType;
    name: string;
    description: string;
    shortCode: string;

    constructor(type: EnchantmentType) {
        this.type = type;
        this.name = this.getEnchantmentName(type);
        this.description = this.getEnchantmentDescription(type);
        this.shortCode = this.getEnchantmentShortCode(type);
    }

    private getEnchantmentName(type: EnchantmentType): string {
        switch (type) {
            case 'CopyNPaste':
                return 'Copy & Paste';
            case 'ZweiSamkeit':
                return 'Zweisamkeit';
        }
    }

    private getEnchantmentShortCode(type: EnchantmentType): string {
        switch (type) {
            case 'CopyNPaste':
                return 'CP';
            case 'ZweiSamkeit':
                return 'ZS';
        }
    }

    private getEnchantmentDescription(type: EnchantmentType): string {
        switch (type) {
            case 'CopyNPaste':
                return 'Jede gewürfelte Augenzahl wird doppelt zum Gesamt-Ergebnis addiert';
            case 'ZweiSamkeit':
                return 'Für jede gewürfelte Zwei +5 zur Augenzahl';
        }
    }

    /**
     * Wendet die Verzauberung auf ein gewürfeltes Ergebnis an
     */
    applyEnchantment(value: number): number {
        switch (this.type) {
            case 'CopyNPaste':
                // Verdoppelt den Wert
                return value * 2;
            case 'ZweiSamkeit':
                // Wenn es eine Zwei ist, +5 addieren
                if (value === 2) {
                    return value + 5;
                }
                return value;
        }
    }
}
