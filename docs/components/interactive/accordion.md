# VibeAccordion

Collapsible accordion component for organizing content in a data-driven way.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `String` | Required | Unique identifier for the accordion |
| `flush` | `Boolean` | `false` | Remove borders and rounded corners |
| `items` | `AccordionItem[]` | Required | Array of accordion items |

### AccordionItem Interface

```typescript
interface AccordionItem {
  id: string
  title: string
  content: string
  show?: boolean
}
```

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `item-click` | `{ item, index }` | Emitted when an accordion item is clicked |

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `title` | `{ item, index }` | Custom title rendering |
| `content` | `{ item, index }` | Custom content rendering |

## Usage

### Basic Example

```vue
<template>
  <VibeAccordion id="accordionExample" :items="accordionItems" />
</template>

<script setup>
const accordionItems = [
  {
    id: 'collapseOne',
    title: 'Accordion Item #1',
    content: 'This is the first item\'s content.',
    show: true
  },
  {
    id: 'collapseTwo',
    title: 'Accordion Item #2',
    content: 'This is the second item\'s content.'
  },
  {
    id: 'collapseThree',
    title: 'Accordion Item #3',
    content: 'This is the third item\'s content.'
  }
]
</script>
```

### Custom Title Rendering

Use the `title` scoped slot to customize how titles are rendered:

```vue
<template>
  <VibeAccordion id="accordionCustom" :items="accordionItems">
    <template #title="{ item, index }">
      <VibeIcon icon="chevron-right" />
      <strong>{{ item.title }}</strong>
    </template>
  </VibeAccordion>
</template>
```

### Custom Content Rendering

Use the `content` scoped slot for rich content:

```vue
<template>
  <VibeAccordion id="accordionRich" :items="accordionItems">
    <template #content="{ item }">
      <div class="p-3">
        <h5>{{ item.title }}</h5>
        <p>{{ item.content }}</p>
        <VibeButton size="sm" variant="primary">Learn More</VibeButton>
      </div>
    </template>
  </VibeAccordion>
</template>
```

### Flush Accordion

Remove borders and rounded corners:

```vue
<template>
  <VibeAccordion id="accordionFlush" flush :items="accordionItems" />
</template>
```

### With Event Handling

```vue
<template>
  <VibeAccordion
    id="accordionEvents"
    :items="accordionItems"
    @item-click="handleItemClick"
  />
</template>

<script setup>
const handleItemClick = ({ item, index }) => {
  console.log(`Clicked item ${index}: ${item.title}`)
}
</script>
```

**Note:** Requires Bootstrap JavaScript to be included in your project.

## Bootstrap CSS Classes

- `.accordion`
- `.accordion-flush`
- `.accordion-item`
- `.accordion-header`
- `.accordion-button`
- `.accordion-collapse`
- `.accordion-body`
