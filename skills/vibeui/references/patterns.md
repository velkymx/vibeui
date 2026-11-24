# VibeUI patterns

Copy these shapes, then adjust copy and data. They assume `@velkymx/vibeui` is installed and the app imports Bootstrap CSS + VibeUI CSS.

## 1. App shell: navbar, page header, content

```vue
<script setup lang="ts">
const navItems = [
  { text: 'Dashboard', to: '/', active: true },
  { text: 'Invoices', to: '/invoices' },
  { text: 'Team', to: '/team' }
]
</script>

<template>
  <VibeNavbar expand="lg">
    <VibeNavbarBrand to="/">Acme</VibeNavbarBrand>
    <VibeNavbarToggle target="main-nav" />
    <VibeCollapse id="main-nav" is-nav>
      <VibeNavbarNav :items="navItems" />
    </VibeCollapse>
  </VibeNavbar>

  <VibeContainer class="py-4">
    <VibeBreadcrumb
      :items="[{ text: 'Home', to: '/' }, { text: 'Invoices', active: true }]"
      class="mb-3"
    />

    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
      <div>
        <h1 class="h3 mb-1">Invoices</h1>
        <p class="text-body-secondary mb-0">Billing history for this workspace.</p>
      </div>
      <VibeButton variant="primary" to="/invoices/new">New invoice</VibeButton>
    </div>

    <slot />
  </VibeContainer>
</template>
```

One primary action in the header. It stays available while the content is loading or empty.

## 2. Sign-in: one task, no marketing

```vue
<script setup lang="ts">
import { useForm, validators } from '@velkymx/vibeui'

const form = useForm({ email: '', password: '' })
const rules = {
  email: [validators.required(), validators.email()],
  password: [validators.required(), validators.minLength(8)]
}
const submit = async () => {
  const { valid } = await form.validate(rules)
  if (!valid) return
  // sign in with form.values.value
}
</script>

<template>
  <VibeContainer class="py-5">
    <VibeRow class="justify-content-center">
      <VibeCol :cols="12" :sm="10" :md="6" :lg="4">
        <VibeCard title="Sign in">
          <form novalidate @submit.prevent="submit">
            <VibeFormGroup
              label="Email"
              :validation-state="form.errors.email ? 'invalid' : null"
              :validation-message="form.errors.email"
            >
              <VibeFormInput
                v-model="form.fields.email"
                type="email"
                autocomplete="email"
                @validate="form.validateField('email', rules.email)"
              />
            </VibeFormGroup>

            <VibeFormGroup
              label="Password"
              :validation-state="form.errors.password ? 'invalid' : null"
              :validation-message="form.errors.password"
            >
              <VibeFormInput
                v-model="form.fields.password"
                type="password"
                autocomplete="current-password"
                @validate="form.validateField('password', rules.password)"
              />
            </VibeFormGroup>

            <VibeButton type="submit" variant="primary" class="w-100">Sign in</VibeButton>
          </form>
        </VibeCard>
      </VibeCol>
    </VibeRow>
  </VibeContainer>
</template>
```

## 3. Settings form: persistent labels, explicit save

```vue
<script setup lang="ts">
import { useForm, useToast, validators } from '@velkymx/vibeui'

const toast = useToast()
const form = useForm({ name: '', email: '', plan: 'team', digest: true })
const rules = {
  name: [validators.required()],
  email: [validators.required(), validators.email()]
}
const plans = [
  { value: 'solo', text: 'Solo' },
  { value: 'team', text: 'Team' },
  { value: 'scale', text: 'Scale' }
]

const save = async () => {
  const { valid } = await form.validate(rules)
  if (!valid) return
  // persist form.values.value
  toast.success('Settings saved')
}
</script>

<template>
  <VibeCard title="Account settings">
    <form novalidate @submit.prevent="save">
      <VibeFormGroup
        label="Full name"
        help-text="Shown on invoices and shared links."
        :validation-state="form.errors.name ? 'invalid' : null"
        :validation-message="form.errors.name"
      >
        <VibeFormInput
          v-model="form.fields.name"
          autocomplete="name"
          @validate="form.validateField('name', rules.name)"
        />
      </VibeFormGroup>

      <VibeFormGroup
        label="Email"
        help-text="Used for receipts and sign-in."
        :validation-state="form.errors.email ? 'invalid' : null"
        :validation-message="form.errors.email"
      >
        <VibeFormInput
          v-model="form.fields.email"
          type="email"
          autocomplete="email"
          @validate="form.validateField('email', rules.email)"
        />
      </VibeFormGroup>

      <VibeFormGroup label="Plan">
        <VibeFormSelect v-model="form.fields.plan" :options="plans" />
      </VibeFormGroup>

      <VibeFormGroup label="Weekly summary" help-text="A short email every Monday.">
        <VibeFormSwitch v-model="form.fields.digest" />
      </VibeFormGroup>

      <div class="d-flex gap-2">
        <VibeButton type="submit" variant="primary">Save changes</VibeButton>
        <VibeButton variant="secondary" @click="form.reset()">Discard</VibeButton>
      </div>
    </form>
  </VibeCard>
</template>
```

