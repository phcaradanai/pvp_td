# Client Visual Prototype Shell

This module provides a lightweight visual shell to display the validated PvP loop flow using HTML, CSS, and JS.

## Purpose
- Renders the prototype flow (`arsenal_preview` -> `shared_pool_preview` -> `draft_preview` -> `phase_flow_preview` -> `result_preview` -> `reward_preview`).
- Includes a **Scenario Runner** to switch between different pre-validated outputs (draws, asymmetric unlocks, specific core HP wins).
- Consumes `prototype_state.js`, `prototype_flow.js`, and `prototype_view_model.js`.
- Proves that the validated data model and state logic cleanly bind to a user interface.

## Limitations
- **NO REAL GAMEPLAY**: This is exclusively a pre-match UI and state transition mockup.
- **NO COMBAT**: No towers, creeps, or economy systems are simulated.
- **NO ONLINE NETWORKING**: Runs purely locally in the browser using pre-generated E2E sample data.
- **NO REAL REWARDS**: Displays a reward preview screen based on mock data. In production, rewards and unlock progression must be confirmed and executed by the backend.

## Usage
Simply open `index.html` in any modern web browser. No local dev server is strictly required if the browser supports ES modules via `file://`, though a simple local HTTP server (like `npx serve .`) is recommended to avoid CORS issues when loading local JSON files.
