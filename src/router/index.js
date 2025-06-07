import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '@/firebase'

// Importaciones de componentes
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import CrearUsuarioView from '@/views/CrearUsuarioView.vue'
import RutasView from '@/views/RutasView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { requiresAuth: true } // Solo usuarios autenticados
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresGuest: true } // Solo usuarios no autenticados
  },
  {
    path: '/crear-usuario',
    name: 'CrearUsuario',
    component: CrearUsuarioView,
    meta: { requiresAuth: true } // Solo usuarios autenticados
  },
  {
    path: '/rutas',
    name: 'Rutas',
    component: RutasView,
    meta: { requiresAuth: true } // Solo usuarios autenticados
  },
  {
    path: '/lista-clientes',
    name: 'ClientesView',
    component: () => import('@/views/ClientesView.vue'), // Carga perezosa
    meta: { requiresAuth: true } // Solo usuarios autenticados
  },
  {
    path: '/clientes/:clienteId/crear-prestamos',
    name: 'CrearPrestamo',
    component: () => import('@/views/CrearPrestamoView.vue'),
    props: true
  }

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guardia de navegación global
router.beforeEach(async (to, from, next) => {
  // Esperar a que Firebase inicialice el estado del usuario
  await new Promise(resolve => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      unsubscribe()
      resolve(user)
    })
  })

  const isAuthenticated = auth.currentUser

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Redirige a login si no está autenticado
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.meta.requiresGuest && isAuthenticated) {
    // Redirige a Home si intenta ir a login ya estando autenticado
    next({ name: 'Home' })
  } else {
    next()
  }
})

export default router
