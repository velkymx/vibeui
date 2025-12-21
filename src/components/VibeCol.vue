<script setup lang="ts">
import { computed, type PropType } from 'vue'
import type { Tag, ColSize, OrderValue, AlignItems } from '../types'

const props = defineProps({
  tag: { type: String as PropType<Tag>, default: 'div' },

  // Column sizes
  cols: { type: [Number, String, Boolean] as PropType<ColSize | boolean>, default: undefined },
  sm: { type: [Number, String, Boolean] as PropType<ColSize | boolean>, default: undefined },
  md: { type: [Number, String, Boolean] as PropType<ColSize | boolean>, default: undefined },
  lg: { type: [Number, String, Boolean] as PropType<ColSize | boolean>, default: undefined },
  xl: { type: [Number, String, Boolean] as PropType<ColSize | boolean>, default: undefined },
  xxl: { type: [Number, String, Boolean] as PropType<ColSize | boolean>, default: undefined },

  // Offsets
  offset: { type: Number, default: undefined },
  offsetSm: { type: Number, default: undefined },
  offsetMd: { type: Number, default: undefined },
  offsetLg: { type: Number, default: undefined },
  offsetXl: { type: Number, default: undefined },
  offsetXxl: { type: Number, default: undefined },

  // Order
  order: { type: [Number, String] as PropType<OrderValue>, default: undefined },
  orderSm: { type: [Number, String] as PropType<OrderValue>, default: undefined },
  orderMd: { type: [Number, String] as PropType<OrderValue>, default: undefined },
  orderLg: { type: [Number, String] as PropType<OrderValue>, default: undefined },
  orderXl: { type: [Number, String] as PropType<OrderValue>, default: undefined },
  orderXxl: { type: [Number, String] as PropType<OrderValue>, default: undefined },

  // Alignment
  alignSelf: { type: String as PropType<AlignItems>, default: undefined }
})

const emit = defineEmits(['component-error'])

const colClass = computed(() => {
  const classes: string[] = []

  // Default to 'col' if no sizing props provided (auto-layout)
  const hasAnyColProp = props.cols !== undefined || props.sm !== undefined || props.md !== undefined || props.lg !== undefined || props.xl !== undefined || props.xxl !== undefined

  if (!hasAnyColProp) {
    classes.push('col')
  } else {
    // Base column classes
    if (props.cols === true) classes.push('col')
    else if (props.cols === 'auto') classes.push('col-auto')
    else if (props.cols) classes.push(`col-${props.cols}`)

    // Responsive breakpoints
    const breakpoints = [
      { name: 'sm', value: props.sm },
      { name: 'md', value: props.md },
      { name: 'lg', value: props.lg },
      { name: 'xl', value: props.xl },
      { name: 'xxl', value: props.xxl }
    ]

    breakpoints.forEach(({ name, value }) => {
      if (value === true) classes.push(`col-${name}`)
      else if (value === 'auto') classes.push(`col-${name}-auto`)
      else if (value !== undefined) classes.push(`col-${name}-${value}`)
    })
  }

  // Offsets
  if (props.offset !== undefined) classes.push(`offset-${props.offset}`)
  if (props.offsetSm !== undefined) classes.push(`offset-sm-${props.offsetSm}`)
  if (props.offsetMd !== undefined) classes.push(`offset-md-${props.offsetMd}`)
  if (props.offsetLg !== undefined) classes.push(`offset-lg-${props.offsetLg}`)
  if (props.offsetXl !== undefined) classes.push(`offset-xl-${props.offsetXl}`)
  if (props.offsetXxl !== undefined) classes.push(`offset-xxl-${props.offsetXxl}`)

  // Order
  if (props.order !== undefined) classes.push(`order-${props.order}`)
  if (props.orderSm !== undefined) classes.push(`order-sm-${props.orderSm}`)
  if (props.orderMd !== undefined) classes.push(`order-md-${props.orderMd}`)
  if (props.orderLg !== undefined) classes.push(`order-lg-${props.orderLg}`)
  if (props.orderXl !== undefined) classes.push(`order-xl-${props.orderXl}`)
  if (props.orderXxl !== undefined) classes.push(`order-xxl-${props.orderXxl}`)

  // Alignment
  if (props.alignSelf) classes.push(`align-self-${props.alignSelf}`)

  return classes.join(' ')
})
</script>

<template>
  <component :is="tag" :class="colClass">
    <slot />
  </component>
</template>
