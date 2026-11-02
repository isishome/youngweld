import 'quasar/dist/quasar.css'
import './styles.css'
import { Cookies } from 'quasar'
import iconSet from 'quasar/icon-set/svg-material-icons'
import {
  matMenu,
  matLanguage,
  matDarkMode,
  matKeyboardArrowUp,
  matLocationOn,
  matPhoneEnabled,
  matPrint,
  matPictureAsPdf,
  matHelpOutline,
  matHome,
  matSwapHoriz,
  matWork,
  matEmail,
} from '@quasar/extras/material-icons'

const icons = {
  menu: matMenu,
  language: matLanguage,
  dark_mode: matDarkMode,
  keyboard_arrow_up: matKeyboardArrowUp,
  location_on: matLocationOn,
  phone_enabled: matPhoneEnabled,
  print: matPrint,
  picture_as_pdf: matPictureAsPdf,
  help_outline: matHelpOutline,
  home: matHome,
  swap_horiz: matSwapHoriz,
  work: matWork,
  email: matEmail,
}

export default {
  config: {
    iconMapFn: (name) => (icons[name] ? { icon: icons[name] } : undefined),
  },
  iconSet,
  plugins: { Cookies },
}
