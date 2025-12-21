// Core Components
import VibeAlert from './VibeAlert.vue'
import VibeBadge from './VibeBadge.vue'
import VibeButton from './VibeButton.vue'
import VibeButtonGroup from './VibeButtonGroup.vue'
import VibeCloseButton from './VibeCloseButton.vue'
import VibeSpinner from './VibeSpinner.vue'
import VibePlaceholder from './VibePlaceholder.vue'

// Layout Components
import VibeContainer from './VibeContainer.vue'
import VibeRow from './VibeRow.vue'
import VibeCol from './VibeCol.vue'

// Card Components
import VibeCard from './VibeCard.vue'
import VibeCardHeader from './VibeCardHeader.vue'
import VibeCardBody from './VibeCardBody.vue'
import VibeCardFooter from './VibeCardFooter.vue'
import VibeCardImg from './VibeCardImg.vue'
import VibeCardTitle from './VibeCardTitle.vue'
import VibeCardText from './VibeCardText.vue'

// Navigation Components
import VibeBreadcrumb from './VibeBreadcrumb.vue'
import VibeBreadcrumbItem from './VibeBreadcrumbItem.vue'
import VibeNav from './VibeNav.vue'
import VibeNavItem from './VibeNavItem.vue'
import VibeNavbar from './VibeNavbar.vue'
import VibeNavbarBrand from './VibeNavbarBrand.vue'
import VibeNavbarToggle from './VibeNavbarToggle.vue'
import VibeNavbarNav from './VibeNavbarNav.vue'
import VibePagination from './VibePagination.vue'
import VibePaginationItem from './VibePaginationItem.vue'
import VibeTabContent from './VibeTabContent.vue'
import VibeTabPane from './VibeTabPane.vue'

// List Components
import VibeListGroup from './VibeListGroup.vue'
import VibeListGroupItem from './VibeListGroupItem.vue'

// Progress Components
import VibeProgress from './VibeProgress.vue'
import VibeProgressBar from './VibeProgressBar.vue'

// Interactive Components
import VibeAccordion from './VibeAccordion.vue'
import VibeAccordionItem from './VibeAccordionItem.vue'
import VibeCollapse from './VibeCollapse.vue'
import VibeDropdown from './VibeDropdown.vue'
import VibeDropdownItem from './VibeDropdownItem.vue'
import VibeModal from './VibeModal.vue'
import VibeOffcanvas from './VibeOffcanvas.vue'
import VibeToast from './VibeToast.vue'
import VibeCarousel from './VibeCarousel.vue'
import VibeCarouselSlide from './VibeCarouselSlide.vue'

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
import VibeFormCheckbox from './VibeFormCheckbox.vue'
import VibeFormRadio from './VibeFormRadio.vue'
import VibeFormSwitch from './VibeFormSwitch.vue'
import VibeFormGroup from './VibeFormGroup.vue'
import VibeFormWysiwyg from './VibeFormWysiwyg.vue'

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

  // Layout
  VibeContainer,
  VibeRow,
  VibeCol,

  // Card
  VibeCard,
  VibeCardHeader,
  VibeCardBody,
  VibeCardFooter,
  VibeCardImg,
  VibeCardTitle,
  VibeCardText,

  // Navigation
  VibeBreadcrumb,
  VibeBreadcrumbItem,
  VibeNav,
  VibeNavItem,
  VibeNavbar,
  VibeNavbarBrand,
  VibeNavbarToggle,
  VibeNavbarNav,
  VibePagination,
  VibePaginationItem,
  VibeTabContent,
  VibeTabPane,

  // List
  VibeListGroup,
  VibeListGroupItem,

  // Progress
  VibeProgress,
  VibeProgressBar,

  // Interactive
  VibeAccordion,
  VibeAccordionItem,
  VibeCollapse,
  VibeDropdown,
  VibeDropdownItem,
  VibeModal,
  VibeOffcanvas,
  VibeToast,
  VibeCarousel,
  VibeCarouselSlide,

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
  VibeFormCheckbox,
  VibeFormRadio,
  VibeFormSwitch,
  VibeFormGroup,
  VibeFormWysiwyg
}

// Vue plugin for global registration
export default {
  install(app: any) {
    // Core
    app.component('VibeAlert', VibeAlert)
    app.component('VibeBadge', VibeBadge)
    app.component('VibeButton', VibeButton)
    app.component('VibeButtonGroup', VibeButtonGroup)
    app.component('VibeCloseButton', VibeCloseButton)
    app.component('VibeSpinner', VibeSpinner)
    app.component('VibePlaceholder', VibePlaceholder)

    // Layout
    app.component('VibeContainer', VibeContainer)
    app.component('VibeRow', VibeRow)
    app.component('VibeCol', VibeCol)

    // Card
    app.component('VibeCard', VibeCard)
    app.component('VibeCardHeader', VibeCardHeader)
    app.component('VibeCardBody', VibeCardBody)
    app.component('VibeCardFooter', VibeCardFooter)
    app.component('VibeCardImg', VibeCardImg)
    app.component('VibeCardTitle', VibeCardTitle)
    app.component('VibeCardText', VibeCardText)

    // Navigation
    app.component('VibeBreadcrumb', VibeBreadcrumb)
    app.component('VibeBreadcrumbItem', VibeBreadcrumbItem)
    app.component('VibeNav', VibeNav)
    app.component('VibeNavItem', VibeNavItem)
    app.component('VibeNavbar', VibeNavbar)
    app.component('VibeNavbarBrand', VibeNavbarBrand)
    app.component('VibeNavbarToggle', VibeNavbarToggle)
    app.component('VibeNavbarNav', VibeNavbarNav)
    app.component('VibePagination', VibePagination)
    app.component('VibePaginationItem', VibePaginationItem)
    app.component('VibeTabContent', VibeTabContent)
    app.component('VibeTabPane', VibeTabPane)

    // List
    app.component('VibeListGroup', VibeListGroup)
    app.component('VibeListGroupItem', VibeListGroupItem)

    // Progress
    app.component('VibeProgress', VibeProgress)
    app.component('VibeProgressBar', VibeProgressBar)

    // Interactive
    app.component('VibeAccordion', VibeAccordion)
    app.component('VibeAccordionItem', VibeAccordionItem)
    app.component('VibeCollapse', VibeCollapse)
    app.component('VibeDropdown', VibeDropdown)
    app.component('VibeDropdownItem', VibeDropdownItem)
    app.component('VibeModal', VibeModal)
    app.component('VibeOffcanvas', VibeOffcanvas)
    app.component('VibeToast', VibeToast)
    app.component('VibeCarousel', VibeCarousel)
    app.component('VibeCarouselSlide', VibeCarouselSlide)

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
    app.component('VibeFormCheckbox', VibeFormCheckbox)
    app.component('VibeFormRadio', VibeFormRadio)
    app.component('VibeFormSwitch', VibeFormSwitch)
    app.component('VibeFormGroup', VibeFormGroup)
    app.component('VibeFormWysiwyg', VibeFormWysiwyg)
  }
}
