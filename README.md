# VibeUI

A modern Vue 3 UI component library built with Bootstrap 5, designed to simplify your development and enhance your application's aesthetic.

## Features

* **Vue 3 Composition API**: Built from the ground up using modern, reactive Vue.js practices.
* **Bootstrap 5 Integration**: Directly utilizes Bootstrap 5 CSS for consistency, without additional styling overhead.
* **Data-Driven Components**: Pass data arrays to components with props and customize rendering with scoped slots.
* **Lightweight & Modular**: Import only what you need, keeping your bundle small.
* **TypeScript Support**: Fully typed components for a great developer experience.
* **Accessibility First**: Components crafted with accessibility and usability in mind.

## Installation

Install via npm:

```bash
npm install @velkymx/vibeui
```

Make sure you also install Bootstrap:

```bash
npm install bootstrap
```

Optionally, install Bootstrap Icons for icon support:

```bash
npm install bootstrap-icons
```

## Quick Setup

In your Vue app's entry file (`main.ts` or `main.js`):

```typescript
import { createApp } from 'vue';
import App from './App.vue';
import VibeUI from '@velkymx/vibeui';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Optional: for icon support

createApp(App).use(VibeUI).mount('#app');
```

## Basic Usage

Here's a quick example of the `VibeAlert` component:

```vue
<script setup lang="ts">
import { ref } from 'vue';

const showAlert = ref(true);
</script>

<template>
  <VibeAlert variant="success" dismissable v-model="showAlert">
    Welcome to VibeUI!
  </VibeAlert>
</template>
```

## Data-Driven Components

VibeUI components are designed to be data-driven for maximum flexibility and maintainability:

### Basic Usage with Props

Pass data arrays to components and let them handle the rendering:

```vue
<template>
  <VibeBreadcrumb :items="breadcrumbItems" />
  <VibeNav tabs :items="navItems" />
  <VibeDropdown id="menu" text="Menu" :items="dropdownItems" />
  <VibePagination :total-pages="10" v-model:current-page="page" />
</template>

<script setup>
import { ref } from 'vue'

const page = ref(1)

const breadcrumbItems = [
  { text: 'Home', href: '/' },
  { text: 'Products', href: '/products' },
  { text: 'Details', active: true }
]

const navItems = [
  { text: 'Home', href: '#', active: true },
  { text: 'Features', href: '#' },
  { text: 'Pricing', href: '#' }
]

const dropdownItems = [
  { text: 'Action', href: '#' },
  { text: 'Another action', href: '#' },
  { divider: true },
  { text: 'Separated link', href: '#' }
]
</script>
```

### Custom Rendering with Scoped Slots

Need to customize how items are rendered? Use scoped slots:

```vue
<template>
  <!-- Custom item rendering -->
  <VibeBreadcrumb :items="breadcrumbItems">
    <template #item="{ item, index }">
      <VibeIcon :icon="item.icon" /> {{ item.text }}
    </template>
  </VibeBreadcrumb>

  <!-- Custom nav items with badges -->
  <VibeNav tabs :items="navItems">
    <template #item="{ item }">
      {{ item.text }}
      <VibeBadge v-if="item.count" variant="danger">{{ item.count }}</VibeBadge>
    </template>
  </VibeNav>

  <!-- Custom dropdown items -->
  <VibeDropdown id="menu" text="Menu" :items="dropdownItems">
    <template #item="{ item }">
      <VibeIcon :icon="item.icon" class="me-2" />
      {{ item.text }}
    </template>
  </VibeDropdown>
</template>

<script setup>
const breadcrumbItems = [
  { text: 'Home', href: '/', icon: 'house-fill' },
  { text: 'Products', href: '/products', icon: 'box' },
  { text: 'Details', active: true, icon: 'info-circle' }
]

const navItems = [
  { text: 'Home', href: '#', active: true },
  { text: 'Messages', href: '#', count: 5 },
  { text: 'Settings', href: '#' }
]

const dropdownItems = [
  { text: 'Profile', href: '#', icon: 'person' },
  { text: 'Settings', href: '#', icon: 'gear' },
  { divider: true },
  { text: 'Logout', href: '#', icon: 'box-arrow-right' }
]
</script>
```

