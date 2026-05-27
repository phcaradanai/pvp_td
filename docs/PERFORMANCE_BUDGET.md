# PERFORMANCE_BUDGET.md

## Target Frame Rate
- **Goal**: 60 FPS on high‑end desktop, 30 FPS on mid‑range devices.
- **Minimum**: 45 FPS stable on target hardware tier.

## Object Count Limits
- **Active Units**: ≤ 30 total entities (towers + creeps) concurrently on screen.
- **Projectiles**: ≤ 20 active projectiles at any moment.
- **Effects**: ≤ 10 simultaneous VFX instances (explosions, spells).

## VFX Rules
- Use GPU‑instanced particle systems where possible.
- Limit shader complexity; prefer unlit or lightly lit materials for bulk effects.
- Dynamic lighting only for hero units or important spells.

## UI Update Rules
- UI runs at 60 Hz, but heavy UI animations capped at 30 Hz to preserve performance.
- UI should avoid per‑frame heavy layout calculations; pre‑compute static UI elements.

## 2.5D / Stylized 3D Direction
- Assets modeled in low‑poly style with normal maps for detail.
- Use a single directional light with baked ambient occlusion.
- Post‑process effects (bloom, HDR) enabled selectively based on graphics profile.

## Graphics Profiles
- **Low**: No shadows, reduced texture resolution, simple shaders.
- **Medium**: Basic shadows, medium textures, standard shaders.
- **High**: Dynamic shadows, high‑res textures, advanced shaders, full post‑process.

## Performance Checkpoints
- **Milestone M2**: Verify data‑driven loading meets budget (< 200 ms load time).
- **Milestone M9**: Conduct visual QA to ensure 60 FPS on target hardware.
- **Continuous**: Automated performance profiling in CI for frame‑time regressions.

---
*Performance budgeting is integral to maintaining smooth, competitive gameplay.*
