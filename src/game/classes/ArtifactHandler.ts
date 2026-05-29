import { EventBus } from '../EventBus';
import { GAME_EVENTS } from '../backend-events';
import { Artifact, ArtifactType, type DamageContext, type RollContext } from "../base classes/Artifact";

export class ArtifactHandler {

    private artifacts: Artifact[] = [];

    constructor() {
        EventBus.on(GAME_EVENTS.damageDealt, (context: DamageContext) => {
            this.triggerDamageDealt(context);
        });
    }

    addArtifact(artifact: Artifact): void {
        this.artifacts.push(artifact);
    }

    getArtifacts(): Artifact[] {
        return this.artifacts;
    }

    hasArtifact(type: ArtifactType): boolean {
        return this.artifacts.some(a => a.type === type);
    }

    triggerDamageDealt(context: DamageContext): void {
        for (const artifact of this.artifacts) {
            artifact.effect.onDamageDealt?.(context);
        }
    }

    triggerThrowCompleted(context: RollContext): number {
        let bonus = 0;
        for (const artifact of this.artifacts) {
            bonus += artifact.effect.onThrowCompleted?.(context) ?? 0;
        }
        return bonus;
    }

    reset(): void {
        this.artifacts = [];
    }

    // triggerRollFinished(context: RollContext): void {

    //     for (const artifact of this.artifacts) {
    //         artifact.effect.onRollFinished?.(context);
    //     }
    // }
}