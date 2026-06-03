export type EnchantmentType = 'CopyNPaste' | 'Rekursion' | 'SmallestBonus';

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
            case 'Rekursion':
                return t('enchantment.name.Rekursion');
            case 'SmallestBonus':
                return t('enchantment.name.SmallestBonus');
        }
    }

    private getEnchantmentShortCode(type: EnchantmentType): string {
        switch (type) {
            case 'CopyNPaste':
                return 'CP';
            case 'Rekursion':
                return 'RK';
            case 'SmallestBonus':
                return '+4';
        }
    }

    private getEnchantmentDescription(type: EnchantmentType): string {
        switch (type) {
            case 'CopyNPaste':
                return t('enchantment.description.CopyNPaste');
            case 'Rekursion':
                return t('enchantment.description.Rekursion');
            case 'SmallestBonus':
                return t('enchantment.description.SmallestBonus');
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
            case 'Rekursion':
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
            case 'SmallestBonus':
                const minValue = Math.min(...dice.getFaceValues());
                if (value === minValue) {
                    return value + 4;
                }
                return value;
        }
    }
}
