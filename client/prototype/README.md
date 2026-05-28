# Client Prototype Foundation

This directory contains the foundational lightweight client prototype that visualizes the validated PvP local loop.

## Purpose
- Visualizes the deterministic match skeleton, phase flow, and mock results.
- Serves as the structural baseline for either Godot scenes or a Web UI prototype.
- Proves data from validation flows into UI seamlessly.

## What it is NOT
- NOT a real combat engine.
- NOT a tower attack / creep movement simulation.
- NOT online multiplayer or networked.
- NOT authoritative logic. All underlying match data is sourced from external validators.

## Files
- `src/prototype_state.js`: Defines the client-side state schema for the prototype flow.
- `src/prototype_flow.js`: UI flow controller to advance placeholder screens deterministically.
- `src/prototype_view_model.js`: Converts raw match state into simplified UI-friendly layout sections.
- `visual/`: A lightweight HTML/CSS/JS shell rendering the flow with a built-in scenario runner.
- `tests/`: Node tests for the prototype flow logic.
- `data/`: Simplified client-facing state samples generated from E2E logic (including multiple scenarios).
