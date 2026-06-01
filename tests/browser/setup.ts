// Loaded once per browser test file. Pulls in the real Bootstrap + Quill CSS so
// the real Bootstrap JS and Quill render against authentic styles. vitest-browser-vue
// auto-registers component cleanup via afterEach when globals are enabled.
import 'bootstrap/dist/css/bootstrap.min.css'
import 'quill/dist/quill.snow.css'
