import { Scene, GameObjects } from 'phaser';
import { Dice } from '../classes/Dice';

export class CombatHandler {
    scene: Scene;
    diceScale = 0.3;
    playersDice: Dice[] = [];
    activeDiceSprites: GameObjects.Image[] = [];

    constructor(scene: Scene) {
        this.scene = scene;

        // Standard-Würfel mit deinem bisherigen Bildset
        this.playersDice.push(
            new Dice([1, 2, 3, 4, 5, 6], 'Regular Dice', {
                1: 'regular-dice-1',
                2: 'regular-dice-2',
                3: 'regular-dice-3',
                4: 'regular-dice-4',
                5: 'regular-dice-5',
                6: 'regular-dice-6'
            })
        );

        // Optional: nur benutzen, wenn du diese Keys wirklich preloadest
        this.playersDice.push(
            new Dice([1, 2, 3, 4, 5, 6], 'Fire Dice', {
                1: 'fire-dice-1',
                2: 'fire-dice-2',
                3: 'fire-dice-3',
                4: 'fire-dice-4',
                5: 'fire-dice-5',
                6: 'fire-dice-6'
            })
        );
    }

    private clearDice() {
        for (const sprite of this.activeDiceSprites) {
            this.scene.tweens.killTweensOf(sprite);
            if (sprite.active) sprite.destroy();
        }

        this.activeDiceSprites = [];
    }

    private createDiceSprite(dice: Dice, x: number, y: number, depth: number) {
        const textureKey = dice.getFirstTexture();

        if (!this.scene.textures.exists(textureKey)) {
            throw new Error(`Texture "${textureKey}" is not loaded`);
        }

        return this.scene.add
            .image(x, y, textureKey)
            .setOrigin(0.5)
            .setDepth(depth)
            .setScale(0)
            .setAlpha(1)
            .setVisible(true);
    }

    private animateDice(sprite: GameObjects.Image, dice: Dice, finalValue: number, delayOffset = 0) {
        let totalDuration = 0;

        for (let i = 0; i < 12; i++) {
            totalDuration += 100 + i * 18 + delayOffset;
            const delay = totalDuration;

            this.scene.time.delayedCall(delay, () => {
                if (!sprite.active) return;

                const face = dice.getRandomFaceValue();
                const textureKey = dice.getTextureForValue(face);

                if (this.scene.textures.exists(textureKey)) {
                    sprite.setTexture(textureKey);
                }
            });
        }

        this.scene.tweens.add({
            targets: sprite,
            angle: 720,
            duration: totalDuration,
            ease: 'Cubic.Out'
        });

        this.scene.time.delayedCall(totalDuration, () => {
            if (!sprite.active) return;

            const finalTexture = dice.getTextureForValue(finalValue);

            if (this.scene.textures.exists(finalTexture)) {
                sprite.setTexture(finalTexture);
            }

            sprite.setAngle(0);

            this.scene.tweens.add({
                targets: sprite,
                scale: { from: this.diceScale * 1.1, to: this.diceScale },
                duration: 120,
                ease: 'Quad.Out'
            });
        });
    }

    throwDice(diceOrCount: Dice[] | number = 1, spacing = 90): number[] {
        let dicePool: Dice[] = [];

        if (Array.isArray(diceOrCount)) {
            dicePool = diceOrCount;
        } else {
            const template = this.playersDice[0];
            if (!template) return [];
            dicePool = Array.from({ length: diceOrCount }, () => template);
        }

        if (dicePool.length === 0) return [];

        this.clearDice();

        const cam = this.scene.cameras.main;
        const startX = 200;
        const startY = cam.height + 100;
        const baseX = 300;
        const targetY = cam.centerY;

        const results: number[] = [];

        dicePool.forEach((dice, index) => {
            const result = dice.roll();
            results.push(result);

            let sprite: GameObjects.Image;

            try {
                sprite = this.createDiceSprite(dice, startX, startY, 200 + index);
            } catch (error) {
                console.error(error);
                return;
            }

            this.activeDiceSprites.push(sprite);

            this.animateDice(sprite, dice, result, index * 10);

            this.scene.tweens.add({
                targets: sprite,
                x: baseX + index * spacing,
                y: targetY + (index % 2 === 0 ? -8 : 8),
                scale: { from: 0, to: this.diceScale },
                duration: 700 + index * 80,
                ease: 'Cubic.Out'
            });
        });

        return results;
    }

    throwAllPlayerDice(): number[] {
        return this.throwDice(this.playersDice);
    }

    throwSameDiceType(dice: Dice, count: number): number[] {
        return this.throwDice(Array.from({ length: count }, () => dice));
    }
}