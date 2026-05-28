extends Control

const DATA_PATH := "res://data/sample_pvp_flow.json"

@onready var _phase_title: Label = $MainLayout/Header/PhaseTitle
@onready var _progress_label: Label = $MainLayout/Header/ProgressLabel
@onready var _player_a_title: Label = $MainLayout/ContentRow/PlayerAPanel/VBox/PlayerATitle
@onready var _player_a_content: Label = $MainLayout/ContentRow/PlayerAPanel/VBox/PlayerAContent
@onready var _center_title: Label = $MainLayout/ContentRow/CenterPanel/VBox/CenterTitle
@onready var _center_content: Label = $MainLayout/ContentRow/CenterPanel/VBox/CenterContent
@onready var _player_b_title: Label = $MainLayout/ContentRow/PlayerBPanel/VBox/PlayerBTitle
@onready var _player_b_content: Label = $MainLayout/ContentRow/PlayerBPanel/VBox/PlayerBContent
@onready var _prev_button: Button = $MainLayout/Controls/PrevButton
@onready var _reset_button: Button = $MainLayout/Controls/ResetButton
@onready var _lock_draft_button: Button = $MainLayout/Controls/LockDraftButton
@onready var _draft_status_label: Label = $MainLayout/Controls/DraftStatusLabel
@onready var _next_button: Button = $MainLayout/Controls/NextButton
@onready var _footer_label: Label = $MainLayout/Footer/FooterLabel
@onready var _pool_scroll: ScrollContainer = $MainLayout/ContentRow/CenterPanel/VBox/PoolScrollContainer
@onready var _pool_items_container: VBoxContainer = $MainLayout/ContentRow/CenterPanel/VBox/PoolScrollContainer/PoolItemsContainer

var _state: PvpFlowState
var _last_feedback: String = ""

func _ready() -> void:
	_state = PvpFlowState.new()
	var loaded := _state.load_from_json(DATA_PATH)
	if not loaded:
		push_warning("PvpFlowController: failed to load " + DATA_PATH)
	_prev_button.pressed.connect(_on_prev_pressed)
	_reset_button.pressed.connect(_on_reset_pressed)
	_lock_draft_button.pressed.connect(_on_lock_draft_pressed)
	_next_button.pressed.connect(_on_next_pressed)
	_render()

func pick_shared_pool_item(item_id: String) -> void:
	var result := _state.pick_shared_pool_item(item_id)
	_last_feedback = result.get("error", "")
	_render()

func lock_draft() -> void:
	var result := _state.lock_draft()
	_last_feedback = result.get("error", "")
	_render()

func reset_draft() -> void:
	_state.reset_draft()
	_last_feedback = ""
	_render()

func can_advance_from_current_screen() -> bool:
	return _state.can_advance_from_current_screen()

func _on_prev_pressed() -> void:
	_last_feedback = ""
	_state.go_prev()
	_render()

func _on_next_pressed() -> void:
	if not _state.can_advance_from_current_screen():
		_last_feedback = "Lock the draft before advancing."
		_render()
		return
	_last_feedback = ""
	_state.go_next()
	_render()

func _on_reset_pressed() -> void:
	_last_feedback = ""
	_state.reset()
	_render()

func _on_lock_draft_pressed() -> void:
	lock_draft()

func _render() -> void:
	var vm := PvpFlowViewModel.build(_state, _last_feedback)
	_phase_title.text = vm.phase_title
	_progress_label.text = vm.progress_label
	_player_a_title.text = vm.player_a_title
	_player_a_content.text = vm.player_a_content
	_center_title.text = vm.center_title
	_center_content.text = vm.center_content
	_player_b_title.text = vm.player_b_title
	_player_b_content.text = vm.player_b_content
	_prev_button.disabled = not vm.prev_enabled
	_next_button.disabled = not vm.next_enabled
	_footer_label.text = vm.footer_text
	_lock_draft_button.visible = vm.show_pool_items
	_lock_draft_button.disabled = not vm.lock_draft_enabled
	_draft_status_label.text = vm.draft_status_text
	_draft_status_label.visible = vm.show_pool_items
	_pool_scroll.visible = vm.show_pool_items
	if vm.show_pool_items:
		_rebuild_pool_buttons(vm)

func _rebuild_pool_buttons(vm: PvpFlowViewModel) -> void:
	while _pool_items_container.get_child_count() > 0:
		var child := _pool_items_container.get_child(0)
		_pool_items_container.remove_child(child)
		child.queue_free()
	for card in vm.pool_item_cards:
		var btn := Button.new()
		var status := "[DRAFTED]" if card["drafted"] else ("cost: %d" % card["cost"])
		var warn := " ⚠" if (not card["viable"] and not card["drafted"] and card["affordable"]) else ""
		btn.text = "%s [%s] — %s%s" % [card["name"], card["category"], status, warn]
		btn.disabled = card["drafted"] or not card["affordable"]
		var item_id: String = card["id"]
		btn.pressed.connect(pick_shared_pool_item.bind(item_id))
		_pool_items_container.add_child(btn)
