import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeDatePicker from '../../src/components/VibeDatePicker.vue'

describe('VibeDatePicker', () => {
  describe('input + popover', () => {
    it('renders an input with form-control class', () => {
      const wrapper = mount(VibeDatePicker)
      expect(wrapper.find('input.form-control').exists()).toBe(true)
    })

    it('popover is closed by default', () => {
      const wrapper = mount(VibeDatePicker)
      expect(wrapper.find('.vibe-datepicker-popover').exists()).toBe(false)
    })

    it('clicking input opens popover and emits open', async () => {
      const wrapper = mount(VibeDatePicker)
      await wrapper.find('input').trigger('click')
      expect(wrapper.find('.vibe-datepicker-popover').exists()).toBe(true)
      expect(wrapper.emitted('open')).toBeTruthy()
    })

    it('clicking input again closes popover', async () => {
      const wrapper = mount(VibeDatePicker)
      await wrapper.find('input').trigger('click')
      await wrapper.find('input').trigger('click')
      expect(wrapper.find('.vibe-datepicker-popover').exists()).toBe(false)
      expect(wrapper.emitted('close')).toBeTruthy()
    })
  })

  describe('grid generation', () => {
    it('renders 42 day cells (6 weeks)', async () => {
      const wrapper = mount(VibeDatePicker, { props: { modelValue: '2025-04-15' } })
      await wrapper.find('input').trigger('click')
      const cells = wrapper.findAll('.vibe-datepicker-day')
      expect(cells).toHaveLength(42)
    })

    it('marks the selected date', async () => {
      const wrapper = mount(VibeDatePicker, { props: { modelValue: '2025-04-15' } })
      await wrapper.find('input').trigger('click')
      const selected = wrapper.find('[data-iso="2025-04-15"]')
      expect(selected.classes()).toContain('vibe-datepicker-day-selected')
    })

    it('navigates to previous month', async () => {
      const wrapper = mount(VibeDatePicker, { props: { modelValue: '2025-04-15' } })
      await wrapper.find('input').trigger('click')
      await wrapper.find('[data-prev-month]').trigger('click')
      // March 2025 has 31 days, March 1 should appear
      expect(wrapper.find('[data-iso="2025-03-01"]').exists()).toBe(true)
    })

    it('navigates to next month, wraps year boundary', async () => {
      const wrapper = mount(VibeDatePicker, { props: { modelValue: '2025-12-15' } })
      await wrapper.find('input').trigger('click')
      await wrapper.find('[data-next-month]').trigger('click')
      expect(wrapper.find('[data-iso="2026-01-01"]').exists()).toBe(true)
    })
  })

  describe('selection (single mode)', () => {
    it('clicking a day emits update:modelValue and closes', async () => {
      const wrapper = mount(VibeDatePicker, { props: { modelValue: '2025-04-15' } })
      await wrapper.find('input').trigger('click')

      await wrapper.find('[data-iso="2025-04-20"]').trigger('click')

      const emitted = wrapper.emitted('update:modelValue') as string[][]
      expect(emitted[emitted.length - 1][0]).toBe('2025-04-20')
      expect(wrapper.find('.vibe-datepicker-popover').exists()).toBe(false)
    })

    it('respects min and disables earlier dates', async () => {
      const wrapper = mount(VibeDatePicker, {
        props: { modelValue: '2025-04-15', min: '2025-04-10' }
      })
      await wrapper.find('input').trigger('click')

      const earlier = wrapper.find('[data-iso="2025-04-05"]')
      expect(earlier.classes()).toContain('vibe-datepicker-day-disabled')
      expect((earlier.element as HTMLButtonElement).disabled).toBe(true)
    })

    it('respects max and disables later dates', async () => {
      const wrapper = mount(VibeDatePicker, {
        props: { modelValue: '2025-04-15', max: '2025-04-20' }
      })
      await wrapper.find('input').trigger('click')

      const later = wrapper.find('[data-iso="2025-04-25"]')
      expect(later.classes()).toContain('vibe-datepicker-day-disabled')
    })

    it('disabledDates marks specific days as disabled', async () => {
      const wrapper = mount(VibeDatePicker, {
        props: { modelValue: '2025-04-15', disabledDates: ['2025-04-10'] }
      })
      await wrapper.find('input').trigger('click')
      const cell = wrapper.find('[data-iso="2025-04-10"]')
      expect(cell.classes()).toContain('vibe-datepicker-day-disabled')
    })

    it('clicking disabled day does not emit', async () => {
      const wrapper = mount(VibeDatePicker, {
        props: { modelValue: '2025-04-15', disabledDates: ['2025-04-10'] }
      })
      await wrapper.find('input').trigger('click')
      await wrapper.find('[data-iso="2025-04-10"]').trigger('click')
      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })
  })

  describe('range mode', () => {
    it('first click sets [date, null]', async () => {
      const wrapper = mount(VibeDatePicker, {
        props: { range: true, modelValue: [null, null] }
      })
      await wrapper.find('input').trigger('click')

      // Pick any visible day in the default (today's) view
      const firstDay = wrapper.find('.vibe-datepicker-day:not(.vibe-datepicker-day-disabled)')
      const iso = firstDay.attributes('data-iso')!
      await firstDay.trigger('click')

      const emitted = wrapper.emitted('update:modelValue') as Array<[Array<string | null>]>
      expect(emitted[0][0]).toEqual([iso, null])
      expect(wrapper.find('.vibe-datepicker-popover').exists()).toBe(true)
    })

    it('second click >= start sets [start, end] and closes', async () => {
      const wrapper = mount(VibeDatePicker, {
        props: { range: true, modelValue: ['2025-04-10', null] }
      })
      await wrapper.find('input').trigger('click')

      await wrapper.find('[data-iso="2025-04-15"]').trigger('click')

      const emitted = wrapper.emitted('update:modelValue') as Array<[Array<string | null>]>
      expect(emitted[0][0]).toEqual(['2025-04-10', '2025-04-15'])
      expect(wrapper.find('.vibe-datepicker-popover').exists()).toBe(false)
    })

    it('second click < start swaps so range stays ordered', async () => {
      const wrapper = mount(VibeDatePicker, {
        props: { range: true, modelValue: ['2025-04-15', null] }
      })
      await wrapper.find('input').trigger('click')

      await wrapper.find('[data-iso="2025-04-05"]').trigger('click')

      const emitted = wrapper.emitted('update:modelValue') as Array<[Array<string | null>]>
      expect(emitted[0][0]).toEqual(['2025-04-05', '2025-04-15'])
    })

    it('marks in-range days', async () => {
      const wrapper = mount(VibeDatePicker, {
        props: { range: true, modelValue: ['2025-04-10', '2025-04-15'] }
      })
      await wrapper.find('input').trigger('click')

      const middle = wrapper.find('[data-iso="2025-04-12"]')
      expect(middle.classes()).toContain('vibe-datepicker-day-in-range')

      const start = wrapper.find('[data-iso="2025-04-10"]')
      expect(start.classes()).toContain('vibe-datepicker-day-range-start')

      const end = wrapper.find('[data-iso="2025-04-15"]')
      expect(end.classes()).toContain('vibe-datepicker-day-range-end')
    })
  })

  describe('format', () => {
    it('uses format function for display', async () => {
      const wrapper = mount(VibeDatePicker, {
        props: {
          modelValue: '2025-04-15',
          format: (iso: string) => iso.split('-').reverse().join('/')
        }
      })
      const input = wrapper.find('input').element as HTMLInputElement
      expect(input.value).toBe('15/04/2025')
    })
  })

  describe('disabled', () => {
    it('clicking disabled input does not open popover', async () => {
      const wrapper = mount(VibeDatePicker, { props: { disabled: true } })
      await wrapper.find('input').trigger('click')
      expect(wrapper.find('.vibe-datepicker-popover').exists()).toBe(false)
    })
  })
})
