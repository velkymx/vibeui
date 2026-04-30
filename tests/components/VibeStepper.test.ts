import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import VibeStepper from '../../src/components/VibeStepper.vue'

const baseSteps = [
  { label: 'Account' },
  { label: 'Profile' },
  { label: 'Confirm' }
]

describe('VibeStepper', () => {
  describe('basic rendering', () => {
    it('renders one step header per item', () => {
      const wrapper = mount(VibeStepper, {
        props: { steps: baseSteps, modelValue: 0 }
      })
      const headers = wrapper.findAll('.vibe-stepper-step')
      expect(headers).toHaveLength(3)
    })

    it('marks current step active', () => {
      const wrapper = mount(VibeStepper, {
        props: { steps: baseSteps, modelValue: 1 }
      })
      const headers = wrapper.findAll('.vibe-stepper-step')
      expect(headers[0].classes()).toContain('vibe-stepper-completed')
      expect(headers[1].classes()).toContain('vibe-stepper-active')
      expect(headers[2].classes()).not.toContain('vibe-stepper-active')
    })

    it('renders step labels', () => {
      const wrapper = mount(VibeStepper, {
        props: { steps: baseSteps, modelValue: 0 }
      })
      expect(wrapper.text()).toContain('Account')
      expect(wrapper.text()).toContain('Profile')
      expect(wrapper.text()).toContain('Confirm')
    })
  })

  describe('navigation', () => {
    it('next() advances activeStep and emits update:modelValue', async () => {
      const wrapper = mount(VibeStepper, {
        props: { steps: baseSteps, modelValue: 0 }
      })
      await wrapper.find('[data-stepper-next]').trigger('click')
      const emitted = wrapper.emitted('update:modelValue') as number[][]
      expect(emitted[0][0]).toBe(1)
    })

    it('prev() decrements activeStep', async () => {
      const wrapper = mount(VibeStepper, {
        props: { steps: baseSteps, modelValue: 1 }
      })
      await wrapper.find('[data-stepper-prev]').trigger('click')
      const emitted = wrapper.emitted('update:modelValue') as number[][]
      expect(emitted[0][0]).toBe(0)
    })

    it('next() at last step does not emit', async () => {
      const wrapper = mount(VibeStepper, {
        props: { steps: baseSteps, modelValue: 2 }
      })
      await wrapper.find('[data-stepper-next]').trigger('click')
      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })

    it('prev() at first step does not emit', async () => {
      const wrapper = mount(VibeStepper, {
        props: { steps: baseSteps, modelValue: 0 }
      })
      await wrapper.find('[data-stepper-prev]').trigger('click')
      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })

    it('linear mode (default): clicking ahead step is disallowed', async () => {
      const wrapper = mount(VibeStepper, {
        props: { steps: baseSteps, modelValue: 0 }
      })
      await wrapper.findAll('.vibe-stepper-step')[2].trigger('click')
      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })

    it('linear mode: clicking previous step is allowed', async () => {
      const wrapper = mount(VibeStepper, {
        props: { steps: baseSteps, modelValue: 2 }
      })
      await wrapper.findAll('.vibe-stepper-step')[0].trigger('click')
      const emitted = wrapper.emitted('update:modelValue') as number[][]
      expect(emitted[0][0]).toBe(0)
    })

    it('non-linear mode: clicking any step jumps', async () => {
      const wrapper = mount(VibeStepper, {
        props: { steps: baseSteps, modelValue: 0, linear: false }
      })
      await wrapper.findAll('.vibe-stepper-step')[2].trigger('click')
      const emitted = wrapper.emitted('update:modelValue') as number[][]
      expect(emitted[0][0]).toBe(2)
    })
  })

  describe('validation hooks', () => {
    it('beforeNext returning false blocks advance', async () => {
      const Harness = defineComponent({
        components: { VibeStepper },
        data() {
          return { active: 0 }
        },
        methods: {
          guard() {
            return false
          }
        },
        render() {
          return h(VibeStepper as never, {
            steps: baseSteps,
            modelValue: this.active,
            'onUpdate:modelValue': (v: number) => {
              this.active = v
            },
            beforeNext: this.guard
          })
        }
      })
      const wrapper = mount(Harness)
      await wrapper.find('[data-stepper-next]').trigger('click')
      await nextTick()
      expect((wrapper.vm as unknown as { active: number }).active).toBe(0)
    })

    it('beforeNext returning true allows advance', async () => {
      const Harness = defineComponent({
        components: { VibeStepper },
        data() {
          return { active: 0 }
        },
        methods: {
          guard() {
            return true
          }
        },
        render() {
          return h(VibeStepper as never, {
            steps: baseSteps,
            modelValue: this.active,
            'onUpdate:modelValue': (v: number) => {
              this.active = v
            },
            beforeNext: this.guard
          })
        }
      })
      const wrapper = mount(Harness)
      await wrapper.find('[data-stepper-next]').trigger('click')
      await nextTick()
      expect((wrapper.vm as unknown as { active: number }).active).toBe(1)
    })

    it('beforeNext returning a Promise<false> blocks advance', async () => {
      const Harness = defineComponent({
        components: { VibeStepper },
        data() {
          return { active: 0 }
        },
        methods: {
          async guard() {
            return false
          }
        },
        render() {
          return h(VibeStepper as never, {
            steps: baseSteps,
            modelValue: this.active,
            'onUpdate:modelValue': (v: number) => {
              this.active = v
            },
            beforeNext: this.guard
          })
        }
      })
      const wrapper = mount(Harness)
      await wrapper.find('[data-stepper-next]').trigger('click')
      await new Promise(r => setTimeout(r, 10))
      expect((wrapper.vm as unknown as { active: number }).active).toBe(0)
    })
  })

  describe('layout', () => {
    it('vertical adds vertical class', () => {
      const wrapper = mount(VibeStepper, {
        props: { steps: baseSteps, modelValue: 0, vertical: true }
      })
      expect(wrapper.find('.vibe-stepper').classes()).toContain('vibe-stepper-vertical')
    })

    it('renders step content via scoped slot', () => {
      const wrapper = mount(VibeStepper, {
        props: { steps: baseSteps, modelValue: 1 },
        slots: {
          step: '<template #step="{ index, step }"><span class="content">{{ index }}-{{ step.label }}</span></template>'
        }
      })
      // Only the active step's slot content is rendered in the body section.
      const body = wrapper.find('.vibe-stepper-body')
      expect(body.exists()).toBe(true)
    })
  })

  describe('H1 jumpTo runs guards', () => {
    it('forward jump runs beforeNext; blocked when guard returns false', async () => {
      const Harness = defineComponent({
        components: { VibeStepper },
        data() {
          return { active: 0, callsNext: 0, callsPrev: 0 }
        },
        methods: {
          guardNext(): boolean {
            this.callsNext += 1
            return false
          },
          guardPrev(): boolean {
            this.callsPrev += 1
            return true
          }
        },
        render() {
          return h(VibeStepper as never, {
            steps: baseSteps,
            modelValue: this.active,
            linear: false,
            'onUpdate:modelValue': (v: number) => {
              this.active = v
            },
            beforeNext: this.guardNext,
            beforePrev: this.guardPrev
          })
        }
      })
      const wrapper = mount(Harness)
      await wrapper.findAll('.vibe-stepper-step')[2].trigger('click')
      await nextTick()
      const vm = wrapper.vm as unknown as { active: number; callsNext: number; callsPrev: number }
      expect(vm.callsNext).toBe(1)
      expect(vm.callsPrev).toBe(0)
      expect(vm.active).toBe(0)
    })

    it('backward jump runs beforePrev; blocked when guard returns false', async () => {
      const Harness = defineComponent({
        components: { VibeStepper },
        data() {
          return { active: 2, callsPrev: 0 }
        },
        methods: {
          guardPrev(): boolean {
            this.callsPrev += 1
            return false
          }
        },
        render() {
          return h(VibeStepper as never, {
            steps: baseSteps,
            modelValue: this.active,
            'onUpdate:modelValue': (v: number) => {
              this.active = v
            },
            beforePrev: this.guardPrev
          })
        }
      })
      const wrapper = mount(Harness)
      await wrapper.findAll('.vibe-stepper-step')[0].trigger('click')
      await nextTick()
      const vm = wrapper.vm as unknown as { active: number; callsPrev: number }
      expect(vm.callsPrev).toBe(1)
      expect(vm.active).toBe(2)
    })

    it('forward jump allowed when beforeNext returns true', async () => {
      const Harness = defineComponent({
        components: { VibeStepper },
        data() {
          return { active: 0 }
        },
        methods: {
          guardNext(): boolean {
            return true
          }
        },
        render() {
          return h(VibeStepper as never, {
            steps: baseSteps,
            modelValue: this.active,
            linear: false,
            'onUpdate:modelValue': (v: number) => {
              this.active = v
            },
            beforeNext: this.guardNext
          })
        }
      })
      const wrapper = mount(Harness)
      await wrapper.findAll('.vibe-stepper-step')[2].trigger('click')
      await nextTick()
      const vm = wrapper.vm as unknown as { active: number }
      expect(vm.active).toBe(2)
    })
  })

  describe('H2 concurrency guard on async beforeNext', () => {
    it('ignores additional Next clicks while a guard promise is pending', async () => {
      let resolveGate: ((v: boolean) => void) | undefined
      const guard = () => new Promise<boolean>(resolve => {
        resolveGate = resolve
      })
      const Harness = defineComponent({
        components: { VibeStepper },
        data() {
          return { active: 0, calls: 0 }
        },
        methods: {
          run() {
            this.calls += 1
            return guard()
          }
        },
        render() {
          return h(VibeStepper as never, {
            steps: baseSteps,
            modelValue: this.active,
            'onUpdate:modelValue': (v: number) => {
              this.active = v
            },
            beforeNext: this.run
          })
        }
      })
      const wrapper = mount(Harness)
      await wrapper.find('[data-stepper-next]').trigger('click')
      await wrapper.find('[data-stepper-next]').trigger('click')
      await wrapper.find('[data-stepper-next]').trigger('click')

      const vm = wrapper.vm as unknown as { active: number; calls: number }
      expect(vm.calls).toBe(1)
      expect(vm.active).toBe(0)

      resolveGate?.(true)
      await new Promise(r => setTimeout(r, 0))
      await nextTick()

      expect(vm.active).toBe(1)
    })
  })
})
