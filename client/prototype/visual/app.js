import { createInitialPrototypeState } from "../src/prototype_state.js";
import { advancePrototypeScreen } from "../src/prototype_flow.js";
import { buildPrototypeViewModel } from "../src/prototype_view_model.js";

let state = null;
let scenariosData = null;

const ELEMENTS = {
  title: document.getElementById("screen-title"),
  btnNext: document.getElementById("btn-next"),
  btnReset: document.getElementById("btn-reset"),
  scenarioSelector: document.getElementById("scenario-selector"),
  warnings: document.getElementById("warnings-container"),
  playerAStatus: document.getElementById("player-a-status"),
  playerBStatus: document.getElementById("player-b-status"),
  
  views: {
    arsenal: document.getElementById("arsenal-view"),
    shared_pool: document.getElementById("shared-pool-view"),
    draft: document.getElementById("draft-view"),
    phase_flow: document.getElementById("phase-flow-view"),
    result: document.getElementById("result-view"),
    reward: document.getElementById("reward-view")
  },
  
  content: {
    arsenal: document.getElementById("arsenal-content"),
    shared_pool: document.getElementById("shared-pool-content"),
    draft: document.getElementById("draft-content"),
    phase_flow: document.getElementById("phase-flow-content"),
    result: document.getElementById("result-content"),
    reward: document.getElementById("reward-content")
  }
};

async function init() {
  try {
    const response = await fetch("../data/sample_scenarios.json");
    if (!response.ok) throw new Error("Failed to load scenario data");
    scenariosData = await response.json();
    
    // Populate selector
    ELEMENTS.scenarioSelector.innerHTML = "";
    for (const key of Object.keys(scenariosData)) {
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = key;
      ELEMENTS.scenarioSelector.appendChild(opt);
    }
    
    ELEMENTS.scenarioSelector.disabled = false;
    ELEMENTS.scenarioSelector.addEventListener("change", handleScenarioChange);
    
    ELEMENTS.btnNext.addEventListener("click", handleNext);
    ELEMENTS.btnReset.addEventListener("click", handleReset);
    
    // Load initial
    loadScenario(Object.keys(scenariosData)[0]);
  } catch (err) {
    showWarning("Initialization failed: " + err.message);
  }
}

function loadScenario(key) {
  if (!scenariosData[key]) return;
  state = createInitialPrototypeState(scenariosData[key]);
  ELEMENTS.btnNext.disabled = false;
  ELEMENTS.btnReset.disabled = false;
  render();
}

function handleScenarioChange(e) {
  loadScenario(e.target.value);
}

function handleNext() {
  if (!state) return;
  
  const transitionMap = {
    "arsenal_preview": "SHOW_SHARED_POOL_PREVIEW",
    "shared_pool_preview": "SHOW_DRAFT_PREVIEW",
    "draft_preview": "SHOW_PHASE_FLOW_PREVIEW",
    "phase_flow_preview": "SHOW_RESULT_PREVIEW",
    "result_preview": "SHOW_REWARD_PREVIEW"
  };
  
  const actionType = transitionMap[state.current_screen];
  if (!actionType) return;
  
  const result = advancePrototypeScreen(state, { type: actionType });
  if (!result.ok) {
    showWarning(result.errors.map(e => e.message).join(", "));
    return;
  }
  
  state = result.state;
  render();
}

function handleReset() {
  if (!state) return;
  const result = advancePrototypeScreen(state, { type: "RESET_PROTOTYPE" });
  if (result.ok) {
    state = result.state;
    render();
  }
}

function renderItemList(items) {
  if (!items || items.length === 0) return "<p class='text-muted'>None</p>";
  return `<ul class="item-list">${items.map(i => `<li>${i}</li>`).join("")}</ul>`;
}

