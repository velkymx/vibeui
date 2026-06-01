# VibeInputGroup

Input groups allow you to prepend or append text, buttons, or other elements to your input fields.

## Basic Usage

```vue
<VibeInputGroup prepend="@">
  <VibeFormInput noWrapper v-model="username" placeholder="Username" />
</VibeInputGroup>

<VibeInputGroup append=".00">
  <VibeFormInput noWrapper v-model="price" placeholder="Price" />
</VibeInputGroup>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `prepend` | `String` | `undefined` | Shorthand for prepending text |
| `append` | `String` | `undefined` | Shorthand for appending text |
| `size` | `'sm' \| 'lg'` | `undefined` | Size of the input group |
| `tag` | `String` | `'div'` | HTML tag to use for the container |

## Slots

| Slot | Description |
|------|-------------|
| `default` | The main content, usually a `VibeFormInput` with the `noWrapper` prop |
| `prepend` | Slot for complex prepend content (e.g., icons or buttons) |
| `append` | Slot for complex append content |

## Advanced Example

```vue
<VibeInputGroup>
  <template #prepend>
    <VibeButton variant="outline-secondary">Search</VibeButton>
  </template>
  <VibeFormInput noWrapper v-model="query" />
  <template #append>
    <span class="input-group-text">
      <VibeIcon name="search" />
    </span>
  </template>
</VibeInputGroup>
```

## Icon-Prepend + Button-Append (Composer Pattern)

For chat / comment composers and search bars where you need an icon on the left and a button on the right alongside the text input. Wrap the icon in `<span class="input-group-text">` so Bootstrap renders the correct connected border-radius.

```vue
<VibeInputGroup>
  <template #prepend>
    <span class="input-group-text">
      <VibeIcon name="chat" />
    </span>
  </template>
  <VibeFormInput noWrapper v-model="comment" placeholder="Add a comment..." />
  <template #append>
    <VibeButton variant="primary" @click="post">Post</VibeButton>
  </template>
</VibeInputGroup>
```

The slot pattern accepts any element. The `prepend` and `append` props remain available as a shortcut for plain `.input-group-text` content.

## Mobile Note
Input groups work seamlessly with the `noWrapper` prop on `VibeFormInput`, ensuring that the Bootstrap `.input-group` classes apply correctly without extra wrapping divs breaking the layout.
