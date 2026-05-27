import { Scene, type GameObjects } from 'phaser';

export class FallingLeaf {
    scene: Scene;
    sprite: GameObjects.Image | null = null;
    isActive = false;
    speed: number = 0;
    baseX: number = 0;
    swayOffset: number = 0;
    swayAmount: number = 0;
    tiltOffset: number = 0;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    spawn(x: number, y: number, textureKey: string, speed: number) {
        if (!this.sprite) {
            this.sprite = this.scene.add.image(x, y, textureKey);
            this.sprite.setOrigin(0.5);
            this.sprite.setDepth(-1);
            this.sprite.setScale(0.06);
        } else {
            this.sprite.setPosition(x, y);
            this.sprite.setVisible(true);
        }

        this.sprite.setAlpha(1);
        this.speed = speed;
        this.baseX = x;
        this.swayOffset = Math.random() * Math.PI * 2;
        this.swayAmount = 25 + Math.random() * 35;
        this.tiltOffset = Math.random() * Math.PI * 2;
        this.isActive = true;
    }

    update(delta: number) {
        if (!this.isActive || !this.sprite) return;

        const dt = delta / 1000;
        const height = this.scene.scale.height;

        // Fall downward
        this.sprite.y += this.speed * dt;

        // Sway side to side
        this.swayOffset += dt * 1.5;
        this.sprite.x = this.baseX + Math.sin(this.swayOffset) * this.swayAmount;

        // Gentle back-and-forth tilt (not a full spin)
        this.tiltOffset += dt * 2.2;
        this.sprite.angle = Math.sin(this.tiltOffset) * 25;

        // Fade out between 50% and 75% of the screen height
        const fadeStart = height * 0.5;
        const fadeEnd = height * 0.7;
        if (this.sprite.y > fadeStart) {
            const alpha = 1 - (this.sprite.y - fadeStart) / (fadeEnd - fadeStart);
            this.sprite.setAlpha(Math.max(0, alpha));
        }

        // Deactivate once fully off screen
        if (this.sprite.y > height) {
            this.isActive = false;
            this.sprite.setVisible(false);
            this.sprite.setAlpha(1);
        }
    }

    destroy() {
        if (this.sprite) {
            this.sprite.destroy();
        }
        this.sprite = null;
        this.isActive = false;
    }
}
