import type { LevelEngine } from '../classes/LevelEngine';
import { BonusThrowsOnCritEffect, CollectorShowcaseEffect } from '../collection classes/ArtifactCollection';
import { t } from '../labels';
import { Dice } from './Dice';

export interface DamageContext {
    damage: number;
    isCritical: boolean;
    levelEngine: LevelEngine;
}

export interface RollContext {
    rollResults: number[];
    currentDice: Dice[];
    levelEngine: LevelEngine;
}

export type ArtifactType =
    | 'BonusThrowsOnCrit'
    | 'CollectorShowcase'
    | 'ForgeSeal'
    | 'MirrorAmulet'
    | 'MasterDice'
    | 'DiceCupOfCourage';

export interface ArtifactEffect {
    onThrowCompleted?(context: RollContext): number;

    onDamageDealt?(context: DamageContext): void;

    // modifyDamage?(damage: number, context: DamageContext): number;

    // modifyRollResults?(results: number[]): number[];
}

export class Artifact {
    type: ArtifactType;
    name: string;
    description: string;
    effect: ArtifactEffect;

    constructor(type: ArtifactType) {
        this.type = type;
        this.name = this.getArtifactName(type);
        this.description = this.getArtifactDescription(type);
        this.effect = this.createEffect(type);
    }

    private createEffect(type: ArtifactType): ArtifactEffect {
        switch (type) {
            case 'BonusThrowsOnCrit':
                return new BonusThrowsOnCritEffect;

            case 'CollectorShowcase':
                return new CollectorShowcaseEffect;

            // case 'ForgeSeal':
            //     return new ForgeSealEffect();

            // case 'MirrorAmulet':
            //     return new MirrorAmuletEffect();

            // case 'MasterDice':
            //     return new MasterDiceEffect();

            // case 'DiceCupOfCourage':
            //     return new DiceCupOfCourageEffect();
            default:
                return {};
        }
    }

    private getArtifactName(type: ArtifactType): string {
        switch (type) {
            case 'BonusThrowsOnCrit':
                return t('artifact.name.BonusThrowsOnCrit');

            case 'CollectorShowcase':
                return t('artifact.name.CollectorShowcase');

            // case 'ForgeSeal':
            //     return t('artifact.name.ForgeSeal');

            // case 'MirrorAmulet':
            //     return t('artifact.name.MirrorAmulet');

            // case 'MasterDice':
            //     return t('artifact.name.MasterDice');

            // case 'DiceCupOfCourage':
            //     return t('artifact.name.DiceCupOfCourage');
            default:
                return 'Unknown Artifact';
        }
    }

    private getArtifactDescription(type: ArtifactType): string {
        switch (type) {
            case 'BonusThrowsOnCrit':
                return t('artifact.description.BonusThrowsOnCrit');

            case 'CollectorShowcase':
                return t('artifact.description.CollectorShowcase');

            // case 'ForgeSeal':
            //     return t('artifact.description.ForgeSeal');

            // case 'MirrorAmulet':
            //     return t('artifact.description.MirrorAmulet');

            // case 'MasterDice':
            //     return t('artifact.description.MasterDice');

            // case 'DiceCupOfCourage':
            //     return t('artifact.description.DiceCupOfCourage');
            default:
                return 'Unknown Artifact Description';
        }
    }
}