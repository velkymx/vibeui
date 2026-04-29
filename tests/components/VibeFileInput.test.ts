import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeFileInput from '../../src/components/VibeFileInput.vue'

const makeFile = (name: string, sizeBytes: number, type = 'text/plain'): File => {
  const blob = new Blob([new Uint8Array(sizeBytes)], { type })
  return new File([blob], name, { type })
}

const setFiles = async (input: HTMLInputElement, files: File[]) => {
  const dt = new DataTransfer()
  files.forEach(f => dt.items.add(f))
  input.files = dt.files
  input.dispatchEvent(new Event('change', { bubbles: true }))
  await Promise.resolve()
}

describe('VibeFileInput', () => {
  describe('basic', () => {
    it('renders file input with form-control class', () => {
      const wrapper = mount(VibeFileInput)
      const input = wrapper.find('input[type="file"]')
      expect(input.exists()).toBe(true)
      expect(input.classes()).toContain('form-control')
    })

    it('respects multiple prop', () => {
      const wrapper = mount(VibeFileInput, { props: { multiple: true } })
      expect(wrapper.find('input').attributes('multiple')).toBeDefined()
    })

    it('respects accept prop', () => {
      const wrapper = mount(VibeFileInput, { props: { accept: 'image/*' } })
      expect(wrapper.find('input').attributes('accept')).toBe('image/*')
    })

    it('renders label when provided', () => {
      const wrapper = mount(VibeFileInput, { props: { label: 'Upload' } })
      expect(wrapper.find('label').text()).toContain('Upload')
    })
  })

  describe('selection', () => {
    it('emits update:modelValue with File[] on change', async () => {
      const wrapper = mount(VibeFileInput, { props: { multiple: true } })
      const f1 = makeFile('a.txt', 10)
      const f2 = makeFile('b.txt', 20)
      await setFiles(wrapper.find('input').element as HTMLInputElement, [f1, f2])

      const emitted = wrapper.emitted('update:modelValue') as File[][][]
      expect(emitted).toBeTruthy()
      expect(emitted[0][0]).toHaveLength(2)
      expect(emitted[0][0][0].name).toBe('a.txt')
      expect(emitted[0][0][1].name).toBe('b.txt')
    })

    it('emits change event with FileList', async () => {
      const wrapper = mount(VibeFileInput)
      const f = makeFile('a.txt', 10)
      await setFiles(wrapper.find('input').element as HTMLInputElement, [f])

      expect(wrapper.emitted('change')).toBeTruthy()
    })
  })

  describe('maxSize validation', () => {
    it('rejects files larger than maxSize and emits invalid', async () => {
      const wrapper = mount(VibeFileInput, {
        props: { multiple: true, maxSize: 100 }
      })
      const small = makeFile('small.txt', 50)
      const big = makeFile('big.txt', 500)
      await setFiles(wrapper.find('input').element as HTMLInputElement, [small, big])

      const emitted = wrapper.emitted('update:modelValue') as File[][][]
      expect(emitted[0][0]).toHaveLength(1)
      expect(emitted[0][0][0].name).toBe('small.txt')

      const invalid = wrapper.emitted('invalid') as Array<[File[]]>
      expect(invalid).toBeTruthy()
      expect(invalid[0][0][0].name).toBe('big.txt')
    })

    it('accepts all files when no maxSize', async () => {
      const wrapper = mount(VibeFileInput, { props: { multiple: true } })
      const a = makeFile('a.txt', 1000)
      const b = makeFile('b.txt', 999_999)
      await setFiles(wrapper.find('input').element as HTMLInputElement, [a, b])

      const emitted = wrapper.emitted('update:modelValue') as File[][][]
      expect(emitted[0][0]).toHaveLength(2)
    })
  })

  describe('drag-drop zone', () => {
    it('renders drop zone container when dragDrop=true', () => {
      const wrapper = mount(VibeFileInput, { props: { dragDrop: true } })
      expect(wrapper.find('.vibe-file-input-dropzone').exists()).toBe(true)
    })

    it('does not render drop zone when dragDrop=false (default)', () => {
      const wrapper = mount(VibeFileInput)
      expect(wrapper.find('.vibe-file-input-dropzone').exists()).toBe(false)
    })

    it('handles drop event and emits update:modelValue', async () => {
      const wrapper = mount(VibeFileInput, { props: { dragDrop: true, multiple: true } })
      const f = makeFile('drop.txt', 10)

      const dt = new DataTransfer()
      dt.items.add(f)

      const dropEvent = new Event('drop', { bubbles: true, cancelable: true }) as DragEvent
      Object.defineProperty(dropEvent, 'dataTransfer', { value: dt })

      const zone = wrapper.find('.vibe-file-input-dropzone').element
      zone.dispatchEvent(dropEvent)
      await Promise.resolve()

      const emitted = wrapper.emitted('update:modelValue') as File[][][]
      expect(emitted).toBeTruthy()
      expect(emitted[0][0][0].name).toBe('drop.txt')
    })

    it('toggles isDragging class on dragenter/dragleave', async () => {
      const wrapper = mount(VibeFileInput, { props: { dragDrop: true } })
      const zone = wrapper.find('.vibe-file-input-dropzone')

      await zone.trigger('dragenter')
      expect(zone.classes()).toContain('vibe-file-input-dropzone-active')

      await zone.trigger('dragleave')
      expect(zone.classes()).not.toContain('vibe-file-input-dropzone-active')
    })
  })

  describe('disabled', () => {
    it('disables input when disabled=true', () => {
      const wrapper = mount(VibeFileInput, { props: { disabled: true } })
      expect(wrapper.find('input').attributes('disabled')).toBeDefined()
    })
  })
})