function render() {
  if (!state) return;
  
  const vm = buildPrototypeViewModel(state);
  
  // Header
  ELEMENTS.title.textContent = vm.header.title;
  if (state.current_screen === "reward_preview") {
    ELEMENTS.btnNext.disabled = true;
  } else {
    ELEMENTS.btnNext.disabled = false;
  }
  
  // Warnings
  if (vm.warnings.length > 0) {
    showWarning(vm.warnings.join(" | "));
  } else {
    ELEMENTS.warnings.classList.add("hidden");
  }
  
  // Players
  ELEMENTS.playerAStatus.textContent = vm.player_panels.player_a ? 
    (vm.player_panels.player_a.has_final_loadout ? "Ready" : "Waiting") : "Unknown";
  
  ELEMENTS.playerBStatus.textContent = vm.player_panels.player_b ? 
    (vm.player_panels.player_b.has_final_loadout ? "Ready" : "Waiting") : "Unknown";
    
  // Views reset
  Object.values(ELEMENTS.views).forEach(v => v.classList.add("hidden"));
  
  // Render Arsenal Preview
  if (state.current_screen === "arsenal_preview" && vm.arsenal_panel) {
    ELEMENTS.views.arsenal.classList.remove("hidden");
    const aA = vm.arsenal_panel.player_a;
    const aB = vm.arsenal_panel.player_b;
    ELEMENTS.content.arsenal.innerHTML = `
      <div>
        <h4>Player A Arsenal</h4>
        ${aA ? renderItemList([...aA.towers, ...aA.creeps, ...aA.spells]) : "No arsenal"}
      </div>
      <div>
        <h4>Player B Arsenal</h4>
        ${aB ? renderItemList([...aB.towers, ...aB.creeps, ...aB.spells]) : "No arsenal"}
      </div>
    `;
  }
  
  // Render Shared Pool
  if (state.current_screen === "shared_pool_preview" && vm.shared_pool_panel) {
    ELEMENTS.views.shared_pool.classList.remove("hidden");
    const blocks = vm.shared_pool_panel.categories.map(cat => `
      <div class="category-block">
        <h4>${cat.name}</h4>
        ${renderItemList(cat.items)}
      </div>
    `).join("");
    ELEMENTS.content.shared_pool.innerHTML = blocks;
  }
  
  // Render Draft
  if (state.current_screen === "draft_preview" && vm.draft_panel) {
    ELEMENTS.views.draft.classList.remove("hidden");
    const dA = vm.draft_panel.player_a;
    const dB = vm.draft_panel.player_b;
    ELEMENTS.content.draft.innerHTML = `
      <div>
        <h4>Player A Loadout</h4>
        ${dA ? renderItemList([...dA.towers, ...dA.creeps, ...dA.spells]) : "Incomplete"}
      </div>
      <div>
        <h4>Player B Loadout</h4>
        ${dB ? renderItemList([...dB.towers, ...dB.creeps, ...dB.spells]) : "Incomplete"}
      </div>
    `;
  }
  
  // Render Phase Flow
  if (state.current_screen === "phase_flow_preview" && vm.phase_panel) {
    ELEMENTS.views.phase_flow.classList.remove("hidden");
    const phaseList = vm.phase_panel.history.map(p => `
      <div class="phase-item ${p === vm.phase_panel.current ? 'active' : ''}">
        ${p}
      </div>
    `).join("");
    ELEMENTS.content.phase_flow.innerHTML = phaseList;
  }
  
  // Render Result
  if (state.current_screen === "result_preview" && vm.result_panel) {
    ELEMENTS.views.result.classList.remove("hidden");
    ELEMENTS.content.result.innerHTML = `
      <p>Winner: <span class="neon-gold">${vm.result_panel.winner}</span></p>
      <p>Draw Status: ${vm.result_panel.winner === "Draw" ? 'Yes' : 'No'}</p>
      <p>Reason: <span class="text-muted">${vm.result_panel.reason}</span></p>
      <hr style="border-color: var(--border-light); margin: 0.5rem 0;">
      <p>Player A Core HP: <span class="neon-blue">${vm.result_panel.core_hp_a}</span></p>
      <p>Player B Core HP: <span class="neon-red">${vm.result_panel.core_hp_b}</span></p>
    `;
  }
  
  // Render Reward
  if (state.current_screen === "reward_preview" && vm.reward_panel) {
    ELEMENTS.views.reward.classList.remove("hidden");
    ELEMENTS.btnNext.disabled = true; // Terminal screen
    
    const rA = vm.reward_panel.rewards.player_a;
    const rB = vm.reward_panel.rewards.player_b;
    const uA = vm.reward_panel.new_unlocks.player_a || [];
    const uB = vm.reward_panel.new_unlocks.player_b || [];
    
    const renderCard = (r, unlocks) => {
      if (!r) return "No reward data";
      const chips = unlocks.map(u => `<span class="unlock-chip">${u}</span>`).join("");
      return `
        <div class="reward-row"><span>XP Gained:</span> <span class="reward-value">+${r.xp_delta || 0}</span></div>
        <div class="reward-row"><span>Currency:</span> <span class="reward-value">+${r.soft_currency_delta || 0}</span></div>
        <div class="reward-row"><span>Reason:</span> <span class="text-muted">${r.reason || "N/A"}</span></div>
        ${unlocks.length > 0 ? `<div><p style="margin-top:0.5rem; font-size:0.9em; color:var(--text-muted);">New Unlocks:</p><div class="unlock-chips">${chips}</div></div>` : ''}
      `;
    };

    const notesHtml = vm.reward_panel.notes.map(n => `<p>${n}</p>`).join("");

    ELEMENTS.content.reward.innerHTML = `
      <div class="side-by-side">
        <div>
          <h4>Player A Rewards</h4>
          ${renderCard(rA, uA)}
        </div>
        <div>
          <h4>Player B Rewards</h4>
          ${renderCard(rB, uB)}
        </div>
      </div>
      <div class="backend-note">
        ${notesHtml}
      </div>
    `;
  }
}

function showWarning(msg) {
  ELEMENTS.warnings.textContent = msg;
  ELEMENTS.warnings.classList.remove("hidden");
}

document.addEventListener("DOMContentLoaded", init);
