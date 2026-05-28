# TODO.md

## Milestones

- [x] **M0 – Project Governance**
  - [ ] Define project vision and design pillars
  - [ ] Establish coding standards and file size limits
  - [ ] Create initial documentation set (AGENT_CONTEXT, ARCHITECTURE_NOTES, etc.)
  - [ ] Set up project repository structure
  - [ ] Draft initial changelog and test report

12: - [x] **M1 – Project Foundation**
  - [x] client folder with all sub-modules
  - [x] backend folder with all sub-modules
  - [x] data folder with schemas and samples
  - [x] tools folder with README and validation
  - [x] scripts folder with README

- [ ] **M2 – Data‑Driven Core**
  - Implement core data loading system
  - Define JSON schemas for towers, creeps, spells, etc.
  - Unit tests for data validation

- [x] **M3 – Arsenal Cost Limit**
  - Design cost‑limit algorithm
  - Integrate with draft system

- [x] **M4 – Shared Pool System**
  - [x] Implement pool merging logic
  - [x] Ensure fairness constraints

- [x] **M5 – Draft Phase**
  - [x] Implement turn‑based draft UI (placeholder)
  - [x] Draft validation rules

- [x] **M6 – Local PvP Match Skeleton**
  - [x] Local match skeleton implemented
  - [x] Validator chain wired
  - [x] Ready-to-start state created
  - [x] Unit tests added

- [x] **M7 – Local Phase Controller**
  - [x] LocalPhaseController implemented
  - [x] Placeholder phase transitions validated
  - [x] Invalid transitions rejected
  - [x] Unit tests added

- [x] **M8 – Mock Battle Result Preview**
  - [x] Mock result preview implemented
  - [x] Draw result supported
  - [x] Player A/B winner by core HP supported
  - [x] Duplicate result generation rejected
  - [x] Unit tests added

- [x] **M9 – Local End-to-End Loop Harness**
  - [x] E2E harness implemented
  - [x] Validator/phase/mock result modules wired
  - [x] Trace output added
  - [x] Unit/integration tests added

- [x] **M10A – Client Prototype Foundation**
  - [x] Lightweight UI prototype state created
  - [x] Prototype flow controller created
  - [x] View model builder created

- [x] **M10B – Client Visual Prototype Shell**
  - [x] HTML/CSS/JS view model bindings

- [x] **M10C – Prototype Scenario Runner**
  - [x] Scenario selection and expanded views

- [x] **M11 – Reward / Unlock Mock**
  - [x] Deterministic mock rewards
  - [x] Unlock progression calculation
  - [x] No permanent PvP stat advantage rule enforced

- [x] **M12 – Backend Match / Reward Contract**
  - [x] Match result submission validation
  - [x] Reward claim backend contract
  - [x] Client reward calculation rejected

## Next Possible Steps
The pure data contracts for the PvP loop are solid.

- **M13 Backend API Skeleton**: Wire contracts into a placeholder web server.
- **M13B Client Reward Screen Prototype**: Add reward/unlock UI screens.
- **M13C Godot Scene Prototype**: Connect a real game engine to the UI shell.
- **M14 Real Combat Prototype**: Begin building actual gameplay.

- [ ] **Fun Validation**
  - Playtesting framework
  - Balance tweaking workflow

- [ ] **M8 – Reward + Unlock Mock**
  - Mock reward distribution
  - Unlock progression prototype

- [ ] **M9 – Beauty Vertical Slice**
  - 2.5D visual assets integration
  - Polish UI/UX for demo

- [ ] **M10 – Backend PvP Foundation**
  - Server authoritative match logic
  - WebSocket communication layer

- [ ] **M11 – Online Private Match**
  - Lobby system for friends
  - Matchmaking stub

- [ ] **M12 – Closed Alpha**
  - Internal testing build
  - Feedback loop

- [ ] **M13 – Ranked MVP**
  - Ranked ladder implementation
  - ELO/seasonal reset

- [ ] **M14 – Production Polish**
  - Performance optimization
  - Final QA and release prep
