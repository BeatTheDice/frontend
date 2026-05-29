import { ArtifactEffect, ArtifactType, RollContext, DamageContext } from "../base classes/Artifact";

export const ALL_ARTIFACT_TYPES: ArtifactType[] = [
    'BonusThrowsOnCrit',
    'CollectorShowcase',
    // 'ForgeSeal',
    // 'MirrorAmulet',
    // 'MasterDice',
    // 'DiceCupOfCourage'
];

export class BonusThrowsOnCritEffect implements ArtifactEffect {

    onDamageDealt(context: DamageContext): void {
        if (!context.isCritical) {
            return;
        }

        context.levelEngine.addBonusThrow();
    }
}

export class CollectorShowcaseEffect implements ArtifactEffect {
    onThrowCompleted(context: RollContext): number {
        const uniqueDiceCount = new Set(context.currentDice.map(d => d.name)).size;
        const bonus = Math.floor((context.levelEngine.currentLevel / 2) * (1 + uniqueDiceCount * 0.25));
        return bonus;
    }
}

