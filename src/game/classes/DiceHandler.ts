import { Scene, GameObjects } from 'phaser';
import { Dice } from '../classes/Dice';

export class DiceHandler {
    scene: Scene;
    diceScale = 0.3;
    playersDice: Dice[] = [];
    activeDiceSprites: GameObjects.Image[] = [];

    constructor(scene: Scene) {
        this.scene = scene;

        //Zwei Startwürfel generieren
        this.playersDice.push(
            new Dice([{ 1: 'regular-dice-1' }, { 2: 'regular-dice-2' }, { 3: 'regular-dice-3' }, { 4: 'regular-dice-4' }, { 5: 'regular-dice-5' }, { 6: 'regular-dice-6' }], 'Regular Dice')
        );
        this.playersDice.push(
            new Dice([{ 1: 'regular-dice-1' }, { 2: 'regular-dice-2' }, { 3: 'regular-dice-3' }, { 4: 'regular-dice-4' }, { 5: 'regular-dice-5' }, { 6: 'regular-dice-6' }], 'Regular Dice')
        );
    }

    private clearDice() {
        for (const sprite of this.activeDiceSprites) {
            this.scene.tweens.killTweensOf(sprite);
            if (sprite.active) sprite.destroy();
        }
        this.activeDiceSprites = [];
    }

    private createDiceSprite(texture: string, x: number, y: number, depth: number) {
        if (!this.scene.textures.exists(texture)) {
            throw new Error(`Texture "${texture}" is not loaded`);
        }

        return this.scene.add
            .image(x, y, texture)
            .setOrigin(0.5)
            .setDepth(depth)
            .setScale(0)
            .setAlpha(1)
            .setVisible(true);
    }

    private animateDice(sprite: GameObjects.Image, dice: Dice, finalTexture: string, delayOffset = 0) {
        let totalDuration = 0;

        for (let i = 0; i < 12; i++) {
            totalDuration += 100 + i * 18 + delayOffset;
            const delay = totalDuration;

            this.scene.time.delayedCall(delay, () => {
                if (!sprite.active) return;


                const face = dice.roll();
                const textureKey = Object.values(face)[0];

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

    throwDice(): number[] {
        this.clearDice();

        const cam = this.scene.cameras.main;
        const startX = 200;
        const startY = cam.height + 100;
        const baseX = 300;
        const targetY = cam.centerY;

        const results: number[] = [];

        this.playersDice.forEach((dice, index) => {
            const result = dice.roll();
            results.push(Number(Object.keys(result)[0]));

            let sprite: GameObjects.Image;

            try {
                sprite = this.createDiceSprite(Object.values(result)[0], startX, startY, 200 + index);
            } catch (error) {
                console.error(error);
                return;
            }

            this.activeDiceSprites.push(sprite);

            this.animateDice(sprite, dice, Object.values(result)[0], index * 10);

            this.scene.tweens.add({
                targets: sprite,
                x: baseX + index * 90,
                y: targetY + (index % 2 === 0 ? -8 : 8),
                scale: { from: 0, to: this.diceScale },
                duration: 700 + index * 80,
                ease: 'Cubic.Out'
            });
        });
        return results;
    }
}
