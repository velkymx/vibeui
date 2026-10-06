import { assertType } from 'vitest'
import '../../src/global-directives'
import type { GlobalDirectives } from 'vue'
import { vTooltip, type TooltipBindingValue } from '../../src/directives/vTooltip'

// #153: v-vibe-tooltip is typed under the global registration, so templates
// get value checking, autocomplete, and typo flagging.
assertType<typeof vTooltip>({} as GlobalDirectives['vVibeTooltip'])

// The directive accepts a string, an options object, or undefined.
const strValue: TooltipBindingValue = 'Save changes'
const objValue: TooltipBindingValue = { title: 'New tab', placement: 'end' }
const undefValue: TooltipBindingValue = undefined
void strValue
void objValue
void undefValue

// @ts-expect-error numbers are not valid tooltip values
const badValue: TooltipBindingValue = 42
void badValue

// @ts-expect-error typos in the directive name are flagged
type TypoDirective = GlobalDirectives['vVibeTypo']
void (null as unknown as TypoDirective)
