class_name PvpFlowState
extends RefCounted

const SCREENS: Array[String] = [
	"arsenal_preview",
	"shared_pool_preview",
	"draft_preview",
	"planning_preview",
	"battle_preview",
	"result_preview",
	"reward_preview"
]

var current_index: int = 0
var screen_data: Dictionary = {}

var pool_items: Array = []
var budget_max: int = 10
var draft_picks_a: Array = []
var draft_picks_b: Array = []
var current_drafter: String = "player_a"
var draft_locked: bool = false

func load_from_json(path: String) -> bool:
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		return false
	var raw := file.get_as_text()
	file.close()
	var parser := JSON.new()
	var err := parser.parse(raw)
	if err != OK:
		return false
	var data: Dictionary = parser.get_data()
	if not data.has("screen_data"):
		return false
	screen_data = data["screen_data"]
	if data.has("shared_pool"):
		var sp: Dictionary = data["shared_pool"]
		budget_max = int(sp.get("budget_max", 10))
		pool_items = (sp.get("items", []) as Array).duplicate(true)
	return true

func current_screen() -> String:
	return SCREENS[current_index]

func screen_count() -> int:
	return SCREENS.size()

func can_go_next() -> bool:
	return current_index < SCREENS.size() - 1

func can_go_prev() -> bool:
	return current_index > 0

func can_advance_from_current_screen() -> bool:
	if current_screen() == "shared_pool_preview":
		return draft_locked
	return can_go_next()

func go_next() -> void:
	if can_advance_from_current_screen():
		current_index += 1

func go_prev() -> void:
	if can_go_prev():
		current_index -= 1

func reset() -> void:
	current_index = 0
	reset_draft()

func get_screen_data(screen: String) -> Dictionary:
	if screen_data.has(screen):
		return screen_data[screen].duplicate(true)
	return {}

func get_item_by_id(item_id: String) -> Dictionary:
	for item in pool_items:
		if str(item.get("id", "")) == item_id:
			return item
	return {}

func is_drafted(item_id: String) -> bool:
	return draft_picks_a.has(item_id) or draft_picks_b.has(item_id)

func budget_used_for(picks: Array) -> int:
	var total := 0
	for id in picks:
		var item := get_item_by_id(str(id))
		total += int(item.get("cost", 0))
	return total

func budget_remaining_for(picks: Array) -> int:
	return budget_max - budget_used_for(picks)

func get_remaining_available_items() -> Array:
	var result: Array = []
	for item in pool_items:
		if not is_drafted(str(item.get("id", ""))):
			result.append(item)
	return result

func get_player_requirement_status(player_id: String) -> Dictionary:
	var picks := draft_picks_a if player_id == "player_a" else draft_picks_b
	return _picks_status(picks)

func _picks_status(picks: Array) -> Dictionary:
	var has_tower := false
	var has_creep := false
	for id in picks:
		var item := get_item_by_id(str(id))
		match item.get("category", ""):
			"tower": has_tower = true
			"creep": has_creep = true
	return {"has_tower": has_tower, "has_creep": has_creep}

func can_pick_item_without_breaking_draft(item_id: String) -> Dictionary:
	var item := get_item_by_id(item_id)
	var item_name := str(item.get("name", item_id))
	var item_cat := str(item.get("category", ""))
	if item_cat != "tower" and item_cat != "creep":
		return {"ok": true, "error": ""}
	var other := "player_b" if current_drafter == "player_a" else "player_a"
	var other_label := "Player B" if other == "player_b" else "Player A"
	var other_picks := draft_picks_b if other == "player_b" else draft_picks_a
	var other_status := _picks_status(other_picks)
	var other_needs_cat: bool = (item_cat == "tower" and not other_status["has_tower"]) \
		or (item_cat == "creep" and not other_status["has_creep"])
	if not other_needs_cat:
		return {"ok": true, "error": ""}
	var remaining_of_cat := 0
	for pool_item in pool_items:
		var iid := str(pool_item.get("id", ""))
		if iid == item_id or is_drafted(iid):
			continue
		if pool_item.get("category", "") == item_cat:
			remaining_of_cat += 1
	if remaining_of_cat == 0:
		return {"ok": false, "error": "Cannot pick %s: %s still needs a %s." % [item_name, other_label, item_cat]}
	return {"ok": true, "error": ""}

func is_draft_completable_after_pick(item_id: String) -> bool:
	return can_pick_item_without_breaking_draft(item_id)["ok"]

func is_draft_deadlocked() -> bool:
	if draft_locked:
		return false
	var picks := draft_picks_a if current_drafter == "player_a" else draft_picks_b
	var remaining := budget_remaining_for(picks)
	for item in pool_items:
		var item_id := str(item.get("id", ""))
		if is_drafted(item_id):
			continue
		if int(item.get("cost", 0)) > remaining:
			continue
		if can_pick_item_without_breaking_draft(item_id)["ok"]:
			return false
	return true

func pick_shared_pool_item(item_id: String) -> Dictionary:
	if draft_locked:
		return {"ok": false, "error": "Draft is locked"}
	var item := get_item_by_id(item_id)
	if item.is_empty():
		return {"ok": false, "error": "Unknown item: " + item_id}
	if is_drafted(item_id):
		return {"ok": false, "error": str(item.get("name", item_id)) + " is already drafted"}
	var picks: Array = draft_picks_a if current_drafter == "player_a" else draft_picks_b
	var cost := int(item.get("cost", 0))
	var remaining := budget_remaining_for(picks)
	if cost > remaining:
		return {"ok": false, "error": "Not enough budget (cost %d, remaining %d)" % [cost, remaining]}
	var viability := can_pick_item_without_breaking_draft(item_id)
	if not viability["ok"]:
		return viability
	picks.append(item_id)
	current_drafter = "player_b" if current_drafter == "player_a" else "player_a"
	return {"ok": true, "error": ""}

func _draft_valid_for(picks: Array) -> bool:
	var status := _picks_status(picks)
	return status["has_tower"] and status["has_creep"]

func lock_draft() -> Dictionary:
	if draft_locked:
		return {"ok": false, "error": "Draft is already locked"}
	if not _draft_valid_for(draft_picks_a):
		return {"ok": false, "error": "Player A needs at least 1 tower and 1 creep"}
	if not _draft_valid_for(draft_picks_b):
		return {"ok": false, "error": "Player B needs at least 1 tower and 1 creep"}
	draft_locked = true
	return {"ok": true, "error": ""}

func reset_draft() -> void:
	draft_picks_a = []
	draft_picks_b = []
	current_drafter = "player_a"
	draft_locked = false
