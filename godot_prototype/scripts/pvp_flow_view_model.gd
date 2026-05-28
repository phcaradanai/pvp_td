class_name PvpFlowViewModel
extends RefCounted

var phase_title: String = ""
var progress_label: String = ""
var description: String = ""
var player_a_title: String = ""
var player_a_content: String = ""
var player_b_title: String = ""
var player_b_content: String = ""
var center_title: String = ""
var center_content: String = ""
var prev_enabled: bool = false
var next_enabled: bool = false
var footer_text: String = ""
var show_pool_items: bool = false
var pool_item_cards: Array = []
var lock_draft_enabled: bool = false
var draft_status_text: String = ""

static func build(state: PvpFlowState, feedback: String = "") -> PvpFlowViewModel:
	var vm := PvpFlowViewModel.new()
	var screen := state.current_screen()
	var idx := state.current_index
	var total := state.screen_count()
	var data := state.get_screen_data(screen)

	vm.phase_title = data.get("title", screen)
	vm.progress_label = "Screen %d / %d" % [idx + 1, total]
	vm.description = data.get("description", "")
	vm.prev_enabled = state.can_go_prev()
	vm.next_enabled = state.can_advance_from_current_screen()
	vm.footer_text = "PvP Tower Tactics — Prototype M25 | No real combat or networking"

	if screen == "shared_pool_preview":
		_build_draft_panels(vm, state, data, feedback)
	elif screen == "planning_preview" and state.draft_locked:
		_build_planning_panels(vm, state, data)
	elif screen == "battle_preview" and state.draft_locked:
		_build_battle_panels(vm, state, data)
	else:
		var pa: Dictionary = data.get("player_a", {})
		vm.player_a_title = pa.get("label", "Player A")
		vm.player_a_content = _items_to_text(pa)
		var pb: Dictionary = data.get("player_b", {})
		vm.player_b_title = pb.get("label", "Player B")
		vm.player_b_content = _items_to_text(pb)
		var center: Dictionary = data.get("center", {})
		vm.center_title = center.get("label", "")
		vm.center_content = center.get("content", "")

	return vm

static func _build_draft_panels(vm: PvpFlowViewModel, state: PvpFlowState, data: Dictionary, feedback: String) -> void:
	var pa: Dictionary = data.get("player_a", {})
	var pb: Dictionary = data.get("player_b", {})
	vm.player_a_title = pa.get("label", "Player A Draft")
	vm.player_b_title = pb.get("label", "Player B Draft")

	var used_a := state.budget_used_for(state.draft_picks_a)
	var used_b := state.budget_used_for(state.draft_picks_b)
	var req_a := state.get_player_requirement_status("player_a")
	var req_b := state.get_player_requirement_status("player_b")
	vm.player_a_content = _draft_panel_text(state.draft_picks_a, used_a, state.budget_max, state) \
		+ "\n" + _req_status_text(req_a)
	vm.player_b_content = _draft_panel_text(state.draft_picks_b, used_b, state.budget_max, state) \
		+ "\n" + _req_status_text(req_b)

	vm.center_title = "Shared Pool"
	if state.draft_locked:
		vm.center_content = "Draft locked.\nProceeding to Planning Phase."
	elif state.is_draft_deadlocked():
		vm.center_content = "Draft cannot be completed. Reset draft."
	elif feedback != "":
		vm.center_content = feedback
	else:
		var drafter := "Player A" if state.current_drafter == "player_a" else "Player B"
		vm.center_content = drafter + "'s turn to pick."

	vm.show_pool_items = not state.draft_locked
	var remaining_a := state.budget_remaining_for(state.draft_picks_a)
	var remaining_b := state.budget_remaining_for(state.draft_picks_b)
	var current_remaining := remaining_a if state.current_drafter == "player_a" else remaining_b

	vm.pool_item_cards = []
	for item in state.pool_items:
		var item_id := str(item.get("id", ""))
		var cost := int(item.get("cost", 0))
		var drafted := state.is_drafted(item_id)
		var affordable := (not drafted) and (cost <= current_remaining) and (not state.draft_locked)
		var viable : Variant = state.can_pick_item_without_breaking_draft(item_id)["ok"]
		vm.pool_item_cards.append({
			"id": item_id,
			"name": str(item.get("name", item_id)),
			"category": str(item.get("category", "")),
			"cost": cost,
			"drafted": drafted,
			"affordable": affordable,
			"viable": viable
		})

	vm.lock_draft_enabled = _can_lock_draft(state)
	vm.draft_status_text = _build_draft_status_text(state)

static func _can_lock_draft(state: PvpFlowState) -> bool:
	if state.draft_locked:
		return false
	var has_tower_a := false
	var has_creep_a := false
	for id in state.draft_picks_a:
		var item := state.get_item_by_id(str(id))
		match item.get("category", ""):
			"tower": has_tower_a = true
			"creep": has_creep_a = true
	if not (has_tower_a and has_creep_a):
		return false
	var has_tower_b := false
	var has_creep_b := false
	for id in state.draft_picks_b:
		var item := state.get_item_by_id(str(id))
		match item.get("category", ""):
			"tower": has_tower_b = true
			"creep": has_creep_b = true
	return has_tower_b and has_creep_b

