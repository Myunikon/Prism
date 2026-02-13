import { createApp } from 'vue'
import './style.css'
// Lucide Icons (tree-shakable SVG — replaces FontAwesome)
import Icon from './components/common/Icon.vue'
import App from './App.vue'

const app = createApp(App)
app.component('Icon', Icon)
app.mount('#app')
