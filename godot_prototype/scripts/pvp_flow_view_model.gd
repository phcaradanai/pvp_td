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
var show_planning_items: bool = false
var planning_items_a: Array = []
var planning_slots_a: Array = []
var planning_items_b: Array = []
var planning_slots_b: Array = []

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
	var tower_icon := "✓" if status.get("has_tower", false) else "✗"
	var creep_icon := "✓" if status.get("has_creep", false) else "✗"
	var spell_icon := "Assigned" if status.get("has_spell", false) else "Optional"
	return "Tower: %s  Creep: %s  Spell: %s" % [tower_icon, creep_icon, spell_icon]

static func _build_planning_panels(vm: PvpFlowViewModel, state: PvpFlowState, data: Dictionary) -> void:
	var pa: Dictionary = data.get("player_a", {})
	var pb: Dictionary = data.get("player_b", {})
	vm.player_a_title = pa.get("label", "Player A Placement")
	vm.player_b_title = pb.get("label", "Player B Placement")
	vm.center_title = "Planning Phase"
	
	if state.planning_feedback != "":
		vm.center_content = state.planning_feedback
	else:
		vm.center_content = "Select an item and place it in a valid slot.\n" + ("Selected: " + state.selected_planning_item if state.selected_planning_item != "" else "No item selected")
		
	var req_a := state.get_player_planning_status("player_a")
	var req_b := state.get_player_planning_status("player_b")
	vm.player_a_content = "Player A:\n" + _req_status_text(req_a)
	vm.player_b_content = "Player B:\n" + _req_status_text(req_b)

	vm.show_planning_items = true
	vm.planning_items_a = _build_planning_items(state, "player_a")
	vm.planning_slots_a = _build_planning_slots(state, "player_a")
	vm.planning_items_b = _build_planning_items(state, "player_b")
	vm.planning_slots_b = _build_planning_slots(state, "player_b")

static func _build_planning_items(state: PvpFlowState, player_id: String) -> Array:
	var items: Array = []
	var drafted := state.get_drafted_items_for_player(player_id)
	for id in drafted:
		var item := state.get_item_by_id(str(id))
		var placed := state.is_item_already_placed(player_id, str(id))
		var selected := (state.selected_planning_item == str(id))
		items.append({
			"id": str(id),
			"name": str(item.get("name", id)),
			"category": str(item.get("category", "")),
			"placed": placed,
			"selected": selected,
			"selectable": not placed
		})
	return items

static func _build_planning_slots(state: PvpFlowState, player_id: String) -> Array:
	var slots: Array = []
	var placements := state.placements_a if player_id == "player_a" else state.placements_b
	
	for i in range(1, state.defense_slots + 1):
		var slot_id := "slot_" + str(i)
		var occupied_by: Variant = placements.get("defense", {}).get(slot_id)
		var comp := state.can_place_item(player_id, state.selected_planning_item, "defense", slot_id) if state.selected_planning_item != "" else {"ok": false}
		slots.append({
			"type": "defense",
			"id": slot_id,
			"occupied": occupied_by != null,
			"item_id": occupied_by if occupied_by != null else "",
			"compatible_with_selected": comp["ok"]
		})
		
	for i in range(1, state.send_lanes + 1):
		var lane_id := "lane_" + str(i)
		var occupied_by: Variant = placements.get("send", {}).get(lane_id)
		var comp := state.can_place_item(player_id, state.selected_planning_item, "send", lane_id) if state.selected_planning_item != "" else {"ok": false}
		slots.append({
			"type": "send",
			"id": lane_id,
			"occupied": occupied_by != null,
			"item_id": occupied_by if occupied_by != null else "",
			"compatible_with_selected": comp["ok"]
		})
		
	for i in range(1, state.spell_slots + 1):
		var spell_slot_id := "spell_slot_" + str(i)
		var occupied_by: Variant = placements.get("spells", {}).get(spell_slot_id)
		var comp := state.can_place_item(player_id, state.selected_planning_item, "spells", spell_slot_id) if state.selected_planning_item != "" else {"ok": false}
		slots.append({
			"type": "spells",
			"id": spell_slot_id,
			"occupied": occupied_by != null,
			"item_id": occupied_by if occupied_by != null else "",
			"compatible_with_selected": comp["ok"]
		})
	return slots

static func _build_battle_panels(vm: PvpFlowViewModel, state: PvpFlowState, data: Dictionary) -> void:
	var pa: Dictionary = data.get("player_a", {})
	var pb: Dictionary = data.get("player_b", {})
	vm.player_a_title = pa.get("label", "Player A Combat")
	vm.player_b_title = pb.get("label", "Player B Combat")
	
	vm.player_a_content = _placements_to_combat_text(state.placements_a, state)
	vm.player_b_content = _placements_to_combat_text(state.placements_b, state)
	
	var center: Dictionary = data.get("center", {})
	vm.center_title = center.get("label", "Battle Log")
	vm.center_content = "Battle Phase\nPreviewing placements..."

static func _placements_to_combat_text(placements: Dictionary, state: PvpFlowState) -> String:
	var lines: Array[String] = []
	lines.append("DEFENSE:")
	for slot_id in placements.get("defense", {}).keys():
		var id = placements["defense"][slot_id]
		if id != null:
			var item := state.get_item_by_id(str(id))
			lines.append("- %s: %s" % [slot_id, item.get("name", id)])
	lines.append("SEND:")
	for lane_id in placements.get("send", {}).keys():
		var id = placements["send"][lane_id]
		if id != null:
			var item := state.get_item_by_id(str(id))
			lines.append("- %s: %s" % [lane_id, item.get("name", id)])
	lines.append("SPELLS:")
	for spell_id in placements.get("spells", {}).keys():
		var id = placements["spells"][spell_id]
		if id != null:
			var item := state.get_item_by_id(str(id))
			lines.append("- %s: %s" % [spell_id, item.get("name", id)])
	if lines.size() == 3:
		return "(no placements)"
	return "\n".join(lines)

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
