// Core Components
import VibeAlert from './VibeAlert.vue'
import VibeBadge from './VibeBadge.vue'
import VibeButton from './VibeButton.vue'
import VibeButtonGroup from './VibeButtonGroup.vue'
import VibeCloseButton from './VibeCloseButton.vue'
import VibeSpinner from './VibeSpinner.vue'
import VibePlaceholder from './VibePlaceholder.vue'
import VibeSkeleton from './VibeSkeleton.vue'

// Layout Components
import VibeContainer from './VibeContainer.vue'
import VibeRow from './VibeRow.vue'
import VibeCol from './VibeCol.vue'

// Card Components
import VibeCard from './VibeCard.vue'

// Navigation Components
import VibeBreadcrumb from './VibeBreadcrumb.vue'
import VibeNav from './VibeNav.vue'
import VibeNavbar from './VibeNavbar.vue'
import VibeNavbarBrand from './VibeNavbarBrand.vue'
import VibeNavbarToggle from './VibeNavbarToggle.vue'
import VibeNavbarNav from './VibeNavbarNav.vue'
import VibePagination from './VibePagination.vue'
import VibeTabContent from './VibeTabContent.vue'
import VibeTabs from './VibeTabs.vue'
import VibeTab from './VibeTab.vue'

// List Components
import VibeListGroup from './VibeListGroup.vue'

// Progress Components
import VibeProgress from './VibeProgress.vue'

// Interactive Components
import VibeAccordion from './VibeAccordion.vue'
import VibeCollapse from './VibeCollapse.vue'
import VibeDropdown from './VibeDropdown.vue'
import VibeModal from './VibeModal.vue'
import VibeOffcanvas from './VibeOffcanvas.vue'
import VibeToast from './VibeToast.vue'
import VibeToastHost from './VibeToastHost.vue'
import VibeCarousel from './VibeCarousel.vue'

// Advanced Components
import VibeTooltip from './VibeTooltip.vue'
import VibePopover from './VibePopover.vue'
import VibeScrollspy from './VibeScrollspy.vue'
import VibeIcon from './VibeIcon.vue'

// Data Components
import VibeDataTable from './VibeDataTable.vue'

// Form Components
import VibeFormInput from './VibeFormInput.vue'
import VibeFormSelect from './VibeFormSelect.vue'
import VibeFormTextarea from './VibeFormTextarea.vue'
import VibeFormSpinbutton from './VibeFormSpinbutton.vue'
import VibeFormDatepicker from './VibeFormDatepicker.vue'
import VibeFileInput from './VibeFileInput.vue'
import VibeSlider from './VibeSlider.vue'
import VibeStepper from './VibeStepper.vue'
import VibeAutocomplete from './VibeAutocomplete.vue'
import VibeSortable from './VibeSortable.vue'
import VibeFormCheckbox from './VibeFormCheckbox.vue'
import VibeFormRadio from './VibeFormRadio.vue'
import VibeFormSwitch from './VibeFormSwitch.vue'
import VibeFormGroup from './VibeFormGroup.vue'
import VibeFormWysiwyg from './VibeFormWysiwyg.vue'
import VibeInputGroup from './VibeInputGroup.vue'
import VibeLink from './VibeLink.vue'

// Export all components
export {
  // Core
  VibeAlert,
  VibeBadge,
  VibeButton,
  VibeButtonGroup,
  VibeCloseButton,
  VibeSpinner,
  VibePlaceholder,
  VibeSkeleton,

  // Layout
  VibeContainer,
  VibeRow,
  VibeCol,

  // Card
  VibeCard,

  // Navigation
  VibeBreadcrumb,
  VibeNav,
  VibeNavbar,
  VibeNavbarBrand,
  VibeNavbarToggle,
  VibeNavbarNav,
  VibePagination,
  VibeTabContent,
  VibeTabs,
  VibeTab,

  // List
  VibeListGroup,

  // Progress
  VibeProgress,

  // Interactive
  VibeAccordion,
  VibeCollapse,
  VibeDropdown,
  VibeModal,
  VibeOffcanvas,
  VibeToast,
  VibeToastHost,
  VibeCarousel,

  // Advanced
  VibeTooltip,
  VibePopover,
  VibeScrollspy,
  VibeIcon,

  // Data
  VibeDataTable,

  // Form
  VibeFormInput,
  VibeFormSelect,
  VibeFormTextarea,
  VibeFormSpinbutton,
  VibeFormDatepicker,
  VibeFileInput,
  VibeSlider,
  VibeStepper,
  VibeAutocomplete,
  VibeSortable,
  VibeFormCheckbox,
  VibeFormRadio,
  VibeFormSwitch,
  VibeFormGroup,
  VibeFormWysiwyg,
  VibeInputGroup,
  VibeLink
}

