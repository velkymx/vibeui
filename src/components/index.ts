import VibeAlert from './VibeAlert.vue'

export { VibeAlert }

export default {
  install(app: any) {
    app.component('VibeAlert', VibeAlert)
  }
}

