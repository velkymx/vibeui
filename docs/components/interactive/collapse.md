# VibeCollapse

Toggle visibility of content. Requires Bootstrap JS.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `String` | Required | Unique identifier |
| `modelValue` | `Boolean` | `false` | Control visibility (v-model) |
| `tag` | `String` | `'div'` | HTML tag to render |
| `horizontal` | `Boolean` | `false` | Horizontal collapse |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `Boolean` | Emitted when visibility changes |
| `show` | - | Emitted when collapse starts showing |
| `shown` | - | Emitted when collapse is fully shown |
| `hide` | - | Emitted when collapse starts hiding |
| `hidden` | - | Emitted when collapse is fully hidden |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Collapsible content |

## Usage

### Basic Collapse

```vue
<template>
  <div>
    <VibeButton
      variant="primary"
      data-bs-toggle="collapse"
      data-bs-target="#collapseExample"
    >
      Toggle Collapse
    </VibeButton>

    <VibeCollapse id="collapseExample">
      <div class="card card-body mt-2">
        This content can be collapsed!
      </div>
    </VibeCollapse>
  </div>
</template>
```

### Multiple Targets

```vue
<template>
  <div>
    <VibeButton
      variant="primary"
      data-bs-toggle="collapse"
      data-bs-target="#multiCollapseExample1"
    >
      Toggle first
    </VibeButton>
    <VibeButton
      variant="primary"
      data-bs-toggle="collapse"
      data-bs-target="#multiCollapseExample2"
    >
      Toggle second
    </VibeButton>

    <div class="row mt-2">
      <div class="col">
        <VibeCollapse id="multiCollapseExample1">
          <div class="card card-body">
            First collapse content
          </div>
        </VibeCollapse>
      </div>
      <div class="col">
        <VibeCollapse id="multiCollapseExample2">
          <div class="card card-body">
            Second collapse content
          </div>
        </VibeCollapse>
      </div>
    </div>
  </div>
</template>
```

### Horizontal Collapse

```vue
<template>
  <div>
    <VibeButton
      variant="primary"
      data-bs-toggle="collapse"
      data-bs-target="#collapseWidthExample"
    >
      Toggle Width
    </VibeButton>

    <div style="min-height: 120px">
      <VibeCollapse id="collapseWidthExample" horizontal>
        <div class="card card-body" style="width: 300px">
          This is horizontal collapse content!
        </div>
      </VibeCollapse>
    </div>
  </div>
</template>
```

**Note:** Requires Bootstrap JavaScript to be included in your project.

## Bootstrap CSS Classes

- `.collapse`
- `.collapse-horizontal`
- `.show`
