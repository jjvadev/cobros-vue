<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <img src="@/assets/logo.png" alt="Logo" class="logo">
        <h2>Iniciar Sesión</h2>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group" :class="{ 'error': errors.email }">
          <label for="email">Correo electrónico</label>
          <input
            type="email"
            id="email"
            v-model="form.email"
            placeholder="tu@email.com"
            @blur="validateEmail"
          >
          <span class="error-message">{{ errors.email }}</span>
        </div>

        <div class="form-group" :class="{ 'error': errors.password }">
          <label for="password">Contraseña</label>
          <input
            type="password"
            id="password"
            v-model="form.password"
            placeholder="••••••••"
            @blur="validatePassword"
          >
          <span class="error-message">{{ errors.password }}</span>
        </div>

        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" v-model="form.remember">
            <span>Recordar sesión</span>
          </label>
          <router-link to="/forgot-password" class="forgot-password">
            ¿Olvidaste tu contraseña?
          </router-link>
        </div>

        <button type="submit" class="login-button" :disabled="loading">
          <span v-if="!loading">Ingresar</span>
          <div v-else class="spinner"></div>
        </button>

        <div v-if="authError" class="auth-error">
          <i class="fas fa-exclamation-circle"></i>
          {{ authError }}
        </div>
      </form>

      <div class="login-footer">
        <p>¿No tienes una cuenta? <router-link to="/register">Regístrate</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/firebase'

const router = useRouter()

// Datos del formulario
const form = ref({
  email: '',
  password: '',
  remember: false
})

// Estados
const loading = ref(false)
const errors = ref({
  email: '',
  password: ''
})
const authError = ref(null)

// Validaciones
const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.value.email) {
    errors.value.email = 'El correo es requerido'
  } else if (!emailRegex.test(form.value.email)) {
    errors.value.email = 'Ingresa un correo válido'
  } else {
    errors.value.email = ''
  }
}

const validatePassword = () => {
  if (!form.value.password) {
    errors.value.password = 'La contraseña es requerida'
  } else if (form.value.password.length < 6) {
    errors.value.password = 'Mínimo 6 caracteres'
  } else {
    errors.value.password = ''
  }
}

// Autenticación
const handleLogin = async () => {
  validateEmail()
  validatePassword()

  if (errors.value.email || errors.value.password) {
    return
  }

  try {
    loading.value = true
    authError.value = null

    const userCredential = await signInWithEmailAndPassword(
      auth,
      form.value.email,
      form.value.password
    )

    // Si marcó "Recordar sesión", persiste la autenticación
    if (form.value.remember) {
      localStorage.setItem('rememberAuth', 'true')
    }

    console.log('Usuario autenticado:', userCredential.user)
    router.push('/')

  } catch (error) {
    console.error('Error de autenticación:', error.code)
    authError.value = getAuthErrorMessage(error.code)
  } finally {
    loading.value = false
  }
}

// Traducción de errores de Firebase
const getAuthErrorMessage = (code) => {
  const messages = {
    'auth/invalid-email': 'Correo electrónico inválido',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    'auth/user-not-found': 'No existe una cuenta con este correo',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta más tarde',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
    'default': 'Ocurrió un error al iniciar sesión'
  }

  return messages[code] || messages['default']
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 450px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 40px;
  animation: fadeIn 0.5s ease;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header .logo {
  height: 60px;
  margin-bottom: 15px;
}

.login-header h2 {
  color: #2d3748;
  margin: 0;
}

.login-form {
  margin-top: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #4a5568;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
}

.form-group.error input {
  border-color: #f56565;
}

.form-group.error input:focus {
  box-shadow: 0 0 0 3px rgba(245, 101, 101, 0.2);
}

.error-message {
  display: block;
  margin-top: 6px;
  color: #f56565;
  font-size: 14px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
  font-size: 14px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4a5568;
  cursor: pointer;
}

.remember-me input {
  cursor: pointer;
}

.forgot-password {
  color: #4299e1;
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-password:hover {
  text-decoration: underline;
}

.login-button {
  width: 100%;
  padding: 14px;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 48px;
}

.login-button:hover {
  background-color: #3182ce;
}

.login-button:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

.auth-error {
  margin-top: 20px;
  padding: 12px;
  background-color: #fff5f5;
  color: #f56565;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.login-footer {
  margin-top: 30px;
  text-align: center;
  color: #718096;
}

.login-footer a {
  color: #4299e1;
  text-decoration: none;
}

.login-footer a:hover {
  text-decoration: underline;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 480px) {
  .login-card {
    padding: 30px 20px;
  }
  
  .form-options {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}
</style>