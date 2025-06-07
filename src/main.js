import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { auth } from './firebase'
import '@fortawesome/fontawesome-free/css/all.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// Inicializa la app
const app = createApp(App)
app.use(ElementPlus)
// Usa el router
app.use(router)

// Monta la app
app.mount('#app')

// Opcional: Verifica el estado de autenticación al cargar
auth.onAuthStateChanged(() => {
  // El router ya maneja las redirecciones
})