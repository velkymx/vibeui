# VibeUI

A modern Vue 3 UI component library built with Bootstrap 5, designed to simplify your development and enhance your application's aesthetic.

## Features

* Vue 3 Composition API: Built from the ground up using modern, reactive Vue.js practices.
* Bootstrap 5 Integration: Directly utilizes Bootstrap 5 CSS for consistency, without additional styling overhead.
* Lightweight & Modular: Import only what you need, keeping your bundle small.
* TypeScript Support: Fully typed components for a great developer experience.
* Accessibility First: Components crafted with accessibility and usability in mind.

## Installation

Install via npm:

```bash
npm install @velkymx/vibeui
```

Make sure you also install Bootstrap:

```bash
npm install bootstrap
```

## Quick Setup

In your Vue app's entry file (`main.ts` or `main.js`):

```typescript
import { createApp } from 'vue';
import App from './App.vue';
import VibeUI from '@velkymx/vibeui';
import 'bootstrap/dist/css/bootstrap.min.css';

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

## Components

* VibeAlert
* More components coming soon.

## Contributing

Pull requests and contributions are very welcome! Please fork the repo, create a branch for your feature, and submit a PR.

## License

[MIT License](LICENSE) 

## TechnoSorcery.com

Built with ✨ by [TechnoSorcery.com](https://technosorcery.com)