Data-driven components include: `VibeBreadcrumb`, `VibeNav`, `VibeNavbarNav`, `VibePagination`, `VibeListGroup`, `VibeAccordion`, `VibeDropdown`, `VibeCarousel`, `VibeProgress`, and `VibeTabContent`.

## Tabs

VibeUI provides complete tab functionality using a data-driven approach:

```vue
<template>
  <VibeTabContent :panes="tabPanes">
    <template #pane="{ pane }">
      <h3>{{ pane.title }}</h3>
      <p>{{ pane.content }}</p>
    </template>
  </VibeTabContent>
</template>

<script setup>
const tabPanes = [
  {
    id: 'home-tab',
    title: 'Home',
    content: 'This is the home tab content.',
    active: true
  },
  {
    id: 'profile-tab',
    title: 'Profile',
    content: 'This is the profile tab content.'
  },
  {
    id: 'contact-tab',
    title: 'Contact',
    content: 'This is the contact tab content.'
  }
]
</script>
```

**Key Features:**
- Data-driven with `panes` array prop
- Automatic Bootstrap tab behavior with proper ARIA attributes
- Fade transitions enabled by default
- Scoped slot for custom pane content
- Works seamlessly with Bootstrap's JavaScript

## Bootstrap Icons

VibeUI provides a convenient `VibeIcon` component for using [Bootstrap Icons](https://icons.getbootstrap.com/) (2000+ icons):

### Installation

```bash
npm install bootstrap-icons
```

Import the icon font CSS in your `main.ts`:

```typescript
import 'bootstrap-icons/font/bootstrap-icons.css';
```

### Basic Usage

```vue
<template>
  <!-- Simple icon -->
  <VibeIcon icon="heart-fill" />

  <!-- With color -->
  <VibeIcon icon="star-fill" color="gold" />

  <!-- With size -->
  <VibeIcon icon="house" size="2x" />

  <!-- Custom font size -->
  <VibeIcon icon="alarm" fontSize="2rem" />

  <!-- In a button -->
  <VibeButton variant="primary">
    <VibeIcon icon="download" /> Download
  </VibeButton>
</template>
```

### Props

- **icon** (required): Icon name from [Bootstrap Icons](https://icons.getbootstrap.com/)
- **size**: Preset sizes: `'sm' | 'lg' | '1x' | '2x' | '3x' | '4x' | '5x'`
- **fontSize**: Custom font size (e.g., `'1.5rem'`, `'24px'`)
- **color**: Icon color (any CSS color value)
- **customClass**: Additional CSS classes
- **flipH**: Flip horizontally
- **flipV**: Flip vertically
- **rotate**: Rotate by degrees (`90`, `180`, or `270`)

### Advanced Examples

```vue
<template>
  <!-- Flipped icon -->
  <VibeIcon icon="arrow-right" flipH />

  <!-- Rotated icon -->
  <VibeIcon icon="arrow-up" :rotate="90" />

  <!-- Large colored icon -->
  <VibeIcon icon="emoji-smile" size="5x" color="#0d6efd" />

  <!-- Icon with click handler -->
  <VibeIcon icon="trash" color="red" @click="deleteItem" style="cursor: pointer" />

  <!-- Icon in navigation -->
  <VibeNav :items="navItems">
    <template #item="{ item }">
      <VibeIcon :icon="item.icon" /> {{ item.text }}
    </template>
  </VibeNav>
</template>
```

**Browse all 2000+ icons at:** [https://icons.getbootstrap.com/](https://icons.getbootstrap.com/)

## Bootstrap Utilities

Since VibeUI uses Bootstrap 5.3 CSS, **all Bootstrap utility classes are available** for use with any component or element. This includes spacing, colors, typography, borders, shadows, flexbox, positioning, and more.

### Common Utilities

#### Spacing (Margin & Padding)

```vue
<template>
  <!-- Margin utilities -->
  <VibeButton class="m-3">Margin all sides</VibeButton>
  <VibeButton class="mt-4 mb-2">Margin top & bottom</VibeButton>
  <VibeButton class="mx-auto">Centered with auto margin</VibeButton>

  <!-- Padding utilities -->
  <VibeCard class="p-4">Card with padding</VibeCard>
  <VibeCard class="px-5 py-3">Custom x/y padding</VibeCard>
</template>
```

#### Borders & Rounded Corners

```vue
<template>
  <!-- Border utilities -->
  <VibeCard class="border border-primary">Primary border</VibeCard>
  <VibeCard class="border-top border-3">Thick top border</VibeCard>
  <VibeCard class="border-0">No border</VibeCard>

  <!-- Rounded corners -->
  <VibeButton class="rounded-pill">Pill shaped</VibeButton>
  <VibeCard class="rounded-0">Sharp corners</VibeCard>
  <VibeCard class="rounded-3">More rounded</VibeCard>
</template>
```

#### Shadows

```vue
<template>
  <VibeCard class="shadow-sm">Small shadow</VibeCard>
  <VibeCard class="shadow">Regular shadow</VibeCard>
  <VibeCard class="shadow-lg">Large shadow</VibeCard>
</template>
```

#### Colors (Text & Background)

```vue
<template>
  <!-- Text colors -->
  <VibeAlert class="text-primary">Primary text</VibeAlert>
  <VibeAlert class="text-success">Success text</VibeAlert>
  <VibeAlert class="text-danger">Danger text</VibeAlert>

  <!-- Background colors -->
  <div class="bg-light p-3">Light background</div>
  <div class="bg-primary text-white p-3">Primary background</div>

  <!-- Background opacity -->
  <div class="bg-success bg-opacity-25 p-3">25% opacity</div>
</template>
```

#### Opacity

```vue
<template>
  <VibeIcon icon="star" class="opacity-25" />
  <VibeIcon icon="star" class="opacity-50" />
  <VibeIcon icon="star" class="opacity-75" />
  <VibeIcon icon="star" class="opacity-100" />
</template>
```

#### Flexbox

```vue
<template>
  <!-- Flex container -->
  <VibeCard class="d-flex justify-content-between align-items-center p-3">
    <span>Left content</span>
    <VibeButton>Right button</VibeButton>
  </VibeCard>

  <!-- Flex direction -->
  <div class="d-flex flex-column gap-3">
    <VibeButton>Button 1</VibeButton>
    <VibeButton>Button 2</VibeButton>
  </div>

  <!-- Flex responsive -->
  <div class="d-flex flex-column flex-md-row">
    <VibeCard>Card 1</VibeCard>
    <VibeCard>Card 2</VibeCard>
  </div>
</template>
```

#### Position

```vue
<template>
  <!-- Position utilities -->
  <div class="position-relative">
    <VibeIcon icon="bell" class="position-absolute top-0 end-0" />
  </div>

  <!-- Sticky positioning -->
  <VibeNavbar class="sticky-top">
    <!-- Navbar content -->
  </VibeNavbar>

  <!-- Fixed positioning -->
  <VibeButton class="position-fixed bottom-0 end-0 m-3">
    <VibeIcon icon="chat" />
  </VibeButton>
</template>
```

#### Display & Visibility

```vue
<template>
  <!-- Display utilities -->
  <VibeAlert class="d-none d-md-block">Hidden on mobile</VibeAlert>
  <VibeButton class="d-inline-block">Inline block</VibeButton>

  <!-- Visibility -->
  <VibeCard class="visible">Visible</VibeCard>
  <VibeCard class="invisible">Invisible (takes space)</VibeCard>
</template>
```

#### Sizing

```vue
<template>
  <!-- Width utilities -->
  <VibeButton class="w-100">Full width</VibeButton>
  <VibeButton class="w-75">75% width</VibeButton>
  <VibeButton class="w-auto">Auto width</VibeButton>

  <!-- Height utilities -->
  <div class="h-100">Full height</div>
  <div class="mh-100">Max height 100%</div>

  <!-- Viewport units -->
  <div class="vw-100">100% viewport width</div>
  <div class="vh-100">100% viewport height</div>
</template>
```

#### Typography

```vue
<template>
  <!-- Font size -->
  <p class="fs-1">Very large text</p>
  <p class="fs-6">Small text</p>

  <!-- Font weight -->
  <span class="fw-bold">Bold</span>
  <span class="fw-light">Light</span>

  <!-- Text alignment -->
  <p class="text-start">Left aligned</p>
  <p class="text-center">Center aligned</p>
  <p class="text-end">Right aligned</p>

  <!-- Text transform -->
  <p class="text-uppercase">Uppercase</p>
  <p class="text-lowercase">Lowercase</p>
  <p class="text-capitalize">Capitalized</p>
</template>
```

### Combined Examples

```vue
<template>
  <!-- Card with multiple utilities -->
  <VibeCard class="shadow-lg rounded-3 border-0 p-4 mb-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="fw-bold text-primary mb-0">Card Title</h3>
      <VibeIcon icon="star-fill" class="text-warning" size="2x" />
    </div>
    <p class="text-muted mb-3">Card content with utilities</p>
    <VibeButton variant="primary" class="w-100">Full Width Button</VibeButton>
  </VibeCard>

  <!-- Responsive layout with utilities -->
  <VibeContainer>
    <VibeRow class="g-4">
      <VibeCol :cols="12" :md="6" :lg="4">
        <VibeCard class="h-100 shadow-sm hover-shadow">
          <div class="position-relative">
            <img src="..." class="w-100 rounded-top" />
            <VibeBadge class="position-absolute top-0 end-0 m-2">New</VibeBadge>
          </div>
          <div class="p-3">
            <h5 class="fw-semibold">Product Title</h5>
            <p class="text-muted small mb-3">Description</p>
            <div class="d-flex justify-content-between align-items-center">
              <span class="fs-4 fw-bold text-primary">$29.99</span>
              <VibeButton size="sm">
                <VibeIcon icon="cart-plus" /> Add
              </VibeButton>
            </div>
          </div>
        </VibeCard>
      </VibeCol>
    </VibeRow>
  </VibeContainer>
</template>
```

### Full Documentation

For complete details on all available utilities, see:
- **[Bootstrap Utilities Documentation](https://getbootstrap.com/docs/5.3/utilities/api/)**
- **[Spacing](https://getbootstrap.com/docs/5.3/utilities/spacing/)**
- **[Colors](https://getbootstrap.com/docs/5.3/utilities/colors/)**
- **[Borders](https://getbootstrap.com/docs/5.3/utilities/borders/)**
- **[Shadows](https://getbootstrap.com/docs/5.3/utilities/shadows/)**
- **[Flex](https://getbootstrap.com/docs/5.3/utilities/flex/)**
- **[Position](https://getbootstrap.com/docs/5.3/utilities/position/)**

## Form Components with Validation

VibeUI provides comprehensive form components with built-in validation support for both front-end and API-based validation:

### Basic Form Example

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { validators } from '@velkymx/vibeui'

const email = ref('')
const emailValidationState = ref(null)
const emailValidationMessage = ref('')

const validateEmail = async () => {
  const emailRules = [validators.required(), validators.email()]

  for (const rule of emailRules) {
    const result = await rule.validator(email.value)
    if (result !== true) {
      emailValidationState.value = 'invalid'
      emailValidationMessage.value = typeof result === 'string' ? result : rule.message
      return
    }
  }

  emailValidationState.value = 'valid'
  emailValidationMessage.value = ''
}
</script>

<template>
  <VibeFormInput
    v-model="email"
    id="email"
    type="email"
    label="Email Address"
    placeholder="Enter your email"
    :validation-state="emailValidationState"
    :validation-message="emailValidationMessage"
    @validate="validateEmail"
    required
  />
</template>
```

### Advanced Form with Composable

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useFormValidation, validators } from '@velkymx/vibeui'

const form = {
  username: useFormValidation(''),
  password: useFormValidation(''),
  age: useFormValidation(0),
  country: useFormValidation(''),
  agreeToTerms: useFormValidation(false)
}

const handleSubmit = async () => {
  const usernameValid = await form.username.validate([
    validators.required(),
    validators.minLength(3)
  ])

  const passwordValid = await form.password.validate([
    validators.required(),
    validators.minLength(8)
  ])

  const ageValid = await form.age.validate([
    validators.required(),
    validators.min(18)
  ])

  if (usernameValid.valid && passwordValid.valid && ageValid.valid) {
    console.log('Form is valid!')
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <VibeFormInput
      v-model="form.username.value"
      id="username"
      label="Username"
      :validation-state="form.username.validationState"
      :validation-message="form.username.validationMessage"
      @validate="() => form.username.validate([validators.required(), validators.minLength(3)])"
      required
    />

    <VibeFormInput
      v-model="form.password.value"
      id="password"
      type="password"
      label="Password"
      :validation-state="form.password.validationState"
      :validation-message="form.password.validationMessage"
      @validate="() => form.password.validate([validators.required(), validators.minLength(8)])"
      required
    />

    <VibeFormSpinbutton
      v-model="form.age.value"
      id="age"
      label="Age"
      :min="0"
      :max="120"
      :validation-state="form.age.validationState"
      :validation-message="form.age.validationMessage"
      @validate="() => form.age.validate([validators.required(), validators.min(18)])"
      required
    />

    <VibeFormCheckbox
      v-model="form.agreeToTerms.value"
      id="terms"
      label="I agree to the terms and conditions"
      required
    />

    <VibeButton type="submit" variant="primary">Submit</VibeButton>
  </form>
</template>
```

### API Validation Example

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { validators } from '@velkymx/vibeui'

const username = ref('')
const usernameValidationState = ref(null)
const usernameValidationMessage = ref('')

// Custom async validator for checking username availability
const checkUsernameAvailability = validators.async(async (value) => {
  if (!value) return true

  try {
    const response = await fetch(`/api/check-username?username=${value}`)
    const data = await response.json()

    if (data.available) {
      return true
    } else {
      return 'Username is already taken'
    }
  } catch (error) {
    return 'Error checking username availability'
  }
})

const validateUsername = async () => {
  const rules = [
    validators.required(),
    validators.minLength(3),
    checkUsernameAvailability
  ]

  usernameValidationState.value = null

  for (const rule of rules) {
    const result = await rule.validator(username.value)
    if (result !== true) {
      usernameValidationState.value = 'invalid'
      usernameValidationMessage.value = typeof result === 'string' ? result : rule.message
      return
    }
  }

  usernameValidationState.value = 'valid'
  usernameValidationMessage.value = 'Username is available!'
}
</script>

<template>
  <VibeFormInput
    v-model="username"
    id="username"
    label="Username"
    :validation-state="usernameValidationState"
    :validation-message="usernameValidationMessage"
    @validate="validateUsername"
    validate-on="blur"
    required
  />
</template>
```

### Available Validators

VibeUI provides built-in validators:

- `validators.required(message?)` - Field is required
- `validators.email(message?)` - Valid email format
- `validators.minLength(min, message?)` - Minimum string length
- `validators.maxLength(max, message?)` - Maximum string length
- `validators.min(min, message?)` - Minimum numeric value
- `validators.max(max, message?)` - Maximum numeric value
- `validators.pattern(regex, message?)` - Custom regex pattern
- `validators.url(message?)` - Valid URL format
- `validators.async(asyncFn)` - Custom async validator

## Components

VibeUI includes all major Bootstrap 5.3 components:

### Layout Components
* **VibeContainer** - Responsive container with fluid and breakpoint variants
* **VibeRow** - Row wrapper for columns with gutter control and row-cols support
* **VibeCol** - Responsive grid columns with offset and order support

### Core Components
* **VibeAlert** - Alert messages with variants and dismissible option
* **VibeBadge** - Badges and labels with pill option
* **VibeButton** - Buttons with variants, sizes, and outline style
* **VibeButtonGroup** - Button groups with sizing and vertical layout
* **VibeCloseButton** - Close button with white variant
* **VibeSpinner** - Loading spinners (border and grow types)
* **VibePlaceholder** - Placeholder loading states with animations

### Card Components
* **VibeCard** - Card container with header, body, footer, and image support via props and named slots

### Navigation Components
* **VibeBreadcrumb** - Data-driven breadcrumb navigation with `items` prop
* **VibeNav** - Navigation tabs and pills with `items` prop
* **VibeNavbar** - Responsive navbar with variants
* **VibeNavbarBrand** - Navbar branding section
* **VibeNavbarToggle** - Navbar mobile toggle button
* **VibeNavbarNav** - Navbar navigation links with optional `items` prop
* **VibePagination** - Data-driven pagination with `totalPages` prop and v-model support
* **VibeTabContent** - Tab panes container with `panes` prop

### List Components
* **VibeListGroup** - Data-driven list group with `items` prop, supports flush and horizontal layouts

### Progress Components
* **VibeProgress** - Data-driven progress bars with `bars` prop, supports multiple bars with variants, striped, and animated styles

### Interactive Components
* **VibeAccordion** - Data-driven accordion with `items` prop and flush option
* **VibeCollapse** - Collapse component for showing/hiding content
* **VibeDropdown** - Data-driven dropdown with `items` prop, supports variants, directions, dividers, and headers
* **VibeModal** - Modal dialogs with sizes and positions
* **VibeOffcanvas** - Offcanvas sidebars with placement options
* **VibeToast** - Toast notifications with autohide
* **VibeCarousel** - Data-driven image carousel with `items` prop, controls, and indicators

### Advanced Components
* **VibeTooltip** - Tooltips with placement options (requires Bootstrap JS)
* **VibePopover** - Popovers with title and content (requires Bootstrap JS)
* **VibeScrollspy** - Scrollspy for navigation highlighting
* **VibeIcon** - Bootstrap Icons integration with 2000+ icons

### Data Components
* **VibeDataTable** - Powerful data table with search, sorting, and pagination

### Form Components
* **VibeFormInput** - Text, email, password, number inputs with validation
* **VibeFormSelect** - Select dropdowns with single/multiple selection
* **VibeFormTextarea** - Multi-line text input with character count
* **VibeFormSpinbutton** - Number input with increment/decrement buttons
* **VibeFormDatepicker** - Date, time, and datetime input controls
* **VibeFormCheckbox** - Checkboxes with support for arrays
* **VibeFormRadio** - Radio button groups
* **VibeFormSwitch** - Toggle switches
* **VibeFormGroup** - Form group container with floating labels
* **VibeFormWysiwyg** - WYSIWYG editor with QuillJS (requires quill package)

All form components support:
- Front-end validation with built-in validators
- Async validation for API calls
- Bootstrap 5 styling and validation states
- Accessibility features
- Custom validation messages

## Contributing

Pull requests and contributions are very welcome! Please fork the repo, create a branch for your feature, and submit a PR.

## License

[MIT License](LICENSE) 

## TechnoSorcery.com

Built with ✨ by [TechnoSorcery.com](https://technosorcery.com)
