# Design review: keep the UI intentional

Use this before calling a screen done. It is the condensed version of the Unslop guide (`docs/unslop.md`, when present); open that file for the full catalog and prompts.

## Budgets

A view fails review if it exceeds these without a stated reason.

| Dimension | Per-view budget |
| --- | --- |
| Accent colors | 1 |
| Type families | 2 (UI + optional display/code) |
| Type sizes | 3, or 4 with a display heading |
| Font weights | 2, or 3 with a deliberate emphasis system |
| Shadows | 1 tier; zero if borders carry the hierarchy |
| Card depth | 1 level; cards do not contain cards |
| Primary actions | 1; the rest are secondary or links |
| Borders + shadows | One of the two defines an edge |
| Radius values | 2 (controls, surfaces) plus pill |
| Icons | Only when they aid recognition |
| Motion | State change only |

## The ten highest-impact tells

1. No empty, loading, or error states.
2. Placeholder used as the only label, or unlabeled controls.
3. Contrast below WCAG AA.
4. Invisible focus or a keyboard dead end.
5. Horizontal scroll at 320 px.
6. Cards nested inside cards; every section boxed.
7. Identical icon + heading + paragraph grids.
8. Decorative gradients, glows, glass, or grid textures.
9. Duplicate labels, restated helper text, generic claims.
10. A modal for a page-sized task, or a confirm for a routine one.

Items 1–5 are blockers. The rest are craft; fix them, but do not hold a release on card radius while the empty state is missing.

## Deletion pass

Remove, do not restyle:

- [ ] Labels that repeat the heading below or above them
- [ ] Badges with no status; icons with no recognition job
- [ ] A second primary button competing with the first
- [ ] Wrappers and cards that only add padding
- [ ] Decorative gradients, glows, grids, blobs, and stripes
- [ ] Motion that does not signal a state change
- [ ] Helper text that restates the label
- [ ] Numbers without a source, caption, or decision

## VibeUI-specific traps

- Nested `VibeCard`, or a manual `.card` inside `VibeCard`.
- `<button class="btn btn-primary">` instead of `VibeButton variant="primary"`.
- `variant="outline-secondary"` instead of `variant="secondary" outline`.
- A manual `<label>` + input instead of `VibeFormGroup`.
- Hand-written `.dropdown-menu` / `.nav-item` markup instead of `:items`.
- `data-bs-toggle="modal"` or `new bootstrap.Modal()` alongside `v-model`.
- Custom table sorting/filtering instead of `VibeDataTable`.
- `!important` or `--bs-*` overrides instead of props.
- `v-html` for structured content instead of slots/components.

## Quick before/after

```vue
<!-- Before: raw markup, nested surfaces, decorative badge, placeholder-only fields -->
<div class="card p-4 shadow-lg" style="border-radius: 2rem">
  <div class="card">
    <span class="badge bg-primary">SETTINGS</span>
    <h2>Account settings</h2>
    <input class="form-control" placeholder="Full name" />
    <button class="btn btn-primary">Save</button>
    <button class="btn btn-primary">Update</button>
  </div>
</div>
```

```vue
<!-- After: one surface, labels that persist, one primary action -->
<VibeCard title="Account settings">
  <form novalidate @submit.prevent="save">
    <VibeFormGroup label="Full name">
      <VibeFormInput v-model="form.fields.name" autocomplete="name" />
    </VibeFormGroup>
    <div class="d-flex gap-2">
      <VibeButton type="submit" variant="primary">Save changes</VibeButton>
      <VibeButton variant="secondary" @click="discard">Discard</VibeButton>
    </div>
  </form>
</VibeCard>
```

The full pair, with the gradient, three actions, and the verdict list, is in `docs/unslop.md` §7.7 when present.

## Ship gate

- [ ] Outline matches the content; no section exists only to fill a template
- [ ] Budgets respected
- [ ] Every element earns its place
- [ ] Realistic content, including a long row, a long name, and an empty list
- [ ] Empty, loading, error, and success states designed
- [ ] Keyboard path complete, focus visible, targets large enough
- [ ] Contrast AA, heading order correct, controls labeled
- [ ] Responsive at 320 / 768 / 1440; no horizontal scroll at 320
- [ ] Dark mode and reduced motion respected
- [ ] No unexplained custom CSS, no Bootstrap JS import, no direct instance access
- [ ] Screenshots at 320 / 768 / 1440 reviewed against the reference

## References

- `docs/unslop.md` (when present): full catalog, budgets, prompts, and the Bootstrap example map.
- `docs/best-practices.md`: setup, props and slots, forms, accessibility.
- Impeccable's Slop catalog: <https://impeccable.style/slop/>.
