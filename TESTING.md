# Testing Guide for VibeUI

This document provides guidance on testing VibeUI components, especially after the data-driven refactoring.

## Testing Philosophy

VibeUI components are designed to be:
- **Data-driven**: Test by passing different data arrays
- **Predictable**: Same input always produces same output
- **Accessible**: Test ARIA attributes and semantic HTML

## Recommended Testing Setup

### Install Testing Dependencies

```bash
npm install --save-dev vitest @vue/test-utils happy-dom
```

### Vitest Configuration

Add to `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom'
  }
})
```

## Example Tests

### Testing Data-Driven Components

#### VibeAccordion

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { VibeAccordion } from '@velkymx/vibeui'

describe('VibeAccordion', () => {
  it('renders items from array', () => {
    const items = [
      { id: 'item1', title: 'Item 1', content: 'Content 1', show: true },
      { id: 'item2', title: 'Item 2', content: 'Content 2' }
    ]

    const wrapper = mount(VibeAccordion, {
      props: {
        id: 'test-accordion',
        items
      }
    })

    expect(wrapper.findAll('.accordion-item')).toHaveLength(2)
    expect(wrapper.text()).toContain('Item 1')
    expect(wrapper.text()).toContain('Item 2')
  })

  it('sets initial active state', () => {
    const items = [
      { id: 'item1', title: 'Item 1', content: 'Content 1', show: true }
    ]

    const wrapper = mount(VibeAccordion, {
      props: {
        id: 'test-accordion',
        items
      }
    })

    const firstItem = wrapper.find('.accordion-collapse')
    expect(firstItem.classes()).toContain('show')
  })

  it('emits item-click event', async () => {
    const items = [
      { id: 'item1', title: 'Item 1', content: 'Content 1' }
    ]

    const wrapper = mount(VibeAccordion, {
      props: {
        id: 'test-accordion',
        items
      }
    })

    await wrapper.find('.accordion-button').trigger('click')

    expect(wrapper.emitted('item-click')).toBeTruthy()
    expect(wrapper.emitted('item-click')?.[0]).toEqual([{
      item: items[0],
      index: 0
    }])
  })

  it('renders custom title slot', () => {
    const items = [
      { id: 'item1', title: 'Item 1', content: 'Content 1' }
    ]

    const wrapper = mount(VibeAccordion, {
      props: {
        id: 'test-accordion',
        items
      },
      slots: {
        title: '<template #title="{ item }"><strong>{{ item.title }}</strong></template>'
      }
    })

    expect(wrapper.find('strong').exists()).toBe(true)
  })
})
```

#### VibePagination

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { VibePagination } from '@velkymx/vibeui'

describe('VibePagination', () => {
  it('renders correct number of pages', () => {
    const wrapper = mount(VibePagination, {
      props: {
        totalPages: 5,
        currentPage: 1
      }
    })

    expect(wrapper.findAll('.page-item')).toHaveLength(7) // 5 pages + prev + next
  })

  it('emits update:currentPage on page click', async () => {
    const wrapper = mount(VibePagination, {
      props: {
        totalPages: 5,
        currentPage: 1
      }
    })

    const pageButtons = wrapper.findAll('.page-link')
    await pageButtons[2].trigger('click') // Click page 2

    expect(wrapper.emitted('update:currentPage')).toBeTruthy()
    expect(wrapper.emitted('update:currentPage')?.[0]).toEqual([2])
  })

  it('disables prev button on first page', () => {
    const wrapper = mount(VibePagination, {
      props: {
        totalPages: 5,
        currentPage: 1
      }
    })

    const prevButton = wrapper.find('.page-item')
    expect(prevButton.classes()).toContain('disabled')
  })

  it('hides prev/next buttons when showPrevNext is false', () => {
    const wrapper = mount(VibePagination, {
      props: {
        totalPages: 5,
        currentPage: 1,
        showPrevNext: false
      }
    })

    expect(wrapper.findAll('.page-item')).toHaveLength(5) // Only page numbers
  })
})
```

