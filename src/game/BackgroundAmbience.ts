import { Scene } from 'phaser';
import { AnimatedCloud } from './classes/AnimatedCloud';
import { FallingLeaf } from './classes/FallingLeaf';

export function setupBackgroundAmbience(scene: Scene) {
    const clouds: AnimatedCloud[] = [];
    const leaves: FallingLeaf[] = [];

    const MAX_CLOUDS = 6;
    // Minimum horizontal distance (px) between any two cloud centers
    const MIN_SEPARATION = 220;
    const SPEED_MIN = 25;
    const SPEED_MAX = 45;
    const MAX_LEAVES = 10;

    // Pre-spawn all clouds evenly spread across the screen width
    function initClouds() {
        if (!scene.textures.exists('cloud')) return;

        const width = scene.scale.width;
        const spacing = width / MAX_CLOUDS;

        for (let i = 0; i < MAX_CLOUDS; i++) {
            const cloud = new AnimatedCloud(scene);
            clouds.push(cloud);
            const x = spacing * 0.5 + spacing * i;
            const y = 50 + Math.random() * 80;
            const speed = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN);
            cloud.spawn(x, y, 'cloud', speed);
        }
    }

    // Place a recycled cloud just off the left edge, keeping MIN_SEPARATION from all others
    function recycleCloud(cloud: AnimatedCloud) {
        const otherXs = clouds
            .filter(c => c !== cloud && c.isActive)
            .map(c => c.getX());

        // Start just off the left edge and push further left until clear of every other cloud
        let safeX = -150;
        let changed = true;
        while (changed) {
            changed = false;
            for (const x of otherXs) {
                if (Math.abs(x - safeX) < MIN_SEPARATION) {
                    safeX = x - MIN_SEPARATION;
                    changed = true;
                }
            }
        }

        const y = 50 + Math.random() * 80;
        const speed = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN);
        cloud.spawn(safeX, y, 'cloud', speed);
    }

    // Spawn a falling leaf
    function spawnLeaf() {
        if (!scene.textures.exists('leaf')) return;

        let leaf = leaves.find(l => !l.isActive);
        if (!leaf && leaves.length < MAX_LEAVES) {
            leaf = new FallingLeaf(scene);
            leaves.push(leaf);
        }

        if (!leaf) return;

        const speed = 60 + Math.random() * 60;
        const startX = Math.random() * scene.scale.width;
        leaf.spawn(startX, -50, 'leaf', speed);
    }

    let leafTimer = 0;

    function onUpdate(_time: number, delta: number) {
        // Update clouds; recycle any that have drifted off the right edge
        clouds.forEach(cloud => {
            cloud.update(delta);
            if (cloud.needsRecycle) {
                recycleCloud(cloud);
            }
        });

        // Update all active leaves
        leaves.forEach(leaf => leaf.update(delta));

        // Spawn new leaves every 1.5-2.5s
        leafTimer += delta;
        if (leafTimer > 1500 + Math.random() * 1000) {
            spawnLeaf();
            leafTimer = 0;
        }
    }

    // Start clouds immediately
    initClouds();

    // Attach update listener
    scene.events.on('update', onUpdate);

    // Cleanup on scene shutdown
    scene.events.once('shutdown', () => {
        scene.events.off('update', onUpdate);
        clouds.forEach(c => c.destroy());
        leaves.forEach(l => l.destroy());
    });
}
