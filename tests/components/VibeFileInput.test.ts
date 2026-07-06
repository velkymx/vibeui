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

  describe('H6 same-file re-select', () => {
    it('clears input.value after processing so the same file fires change again', async () => {
      const wrapper = mount(VibeFileInput)
      const input = wrapper.find('input').element as HTMLInputElement
      const f = makeFile('a.txt', 10)
      await setFiles(input, [f])
      expect(input.value).toBe('')
    })
  })

  describe('M19 dragend / drop document safety net', () => {
    it('isDragging resets when dragend fires anywhere on the document', async () => {
      const wrapper = mount(VibeFileInput, {
        props: { dragDrop: true },
        attachTo: document.body
      })

      const zone = wrapper.find('.vibe-file-input-dropzone')
      await zone.trigger('dragenter')
      expect(zone.classes()).toContain('vibe-file-input-dropzone-active')

      // User drags off the page entirely; document dragend fires.
      document.dispatchEvent(new DragEvent('dragend', { bubbles: true }))
      await Promise.resolve()

      expect(wrapper.find('.vibe-file-input-dropzone').classes())
        .not.toContain('vibe-file-input-dropzone-active')
      wrapper.unmount()
    })

    it('isDragging resets when drop fires somewhere else on the document', async () => {
      const wrapper = mount(VibeFileInput, {
        props: { dragDrop: true },
        attachTo: document.body
      })

      const zone = wrapper.find('.vibe-file-input-dropzone')
      await zone.trigger('dragenter')
      expect(zone.classes()).toContain('vibe-file-input-dropzone-active')

      document.dispatchEvent(new DragEvent('drop', { bubbles: true }))
      await Promise.resolve()

      expect(wrapper.find('.vibe-file-input-dropzone').classes())
        .not.toContain('vibe-file-input-dropzone-active')
      wrapper.unmount()
    })
  })

  describe('H8 accept validation', () => {
    it('rejects files whose MIME does not match accept="image/*" via drop', async () => {
      const wrapper = mount(VibeFileInput, {
        props: { dragDrop: true, multiple: true, accept: 'image/*' },
        attachTo: document.body
      })

      const img = makeFile('a.png', 10, 'image/png')
      const pdf = makeFile('b.pdf', 10, 'application/pdf')

      const dt = new DataTransfer()
      dt.items.add(img)
      dt.items.add(pdf)
      const dropEvent = new Event('drop', { bubbles: true, cancelable: true }) as DragEvent
      Object.defineProperty(dropEvent, 'dataTransfer', { value: dt })

      wrapper.find('.vibe-file-input-dropzone').element.dispatchEvent(dropEvent)
      await Promise.resolve()

      const accepted = wrapper.emitted('update:modelValue') as File[][][]
      expect(accepted[0][0]).toHaveLength(1)
      expect(accepted[0][0][0].name).toBe('a.png')

      const invalid = wrapper.emitted('invalid') as File[][][]
      expect(invalid).toBeTruthy()
      expect(invalid[0][0][0].name).toBe('b.pdf')

      wrapper.unmount()
    })

    it('rejects files whose extension does not match accept=".pdf,.docx"', async () => {
      const wrapper = mount(VibeFileInput, {
        props: { multiple: true, accept: '.pdf,.docx' }
      })

      const pdf = makeFile('doc.pdf', 10, 'application/pdf')
      const txt = makeFile('notes.txt', 10, 'text/plain')

      await setFiles(wrapper.find('input').element as HTMLInputElement, [pdf, txt])

      const accepted = wrapper.emitted('update:modelValue') as File[][][]
      expect(accepted[0][0].map(f => f.name)).toEqual(['doc.pdf'])
      const invalid = wrapper.emitted('invalid') as File[][][]
      expect(invalid[0][0].map(f => f.name)).toEqual(['notes.txt'])
    })

    it('accepts every file when no accept prop is set', async () => {
      const wrapper = mount(VibeFileInput, { props: { multiple: true } })
      await setFiles(wrapper.find('input').element as HTMLInputElement, [
        makeFile('a.png', 10, 'image/png'),
        makeFile('b.exe', 10, 'application/octet-stream')
      ])
      const accepted = wrapper.emitted('update:modelValue') as File[][][]
      expect(accepted[0][0]).toHaveLength(2)
    })

    it('combines size and type rejection into a single invalid emit', async () => {
      const wrapper = mount(VibeFileInput, {
        props: { multiple: true, accept: 'image/*', maxSize: 100 }
      })
      const okImg = makeFile('ok.png', 50, 'image/png')
      const bigImg = makeFile('big.png', 500, 'image/png')
      const wrongType = makeFile('doc.pdf', 50, 'application/pdf')

      await setFiles(wrapper.find('input').element as HTMLInputElement, [okImg, bigImg, wrongType])

      const accepted = wrapper.emitted('update:modelValue') as File[][][]
      expect(accepted[0][0].map(f => f.name)).toEqual(['ok.png'])
      const invalid = wrapper.emitted('invalid') as File[][][]
      expect(invalid[0][0].map(f => f.name).sort()).toEqual(['big.png', 'doc.pdf'])
    })
  })

  describe('H7 dropzone click recursion', () => {
    it('clicking dropzone opens file dialog exactly once (no recursive bubble)', async () => {
      const wrapper = mount(VibeFileInput, {
        props: { dragDrop: true },
        attachTo: document.body
      })

      let clickCount = 0
      const input = wrapper.find('input[type="file"]').element as HTMLInputElement
      input.addEventListener('click', () => {
        clickCount += 1
      })

      await wrapper.find('.vibe-file-input-dropzone').trigger('click')
      // Wait a microtask for any cascading bubble
      await Promise.resolve()

      expect(clickCount).toBe(1)
      wrapper.unmount()
    })
  })

  // V111-6: VibeFileInput must implement the same validation contract as the
  // other form controls (validationState/validationMessage props, feedback
  // block with role="alert", aria wiring, Bootstrap is-valid/is-invalid).
  describe('validation contract', () => {
    it('renders invalid-feedback with role="alert" when validationState is invalid', () => {
      const wrapper = mount(VibeFileInput, {
        props: { id: 'doc', validationState: 'invalid', validationMessage: 'File too large' }
      })

      const feedback = wrapper.find('.invalid-feedback')
      expect(feedback.exists()).toBe(true)
      expect(feedback.text()).toContain('File too large')
      expect(feedback.attributes('role')).toBe('alert')
    })

    it('renders valid-feedback without role="alert" when validationState is valid', () => {
      const wrapper = mount(VibeFileInput, {
        props: { id: 'doc', validationState: 'valid', validationMessage: 'Looks good!' }
      })

      const feedback = wrapper.find('.valid-feedback')
      expect(feedback.exists()).toBe(true)
      expect(feedback.attributes('role')).toBeUndefined()
    })

    it('applies is-invalid, aria-invalid, and aria-describedby to the input', () => {
      const wrapper = mount(VibeFileInput, {
        props: { id: 'doc', validationState: 'invalid', validationMessage: 'File too large' }
      })

      const input = wrapper.find('input[type="file"]')
      expect(input.classes()).toContain('is-invalid')
      expect(input.attributes('aria-invalid')).toBe('true')
      expect(input.attributes('aria-describedby')).toBe('doc-feedback')
    })

    it('aria-describedby lists help and feedback ids when both present', () => {
      const wrapper = mount(VibeFileInput, {
        props: { id: 'doc', helpText: 'PDF only', validationState: 'invalid', validationMessage: 'Nope' }
      })

      expect(wrapper.find('input[type="file"]').attributes('aria-describedby')).toBe('doc-help doc-feedback')
      expect(wrapper.find('.form-text').attributes('id')).toBe('doc-help')
    })

    it('marks the dropzone invalid in dragDrop mode (native input is hidden there)', () => {
      const wrapper = mount(VibeFileInput, {
        props: { id: 'doc', dragDrop: true, validationState: 'invalid', validationMessage: 'Nope' }
      })

      expect(wrapper.find('.vibe-file-input-dropzone').classes()).toContain('vibe-file-input-dropzone-invalid')
    })

    it('renders no feedback block when validationState is null', () => {
      const wrapper = mount(VibeFileInput, { props: { id: 'doc' } })

      expect(wrapper.find('.invalid-feedback').exists()).toBe(false)
      expect(wrapper.find('.valid-feedback').exists()).toBe(false)
      expect(wrapper.find('input[type="file"]').attributes('aria-invalid')).toBe('false')
    })
  })

  // Consumer HTML attributes must land on the native file input, not the wrapper
  // <div> — native multipart form submission needs `name` on the control.
  describe('$attrs passthrough to the native input', () => {
    it('forwards name to the file input, not the wrapper div', () => {
      const wrapper = mount(VibeFileInput, {
        props: { id: 'doc' },
        attrs: { name: 'attachment', capture: 'environment' }
      })

      const input = wrapper.find('input[type="file"]')
      expect(input.attributes('name')).toBe('attachment')
      expect(input.attributes('capture')).toBe('environment')
      expect(wrapper.attributes('name')).toBeUndefined()
    })
  })
})
