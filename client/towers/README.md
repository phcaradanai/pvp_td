# client/towers/README.md

## Purpose
Contains tower prefab definitions and associated visual assets.

## What belongs here
- Tower scene files (e.g., `.tscn` in Godot) or model references.
- Tower-specific configuration JSON/YAML files (range, damage, etc.) – though actual values live in `data/`.
- Visual resources (textures, meshes, animations) for towers.

## What must NOT be placed here
- Gameplay logic that determines damage or targeting – that resides in backend `match/`.
- Server‑side authority code.

## Future expected files
- `basic_tower.tscn` – example tower scene.
- `tower_config.json` – placeholder linking to data definitions.
