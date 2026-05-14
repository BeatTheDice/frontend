import { Scene } from 'phaser';

export class AnimatedCloud {
    scene: Scene;
    sprite: Phaser.GameObjects.Image | null = null;
    isActive = false;
    speed: number;
    direction: number; // 1 = right, -1 = left
    baseY: number;
    bobOffset: number;

    constructor(scene: Scene) {
        this.scene = scene;
        this.speed = 0;
        this.direction = 1;
        this.baseY = 0;
        this.bobOffset = 0;
    }

    spawn(x: number, y: number, textureKey: string, speed: number, direction: number) {
        if (!this.sprite) {
            this.sprite = this.scene.add.image(x, y, textureKey);
            this.sprite.setOrigin(0.5);
            this.sprite.setDepth(-50);
            this.sprite.setScale(0.35);
        } else {
            this.sprite.setTexture(textureKey);
            this.sprite.setPosition(x, y);
            this.sprite.setVisible(true);
        }

        this.speed = speed;
        this.direction = direction;
        this.baseY = y;
        this.bobOffset = 0;
        this.isActive = true;
    }

    update(delta: number) {
        if (!this.isActive || !this.sprite) return;

        const deltaMs = delta / 1000;

        // Move horizontally
        this.sprite.x += this.direction * this.speed * deltaMs;

        // Gentle bobbing animation
        this.bobOffset += deltaMs * 2;
        this.sprite.y = this.baseY + Math.sin(this.bobOffset) * 5;

        // Deactivate when offscreen
        if (this.sprite.x < -150 || this.sprite.x > this.scene.scale.width + 150) {
            this.isActive = false;
            this.sprite.setVisible(false);
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
