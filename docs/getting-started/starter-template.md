# Starter Template

A complete, copy-pasteable minimal VibeUI app showing the recommended setup and patterns. Everything below runs as-is — no placeholders.

## Install

```bash
npm install @velkymx/vibeui bootstrap
```

### Optional peer dependencies

Install these only if you use the components that need them:

- `bootstrap-icons` — required by `VibeIcon`.
- `quill` + `dompurify` — required by `VibeFormWysiwyg`.

```bash
npm install bootstrap-icons         # for VibeIcon
npm install quill dompurify         # for VibeFormWysiwyg
```

## `main.ts`

Register the plugin, import Bootstrap's CSS, and restore the saved color-mode preference **before** mounting so the theme is correct on first paint.

```ts
import { createApp } from 'vue'
import VibeUI, { useColorMode } from '@velkymx/vibeui'
import 'bootstrap/dist/css/bootstrap.min.css'
import App from './App.vue'

// Restore the saved light/dark/auto preference and attach the OS-theme listener.
useColorMode().initColorMode()

createApp(App).use(VibeUI).mount('#app')
```

> **Do NOT import Bootstrap JS — VibeUI manages it.** Importing `bootstrap` (the JS bundle) yourself can create duplicate component instances and event conflicts. VibeUI loads and disposes Bootstrap's JS internally. You only import Bootstrap's **CSS**.

## `App.vue`

Mount `<VibeToastHost />` once at the root so `useToast()` works anywhere. The example below wires `useForm` validation into a `<VibeFormGroup>` + `<VibeFormInput>`, shows a confirmation in a `<VibeModal v-model>`, and fires a toast on submit.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useForm, useToast, validators } from '@velkymx/vibeui'

const toast = useToast()

const { fields, errors, validate, reset } = useForm({
  name: '',
  email: '',
})

const showConfirm = ref(false)

const onSubmit = async () => {
  const result = await validate({
    name: [validators.required('Name is required')],
    email: [validators.required('Email is required'), validators.email()],
  })
  if (!result.valid) return
  showConfirm.value = true
}

const confirm = () => {
  showConfirm.value = false
  toast.success(`Welcome, ${fields.name}!`)
  reset()
}
</script>

<template>
  <VibeContainer class="py-4" style="max-width: 480px;">
    <h1 class="mb-4">Sign up</h1>

    <form @submit.prevent="onSubmit">
      <VibeFormGroup label="Name">
        <VibeFormInput
          v-model="fields.name"
          placeholder="Jane Doe"
          :validation-state="errors.name ? 'invalid' : null"
          :validation-message="errors.name"
        />
      </VibeFormGroup>

      <VibeFormGroup label="Email" class="mt-3">
        <VibeFormInput
          v-model="fields.email"
          type="email"
          placeholder="jane@example.com"
          :validation-state="errors.email ? 'invalid' : null"
          :validation-message="errors.email"
        />
      </VibeFormGroup>

      <VibeButton type="submit" variant="primary" class="mt-4">
        Create account
      </VibeButton>
    </form>

    <VibeModal v-model="showConfirm" title="Confirm details" centered>
      <p>Create an account for <strong>{{ fields.email }}</strong>?</p>
      <template #footer>
        <VibeButton variant="secondary" @click="showConfirm = false">Cancel</VibeButton>
        <VibeButton variant="primary" @click="confirm">Confirm</VibeButton>
      </template>
    </VibeModal>

    <!-- Mount once at the app root; renders the global toast queue. -->
    <VibeToastHost />
  </VibeContainer>
</template>
```

> `isValid` is `false` until the first `validate()` call, so gate submit on the `validate()` result (as above) rather than disabling the button by `isValid` alone.

## Recommended project structure

```
src/
  main.ts            # createApp + plugin + initColorMode (before mount)
  App.vue            # app shell; mounts <VibeToastHost /> once
  components/        # your reusable components
  composables/       # app-specific composables (useForm wrappers, etc.)
  views/             # route-level pages (if using vue-router)
```

Keep cross-app concerns at the root: `<VibeToastHost />` belongs in `App.vue`, and `initColorMode()` belongs in `main.ts` — both should appear exactly once.

## Coming from BootstrapVue?

The mental model is familiar — component-per-feature, data-driven `items` arrays, `v-model` for visibility/value, and props-based styling (`variant`, `size`) — but VibeUI is **not** a drop-in port. Component and prop names differ (`Vibe*` prefix), Bootstrap JS is managed for you, and interactive components lean on `v-model`. Use the [component docs](../README.md#components) to map features rather than expecting identical APIs.
```