static func _build_draft_status_text(state: PvpFlowState) -> String:
	if state.draft_locked:
		return "Draft locked."
	if state.is_draft_deadlocked():
		return "Deadlock! No valid picks remain. Reset draft."
	var missing := _missing_requirements_text(state)
	if missing == "":
		return "Both players ready. Lock Draft to proceed."
	return missing

static func _missing_requirements_text(state: PvpFlowState) -> String:
	var parts: Array[String] = []
	var status_a := state.get_player_requirement_status("player_a")
	var status_b := state.get_player_requirement_status("player_b")
	if not status_a["has_tower"] or not status_a["has_creep"]:
		var need_a: Array[String] = []
		if not status_a["has_tower"]:
			need_a.append("tower")
		if not status_a["has_creep"]:
			need_a.append("creep")
		parts.append("Player A needs: " + ", ".join(need_a))
	if not status_b["has_tower"] or not status_b["has_creep"]:
		var need_b: Array[String] = []
		if not status_b["has_tower"]:
			need_b.append("tower")
		if not status_b["has_creep"]:
			need_b.append("creep")
		parts.append("Player B needs: " + ", ".join(need_b))
	return "\n".join(parts)

static func _req_status_text(status: Dictionary) -> String:
	var tower_icon := "✓" if status["has_tower"] else "✗"
	var creep_icon := "✓" if status["has_creep"] else "✗"
	return "Tower: %s  Creep: %s" % [tower_icon, creep_icon]

static func _build_planning_panels(vm: PvpFlowViewModel, state: PvpFlowState, data: Dictionary) -> void:
	var pa: Dictionary = data.get("player_a", {})
	var pb: Dictionary = data.get("player_b", {})
	vm.player_a_title = pa.get("label", "Player A Placement")
	vm.player_b_title = pb.get("label", "Player B Placement")
	vm.player_a_content = _draft_picks_to_placement_text(state.draft_picks_a, state)
	vm.player_b_content = _draft_picks_to_placement_text(state.draft_picks_b, state)
	var center: Dictionary = data.get("center", {})
	vm.center_title = center.get("label", "Grid Status")
	vm.center_content = "Phase: Planning\n(Placeholder - no real grid yet)"

static func _build_battle_panels(vm: PvpFlowViewModel, state: PvpFlowState, data: Dictionary) -> void:
	var pa: Dictionary = data.get("player_a", {})
	var pb: Dictionary = data.get("player_b", {})
	vm.player_a_title = pa.get("label", "Player A Combat")
	vm.player_b_title = pb.get("label", "Player B Combat")
	vm.player_a_content = _draft_picks_to_combat_text(state.draft_picks_a, state)
	vm.player_b_content = _draft_picks_to_combat_text(state.draft_picks_b, state)
	var center: Dictionary = data.get("center", {})
	vm.center_title = center.get("label", "Battle Log")
	vm.center_content = center.get("content", "")

static func _draft_panel_text(picks: Array, used: int, bmax: int, state: PvpFlowState) -> String:
	var lines: Array[String] = []
	lines.append("Budget: %d / %d" % [used, bmax])
	if picks.is_empty():
		lines.append("(no picks yet)")
	else:
		for id in picks:
			var item := state.get_item_by_id(str(id))
			if not item.is_empty():
				lines.append("- %s [%s] cost %d" % [item.get("name", id), item.get("category", "?"), int(item.get("cost", 0))])
	return "\n".join(lines)

static func _draft_picks_to_placement_text(picks: Array, state: PvpFlowState) -> String:
	if picks.is_empty():
		return "(no drafted units)"
	var lines: Array[String] = []
	var lane := 1
	for id in picks:
		var item := state.get_item_by_id(str(id))
		if not item.is_empty():
			lines.append("%s [%s] → Lane %d" % [item.get("name", id), item.get("category", "?"), lane])
			lane += 1
	return "\n".join(lines)

static func _draft_picks_to_combat_text(picks: Array, state: PvpFlowState) -> String:
	if picks.is_empty():
		return "(no drafted units)"
	var lines: Array[String] = []
	for id in picks:
		var item := state.get_item_by_id(str(id))
		if not item.is_empty():
			lines.append("- %s [%s]" % [item.get("name", id), item.get("category", "?")])
	return "\n".join(lines)

static func _items_to_text(panel: Dictionary) -> String:
	var lines: Array[String] = []
	var items = panel.get("items", [])
	for item in items:
		lines.append(str(item))
	var extra_keys := ["budget_used", "budget_max"]
	for key in extra_keys:
		if panel.has(key):
			lines.append("%s: %s" % [key, str(panel[key])])
	if lines.is_empty():
		return "(empty)"
	return "\n".join(lines)
