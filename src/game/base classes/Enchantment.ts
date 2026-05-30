export type EnchantmentType = 'CopyNPaste' | 'ZweiSamkeit';

import { t } from '../labels';
import { Dice } from './Dice';

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
                return t('enchantment.name.CopyNPaste');
            case 'ZweiSamkeit':
                return t('enchantment.name.ZweiSamkeit');
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
                return t('enchantment.description.CopyNPaste');
            case 'ZweiSamkeit':
                return t('enchantment.description.ZweiSamkeit');
        }
    }

    /**
     * Wendet die Verzauberung auf ein gewürfeltes Ergebnis an
     */
    applyEnchantment(dice: Dice, value: number): number {
        switch (this.type) {
            case 'CopyNPaste':
                // Verdoppelt den Wert
                return value * 2;
            case 'ZweiSamkeit':
                // Wenn eine Zwei oder Eins gewürfelt wird, erneut würfeln und addieren
                if (value !== 2 && value !== 1) {
                    return value;
                }

                let total = value;
                let rerollValue = value;

                while (rerollValue === 2 || rerollValue === 1) {
                    const reroll = dice.roll();
                    rerollValue = Number(Object.keys(reroll)[0]);
                    total += rerollValue;
                }

                return total;
        }
    }
}
