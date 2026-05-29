import { t } from '../labels';

export type ArtifactType = 'BonusThrowsOnCrit';

export class Artifact {
    type: ArtifactType;
    name: string;
    description: string;
    maxBonusThrows: number = 3;

    constructor(type: ArtifactType) {
        this.type = type;
        this.name = this.getArtifactName(type);
        this.description = this.getArtifactDescription(type);
    }

    private getArtifactName(type: ArtifactType): string {
        switch (type) {
            case 'BonusThrowsOnCrit':
                return t('artifact.name.BonusThrowsOnCrit');
        }
    }

    private getArtifactDescription(type: ArtifactType): string {
        switch (type) {
            case 'BonusThrowsOnCrit':
                return t('artifact.description.BonusThrowsOnCrit');
        }
    }
}
