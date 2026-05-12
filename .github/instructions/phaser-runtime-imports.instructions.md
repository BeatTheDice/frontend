---
description: "Use when editing Phaser scenes, Phaser game bootstrap code, or Vite-bundled Phaser runtime code. Prevent runtime errors like 'Phaser is not defined' by separating type usage from runtime imports."
name: "Phaser Runtime Imports"
applyTo: "src/game/**/*.ts"
---
# Phaser Runtime Imports

- Do not use the global `Phaser.*` namespace in executable code. Vite bundle output in this project does not provide a runtime global named `Phaser`.
- Import runtime APIs directly from `phaser`, for example `Scale`, `Math as PhaserMath`, `Game`, or other concrete runtime members.
- Keep type usage separate from runtime usage. Prefer imported types such as `type Types` over runtime namespace access like `Phaser.Types` in config code.
- If a symbol is only used for typing, import it as a type when possible.
- After changing Phaser bootstrap or scene runtime code, validate with `npm run build-nolog` before considering the change complete.

Example:

```ts
import { AUTO, Game, Scale, type Types } from 'phaser';

const config: Types.Core.GameConfig = {
  type: AUTO,
  scale: {
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH,
  },
};
```

Avoid:

```ts
const config: Phaser.Types.Core.GameConfig = {
  scale: {
    mode: Phaser.Scale.FIT,
  },
};
```