import type { App, Plugin } from 'vue'
import { vTooltip } from '../directives/vTooltip'

// Vue plugin for global registration
const VibeUIPlugin: Plugin = {
  install(app: App) {
    // Core
    app.component('VibeAlert', VibeAlert)
    app.component('VibeBadge', VibeBadge)
    app.component('VibeButton', VibeButton)
    app.component('VibeButtonGroup', VibeButtonGroup)
    app.component('VibeCloseButton', VibeCloseButton)
    app.component('VibeSpinner', VibeSpinner)
    app.component('VibePlaceholder', VibePlaceholder)
    app.component('VibeSkeleton', VibeSkeleton)

    // Layout
    app.component('VibeContainer', VibeContainer)
    app.component('VibeRow', VibeRow)
    app.component('VibeCol', VibeCol)

    // Card
    app.component('VibeCard', VibeCard)

    // Navigation
    app.component('VibeBreadcrumb', VibeBreadcrumb)
    app.component('VibeNav', VibeNav)
    app.component('VibeNavbar', VibeNavbar)
    app.component('VibeNavbarBrand', VibeNavbarBrand)
    app.component('VibeNavbarToggle', VibeNavbarToggle)
    app.component('VibeNavbarNav', VibeNavbarNav)
    app.component('VibePagination', VibePagination)
    app.component('VibeTabContent', VibeTabContent)
    app.component('VibeTabs', VibeTabs)
    app.component('VibeTab', VibeTab)

    // List
    app.component('VibeListGroup', VibeListGroup)

    // Progress
    app.component('VibeProgress', VibeProgress)

    // Interactive
    app.component('VibeAccordion', VibeAccordion)
    app.component('VibeCollapse', VibeCollapse)
    app.component('VibeDropdown', VibeDropdown)
    app.component('VibeModal', VibeModal)
    app.component('VibeOffcanvas', VibeOffcanvas)
    app.component('VibeToast', VibeToast)
    app.component('VibeToastHost', VibeToastHost)
    app.component('VibeCarousel', VibeCarousel)

    // Advanced
    app.component('VibeTooltip', VibeTooltip)
    app.component('VibePopover', VibePopover)
    app.component('VibeScrollspy', VibeScrollspy)
    app.component('VibeIcon', VibeIcon)

    // Data
    app.component('VibeDataTable', VibeDataTable)

    // Form
    app.component('VibeFormInput', VibeFormInput)
    app.component('VibeFormSelect', VibeFormSelect)
    app.component('VibeFormTextarea', VibeFormTextarea)
    app.component('VibeFormSpinbutton', VibeFormSpinbutton)
    app.component('VibeFormDatepicker', VibeFormDatepicker)
    app.component('VibeFileInput', VibeFileInput)
    app.component('VibeSlider', VibeSlider)
    app.component('VibeStepper', VibeStepper)
    app.component('VibeAutocomplete', VibeAutocomplete)
    app.component('VibeSortable', VibeSortable)
    app.component('VibeFormCheckbox', VibeFormCheckbox)
    app.component('VibeFormRadio', VibeFormRadio)
    app.component('VibeFormSwitch', VibeFormSwitch)
    app.component('VibeFormGroup', VibeFormGroup)
    app.component('VibeFormWysiwyg', VibeFormWysiwyg)
    app.component('VibeInputGroup', VibeInputGroup)
    app.component('VibeLink', VibeLink)

    // Directives
    app.directive('vibe-tooltip', vTooltip)
  }
}

export default VibeUIPlugin
