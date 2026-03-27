import { Dice } from '../classes/Dice';
import { Scene } from 'phaser';

export class CombatHandler {
    playersDice: Dice[];
    scene: Scene;
    diceSprite?: Phaser.GameObjects.Image;

    constructor(scene: Scene) {
        this.scene = scene;
        this.playersDice = [];
        
        this.playersDice.push(new Dice([1, 2, 3, 4, 5, 6], 'Regular Dice'));

        // Create a hidden dice image in the center of the screen (will be shown on roll)
        const cam = this.scene.cameras.main;
        const cx = cam.centerX;
        const cy = cam.centerY;
        this.diceSprite = this.scene.add.image(cx, cy, 'dice1').setOrigin(0.5).setDepth(200).setVisible(false);
    }

    rollAllDice(): number {
        let total = 0;
        for (const dice of this.playersDice) {
            const r = dice.roll();
            total += r;
            // Show the face for this roll in the center
            this.showDiceFace(r);
        }
        return total;
    }

    showDiceFace(value: number) {
        if (!this.diceSprite) return;
        const key = `dice${value}`;
        this.diceSprite.setTexture(key);
        this.diceSprite.setAlpha(1);
        this.diceSprite.setScale(0);
        this.diceSprite.setVisible(true);

        this.scene.tweens.killTweensOf(this.diceSprite);
        this.scene.tweens.add({
            targets: this.diceSprite,
            scale: { from: 0, to: 1 },
            duration: 300,
            ease: 'Back.Out',
            onComplete: () => {
                // Hide after a short delay
                this.scene.time.delayedCall(700, () => {
                    this.scene.tweens.add({
                        targets: this.diceSprite,
                        alpha: { from: 1, to: 0 },
                        duration: 300,
                        onComplete: () => {
                            if (this.diceSprite) {
                                this.diceSprite.setVisible(false);
                                this.diceSprite.setAlpha(1);
                            }
                        }
                    });
                });
            }
        });
    }
}