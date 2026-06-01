<script setup lang="ts">
import { computed, type PropType } from 'vue'
import type { Tag, GutterSize, RowColsSize, AlignItems, JustifyContent } from '../types'

const props = defineProps({
  tag: { type: String as PropType<Tag>, default: 'div' },

  // Base gutters
  gutters: { type: Number as PropType<GutterSize>, default: undefined },
  guttersX: { type: Number as PropType<GutterSize>, default: undefined },
  guttersY: { type: Number as PropType<GutterSize>, default: undefined },

  // Responsive gutters
  guttersSm: { type: Number as PropType<GutterSize>, default: undefined },
  guttersMd: { type: Number as PropType<GutterSize>, default: undefined },
  guttersLg: { type: Number as PropType<GutterSize>, default: undefined },
  guttersXl: { type: Number as PropType<GutterSize>, default: undefined },
  guttersXxl: { type: Number as PropType<GutterSize>, default: undefined },

  guttersXSm: { type: Number as PropType<GutterSize>, default: undefined },
  guttersXMd: { type: Number as PropType<GutterSize>, default: undefined },
  guttersXLg: { type: Number as PropType<GutterSize>, default: undefined },
  guttersXXl: { type: Number as PropType<GutterSize>, default: undefined },
  guttersXXxl: { type: Number as PropType<GutterSize>, default: undefined },

  guttersYSm: { type: Number as PropType<GutterSize>, default: undefined },
  guttersYMd: { type: Number as PropType<GutterSize>, default: undefined },
  guttersYLg: { type: Number as PropType<GutterSize>, default: undefined },
  guttersYXl: { type: Number as PropType<GutterSize>, default: undefined },
  guttersYXxl: { type: Number as PropType<GutterSize>, default: undefined },

  // Row columns
  rowCols: { type: Number as PropType<RowColsSize>, default: undefined },
  rowColsSm: { type: Number as PropType<RowColsSize>, default: undefined },
  rowColsMd: { type: Number as PropType<RowColsSize>, default: undefined },
  rowColsLg: { type: Number as PropType<RowColsSize>, default: undefined },
  rowColsXl: { type: Number as PropType<RowColsSize>, default: undefined },
  rowColsXxl: { type: Number as PropType<RowColsSize>, default: undefined },

  // Alignment
  alignItems: { type: String as PropType<AlignItems>, default: undefined },
  justifyContent: { type: String as PropType<JustifyContent>, default: undefined }
})

const emit = defineEmits(['component-error'])

const rowClass = computed(() => {
  const classes: string[] = ['row']

  // Base gutters
  if (props.gutters !== undefined) classes.push(`g-${props.gutters}`)
  if (props.guttersX !== undefined) classes.push(`gx-${props.guttersX}`)
  if (props.guttersY !== undefined) classes.push(`gy-${props.guttersY}`)

  // Responsive gutters
  const breakpoints = ['sm', 'md', 'lg', 'xl', 'xxl'] as const
  breakpoints.forEach(bp => {
    const bpCap = bp.charAt(0).toUpperCase() + bp.slice(1)

    const guttersKey = `gutters${bpCap}` as keyof typeof props
    if (props[guttersKey] !== undefined) classes.push(`g-${bp}-${props[guttersKey]}`)

    const guttersXKey = `guttersX${bpCap}` as keyof typeof props
    if (props[guttersXKey] !== undefined) classes.push(`gx-${bp}-${props[guttersXKey]}`)

    const guttersYKey = `guttersY${bpCap}` as keyof typeof props
    if (props[guttersYKey] !== undefined) classes.push(`gy-${bp}-${props[guttersYKey]}`)
  })

  // Row columns
  if (props.rowCols !== undefined) classes.push(`row-cols-${props.rowCols}`)
  breakpoints.forEach(bp => {
    const rowColsKey = `rowCols${bp.charAt(0).toUpperCase() + bp.slice(1)}` as keyof typeof props
    if (props[rowColsKey] !== undefined) classes.push(`row-cols-${bp}-${props[rowColsKey]}`)
  })

  // Alignment
  if (props.alignItems) classes.push(`align-items-${props.alignItems}`)
  if (props.justifyContent) classes.push(`justify-content-${props.justifyContent}`)

  return classes.join(' ')
})
</script>

<template>
  <component :is="tag" :class="rowClass">
    <slot />
  </component>
</template>
