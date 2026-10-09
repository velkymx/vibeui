# Assistive-Technology Manual Pass (1.3 keyboard and ARIA flows)

Run-book for issue #272. The 1.3 keyboard and ARIA work (#234, #235) is proven
in happy-dom only (attribute asserts plus `activeElement` checks). This pass
must be done by a human: keyboard-only first, then one screen reader
(NVDA, VoiceOver, or Orca). Record each row Pass/Fail with the tool used.
File every failure as its own issue with the WCAG criterion; #272 closes when
the table below is full (clean or with follow-ups filed).

Setup: `npm run build`, serve `examples/`, open the matching example page.
No pointer during the keyboard run. Focus must stay visible and never strand
on `body`.

## Flows from #234 (keyboard paths)

| # | Flow | Steps (keyboard only) | Expected | Result |
|---|------|----------------------|----------|--------|
| 1 | FileInput dropzone (`VibeFileInput.vue`, `dragDrop`) | Tab to dropzone, press Enter, then re-focus and press Space | `role="button"`, `tabindex="0"`; both keys open the file browser; `aria-label` names the action | Not run |
| 2 | FileInput dropzone disabled | Tab through with a disabled dropzone on the page | Dropzone skipped (`tabindex` unset), `aria-disabled` present | Not run |
| 3 | Sortable grab plus arrows (`VibeSortable.vue`) | Tab to a row, press Space to grab, ArrowDown twice, Space to drop | `aria-grabbed` flips on grab/drop; row order changes; focus follows the moved row | Not run |
| 4 | Sortable cancel | Grab a row, move once, press Escape | Order reverts, grab released | Not run |
| 5 | Draggable arm plus Droppable Enter-drop | Tab to draggable, Space to arm, Tab to dropzone, Enter | `drop` fires on same-group Enter; armed state announced via control label; Escape disarms with no drop | Not run |
| 6 | Tabs roving tabindex (`VibeTabs.vue`) | Tab into strip, ArrowRight/ArrowLeft, Home, End | Exactly one tab at `tabindex="0"`; arrows move and activate with focus; disabled tabs skipped | Not run |
| 7 | Tabs vertical orientation | Same as 6 on a vertical tab strip | ArrowUp/ArrowDown move instead of Left/Right | Not run |

## Flows from #235 (ARIA wiring and focus)

| # | Flow | Steps | Expected | Result |
|---|------|-------|----------|--------|
| 8 | Tab panel wiring | With screen reader on, arrow across tabs | Tab announces its panel (`aria-controls`/`aria-labelledby`); only the active `role="tabpanel"` is exposed, inactive panels hidden | Not run |
| 9 | DatePicker focus return (`VibeDatePicker.vue`) | Open calendar from trigger, pick a date with arrows plus Enter, then open and press Escape | Focus returns to the trigger input on close; disabled days are skipped, never focused | Not run |
| 10 | Accordion live state (`VibeAccordion.vue`) | With screen reader on, expand and collapse a panel | Header button announces expanded/collapsed immediately (`aria-expanded` flips on the Bootstrap show/hide events, seeded pre-JS) | Not run |
| 11 | Droppable affordance | Arm a drag (pointer or Space), move over dropzones | Eligible dropzone exposes its affordance; foreign or wrong-group drags get none | Not run |

## Earlier-cycle announcements

| # | Flow | Steps | Expected | Result |
|---|------|-------|----------|--------|
| 12 | Toast politeness (`VibeToast.vue`) | Trigger info/success toast, then danger/warning toast | Info announces politely (`role="status"`, `aria-live="polite"`); danger interrupts (`role="alert"`, `aria-live="assertive"`); both atomic | Not run |
| 13 | Field validation errors | Submit an invalid form with screen reader on | Each error announced (`role="alert"` feedback, `aria-invalid` plus `aria-describedby` on the control); no focus theft | Not run |
| 14 | Error summary | Submit with several invalid fields | Summary announces (`role="alert"`, live polite); its links move focus to each field | Not run |

## Recording

- Tool(s) used: (fill in: keyboard only plus NVDA/VoiceOver/Orca plus browser)
- Date plus tester: (fill in)
- Failures filed: (list issue numbers or "none")

## DataTable advanced flows (#283 Tier 2)

| # | Flow | Steps | Expected | Result |
|---|------|-------|----------|--------|
| 15 | Sort button (engine header rebuild) | Tab to a sortable header, press Enter, then Space | Sort toggles asc/desc/none from the keyboard; `aria-sort` announces the direction; focus stays on the button | Not run |
| 16 | Row selection checkboxes | Tab to a row checkbox, press Space; then the select-all header checkbox | Row toggles with its label announced; header shows checked/unchecked/indeterminate correctly | Not run |
| 17 | Expand toggles (rows and groups) | Tab to an expand toggle, press Enter | Detail or child rows appear; `aria-expanded` flips; group headers announce value plus count | Not run |
| 18 | Resize handle | Tab to a resize handle, press ArrowRight/ArrowLeft | Column width steps with each press; table stays usable, no focus loss | Not run |
| 19 | Multi-sort plus filters | Shift+click a second header; type in a text filter | Both sorts apply in order; filter row inputs are labelled and announce results via the info line | Not run |
