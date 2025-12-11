# VibeAccordion & VibeAccordionItem

Collapsible accordion component for organizing content.

## VibeAccordion

Accordion container. Requires Bootstrap JS.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `String` | Required | Unique identifier for the accordion |
| `flush` | `Boolean` | `false` | Remove borders and rounded corners |
| `items` | `AccordionItem[]` | `undefined` | Array of accordion items (shorthand mode) |

#### AccordionItem Interface

```typescript
interface AccordionItem {
  id: string
  title: string
  content: string
  show?: boolean
}
```

## VibeAccordionItem

Individual accordion item.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `String` | Required | Unique identifier for this item |
| `title` | `String` | Required | Accordion header text |
| `parentId` | `String` | Required | Parent accordion ID |
| `show` | `Boolean` | `false` | Initially expanded |

## Usage

### Shorthand Mode (Array-Based)

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

### Composable Mode (Slot-Based)

```vue
<template>
  <VibeAccordion id="accordionExample">
    <VibeAccordionItem
      id="collapseOne"
      parent-id="accordionExample"
      title="Accordion Item #1"
      show
    >
      This is the first item's content.
    </VibeAccordionItem>

    <VibeAccordionItem
      id="collapseTwo"
      parent-id="accordionExample"
      title="Accordion Item #2"
    >
      This is the second item's content.
    </VibeAccordionItem>

    <VibeAccordionItem
      id="collapseThree"
      parent-id="accordionExample"
      title="Accordion Item #3"
    >
      This is the third item's content.
    </VibeAccordionItem>
  </VibeAccordion>
</template>
```

### Flush Accordion

```vue
<template>
  <VibeAccordion id="accordionFlush" flush>
    <VibeAccordionItem
      id="flush-collapseOne"
      parent-id="accordionFlush"
      title="Flush Item #1"
      show
    >
      Flush accordion content.
    </VibeAccordionItem>
    <VibeAccordionItem
      id="flush-collapseTwo"
      parent-id="accordionFlush"
      title="Flush Item #2"
    >
      More flush content.
    </VibeAccordionItem>
  </VibeAccordion>
</template>
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
