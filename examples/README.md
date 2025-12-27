# VibeUI Examples

This directory contains standalone HTML examples demonstrating how to use VibeUI components, similar to [Bootstrap's examples](https://getbootstrap.com/docs/5.3/examples/).

## 🚀 Quick Start

### Option 1: Open Directly in Browser
Simply open any `.html` file in your browser:
1. Build VibeUI first: `cd .. && npm run build`
2. Open `examples/index.html` in your browser

### Option 2: Use a Local Server
For the best experience (especially with routing), serve the files:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

Then open http://localhost:8000 in your browser.

### Option 3: GitHub Pages
The examples work perfectly on GitHub Pages! Just push to a repository and enable GitHub Pages.

## 📁 Examples

- **[index.html](index.html)** - Examples gallery homepage
- **[starter.html](starter.html)** - Starter template with common components
- **[album.html](album.html)** - Photo gallery with card grid
- **[pricing.html](pricing.html)** - Pricing tables with comparison
- **[dashboard.html](dashboard.html)** - Admin dashboard with sidebar

## 🎯 How They Work

Each example is a **standalone HTML file** that uses:

1. **Vue 3** from CDN (`vue.global.prod.js`)
2. **Bootstrap 5.3** from CDN
3. **Bootstrap Icons** from CDN
4. **VibeUI** from the local `dist/vibeui.umd.js` build

### Example Structure

```html
<!DOCTYPE html>
<html>
<head>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
    <!-- VibeUI CSS -->
    <link rel="stylesheet" href="../dist/vibeui.css">
</head>
<body>
    <div id="app">
        <!-- Use VibeUI components here -->
        <vibe-button variant="primary">Click me!</vibe-button>
    </div>

    <!-- Vue 3 -->
    <script src="https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js"></script>
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <!-- VibeUI -->
    <script src="../dist/vibeui.umd.js"></script>
    <script>
        const { createApp } = Vue;
        createApp({
            data() {
                return {
                    // Your data here
                }
            }
        }).use(VibeUI.default).mount('#app');
    </script>
</body>
</html>
```

## 🔧 Using with NPM Package

To use the published VibeUI package from npm instead of the local build:

1. Install VibeUI: `npm install @velkymx/vibeui`
2. Copy examples to your project
3. Update the script src to point to your node_modules:
   ```html
   <script src="/node_modules/@velkymx/vibeui/dist/vibeui.umd.js"></script>
   ```

Or use a CDN once VibeUI is published to npm:
```html
<script src="https://cdn.jsdelivr.net/npm/@velkymx/vibeui"></script>
```

## 📦 Components Used

### Starter Example
- `vibe-navbar`, `vibe-navbar-brand`, `vibe-navbar-toggle`
- `vibe-container`, `vibe-row`, `vibe-col`
- `vibe-button`, `vibe-badge`, `vibe-alert`
- `vibe-card`, `vibe-card-body`
- `vibe-dropdown`, `vibe-dropdown-item`
- `vibe-icon`

### Album Example
- `vibe-navbar`
- `vibe-container`, `vibe-row`, `vibe-col`
- `vibe-card`, `vibe-card-body`
- `vibe-button`, `vibe-button-group`
- `vibe-icon`

### Pricing Example
- `vibe-container`, `vibe-row`, `vibe-col`
- `vibe-card`, `vibe-card-header`, `vibe-card-body`
- `vibe-button`, `vibe-badge`
- `vibe-nav`
- `vibe-icon`

### Dashboard Example
- `vibe-container`, `vibe-row`, `vibe-col`
- `vibe-card`, `vibe-card-body`
- `vibe-list-group`, `vibe-list-group-item`
- `vibe-button`, `vibe-button-group`, `vibe-badge`
- `vibe-icon`

## 🎨 Customization

You can customize these examples by:

1. **Modifying the data**: Change the `data()` function in the Vue app
2. **Adding new components**: Use any VibeUI component from the library
3. **Styling**: Add your own CSS or modify Bootstrap variables
4. **Adding features**: Extend the Vue app with methods, computed properties, etc.

## 📝 Example: Adding Your Own Data

```html
<script>
const { createApp } = Vue;
createApp({
    data() {
        return {
            // Your custom data
            products: [
                { id: 1, name: 'Product 1', price: 29.99 },
                { id: 2, name: 'Product 2', price: 39.99 }
            ]
        }
    },
    methods: {
        addToCart(product) {
            console.log('Added to cart:', product);
        }
    }
}).use(VibeUI.default).mount('#app');
</script>
```

## 🌐 Deployment

These examples can be deployed anywhere:

- **GitHub Pages**: Push to repo, enable Pages
- **Netlify**: Drag & drop the folder
- **Vercel**: Deploy as static site
- **Any web server**: Upload the files

Just make sure VibeUI is built first (`npm run build` in the root directory).

## 🛠️ Development Workflow

1. Make changes to VibeUI source code
2. Build VibeUI: `cd .. && npm run build`
3. Refresh the example in your browser
4. Changes will be reflected immediately

## ❓ Troubleshooting

**Q: Examples don't load when opened directly**
A: Make sure you've built VibeUI first: `cd .. && npm run build`

**Q: Components aren't rendering**
A: Check the browser console for errors. Make sure all script tags are loading correctly.

**Q: Icons not showing**
A: Verify the Bootstrap Icons CSS is loading from the CDN.

**Q: Getting CORS errors**
A: Use a local server instead of opening files directly (see Quick Start above).

## 📄 License

These examples are part of VibeUI and are licensed under the MIT License.
