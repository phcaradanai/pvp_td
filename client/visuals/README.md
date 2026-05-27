# client/visuals/README.md

## Purpose
Contains visual effect assets, shaders, post‑process settings, and rendering helpers for the 2.5D/stylized 3D style.

## What belongs here
- Shader files, material definitions.
- Particle system presets.
- Post‑process configuration (bloom, HDR, etc.) for each graphics profile.
- Utility scripts for visual scaling based on performance settings.

## What must NOT be placed here
- Gameplay calculations or logic that affect balance.
- Server‑side authority code.

## Future expected files
- `tower_shader.gdshader`
- `spell_vfx.tscn`
- `post_process.gd`