## 4. Data table: states, typed columns, row actions

```vue
<script setup lang="ts">
import type { DataTableColumn } from '@velkymx/vibeui'

interface Invoice {
  id: number
  customer: string
  status: 'paid' | 'open'
  total: number
  /** Render-only column: the row has no data field for it. */
  actions?: never
}

const props = defineProps<{ rows: Invoice[]; pending: boolean }>()
const emit = defineEmits<{ edit: [row: Invoice]; delete: [row: Invoice] }>()

const columns: DataTableColumn<Invoice>[] = [
  { key: 'customer', label: 'Customer' },
  {
    key: 'status',
    label: 'Status',
    sortable: false
  },
  {
    key: 'total',
    label: 'Total',
    align: 'end',
    formatter: (value) => `$${value}`
  },
  { key: 'actions', label: '', sortable: false }
]

const remove = (row: Invoice) => emit('delete', row)
</script>

<template>
  <VibeDataTable
    :columns="columns"
    :items="props.rows"
    :loading="props.pending"
    row-key="id"
    empty-text="No invoices match these filters."
  >
    <template #cell(status)="{ value }">
      <VibeBadge :variant="value === 'paid' ? 'success' : 'secondary'">{{ value }}</VibeBadge>
    </template>

    <template #cell(actions)="{ item }">
      <div class="d-flex gap-1 justify-content-end">
        <VibeButton size="sm" variant="secondary" outline @click="emit('edit', item)">Edit</VibeButton>
        <VibeButton size="sm" variant="danger" outline @click="remove(item)">Delete</VibeButton>
      </div>
    </template>
  </VibeDataTable>
</template>
```

`loading` renders a pending row; `empty-text` renders when the result is empty. There is no `#empty` slot today, so keep the primary action in the page header.

## 5. Dialog form plus toast

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '@velkymx/vibeui'

const open = ref(false)
const email = ref('')
const toast = useToast()

const send = () => {
  if (!email.value) return
  open.value = false
  email.value = ''
  toast.success('Invite sent')
}
</script>

<template>
  <VibeButton variant="primary" @click="open = true">Invite teammate</VibeButton>

  <VibeModal v-model="open" title="Invite a teammate" size="sm">
    <VibeFormGroup label="Email" help-text="They will get a link to join this workspace.">
      <VibeFormInput v-model="email" type="email" autocomplete="email" />
    </VibeFormGroup>

    <template #footer>
      <VibeButton variant="secondary" @click="open = false">Cancel</VibeButton>
      <VibeButton variant="primary" :disabled="!email" @click="send">Send invite</VibeButton>
    </template>
  </VibeModal>
</template>
```

Use `v-model` for visibility. Use a template ref with `show()` / `hide()` only when the trigger is imperative, and do not mix the two paths.

## 6. Theme toggle

```vue
<script setup lang="ts">
import { useColorMode } from '@velkymx/vibeui'
const { colorMode, toggleColorMode } = useColorMode()
</script>

<template>
  <VibeButton variant="secondary" outline @click="toggleColorMode">
    Theme: {{ colorMode }}
  </VibeButton>
</template>
```

`app.use(VibeUI)` applies the saved mode before mount. Call `initColorMode()` yourself only when you use the composable without the plugin.

## 7. Loading, empty, and error states without a table

```vue
<template>
  <VibeAlert v-if="error" variant="danger" dismissible>{{ error }}</VibeAlert>

  <VibeSkeleton v-else-if="pending" variant="card" />

  <VibeCard v-else-if="items.length === 0" title="No projects yet">
    <p class="text-body-secondary">Create a project to see it here.</p>
    <VibeButton variant="primary" @click="create">New project</VibeButton>
  </VibeCard>

  <VibeListGroup v-else :items="items" />
</template>
```

Keep the page header and primary action outside the conditional so the layout does not jump between states.