#### VibeProgress

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { VibeProgress } from '@velkymx/vibeui'

describe('VibeProgress', () => {
  it('renders single progress bar', () => {
    const bars = [{ value: 50 }]

    const wrapper = mount(VibeProgress, {
      props: { bars }
    })

    expect(wrapper.findAll('.progress-bar')).toHaveLength(1)
    expect(wrapper.find('.progress-bar').attributes('style')).toContain('width: 50%')
  })

  it('renders multiple progress bars', () => {
    const bars = [
      { value: 30, variant: 'success' },
      { value: 20, variant: 'warning' },
      { value: 15, variant: 'danger' }
    ]

    const wrapper = mount(VibeProgress, {
      props: { bars }
    })

    expect(wrapper.findAll('.progress-bar')).toHaveLength(3)
  })

  it('applies variant classes correctly', () => {
    const bars = [{ value: 50, variant: 'success' }]

    const wrapper = mount(VibeProgress, {
      props: { bars }
    })

    expect(wrapper.find('.progress-bar').classes()).toContain('bg-success')
  })

  it('shows striped and animated styles', () => {
    const bars = [
      { value: 50, striped: true, animated: true }
    ]

    const wrapper = mount(VibeProgress, {
      props: { bars }
    })

    const bar = wrapper.find('.progress-bar')
    expect(bar.classes()).toContain('progress-bar-striped')
    expect(bar.classes()).toContain('progress-bar-animated')
  })

  it('displays labels correctly', () => {
    const bars = [
      { value: 75, showValue: true }
    ]

    const wrapper = mount(VibeProgress, {
      props: { bars }
    })

    expect(wrapper.find('.progress-bar').text()).toBe('75%')
  })
})
```

### Testing Other Refactored Components

#### VibeBreadcrumb

```typescript
it('renders breadcrumb items', () => {
  const items = [
    { text: 'Home', href: '/' },
    { text: 'Products', href: '/products' },
    { text: 'Details', active: true }
  ]

  const wrapper = mount(VibeBreadcrumb, {
    props: { items }
  })

  expect(wrapper.findAll('.breadcrumb-item')).toHaveLength(3)
  expect(wrapper.findAll('.breadcrumb-item')[2].classes()).toContain('active')
})
```

#### VibeListGroup

```typescript
it('renders list items with variants', () => {
  const items = [
    { text: 'Item 1', variant: 'primary' },
    { text: 'Item 2', variant: 'success', active: true }
  ]

  const wrapper = mount(VibeListGroup, {
    props: { items }
  })

  expect(wrapper.findAll('.list-group-item')).toHaveLength(2)
  expect(wrapper.findAll('.list-group-item')[0].classes()).toContain('list-group-item-primary')
  expect(wrapper.findAll('.list-group-item')[1].classes()).toContain('active')
})
```

#### VibeDropdown

```typescript
it('renders dropdown items including dividers', () => {
  const items = [
    { text: 'Action 1', href: '#' },
    { divider: true },
    { text: 'Action 2', href: '#' }
  ]

  const wrapper = mount(VibeDropdown, {
    props: {
      id: 'test-dropdown',
      text: 'Menu',
      items
    }
  })

  expect(wrapper.findAll('.dropdown-item')).toHaveLength(2)
  expect(wrapper.find('.dropdown-divider').exists()).toBe(true)
})
```

## Running Tests

Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

Run tests:

```bash
npm test              # Run tests in watch mode
npm run test:ui       # Run with UI
npm run test:coverage # Generate coverage report
```

## Best Practices

1. **Test data transformations**: Verify that prop data is correctly rendered
2. **Test user interactions**: Simulate clicks, inputs, and other events
3. **Test accessibility**: Check ARIA attributes and semantic HTML
4. **Test edge cases**: Empty arrays, missing data, invalid values
5. **Test scoped slots**: Verify custom rendering works correctly
6. **Test events**: Ensure components emit correct events with proper payloads

## CI/CD Integration

Add to GitHub Actions (`.github/workflows/test.yml`):

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run build
```
