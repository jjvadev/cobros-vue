<template>
  <form @submit.prevent="$emit('submit', { email, password })">
    <div class="form-group">
      <label for="email">Correo electrónico</label>
      <input
        id="email"
        type="email"
        v-model="email"
        placeholder="tu@email.com"
        required
      >
    </div>
    
    <div class="form-group">
      <label for="password">Contraseña</label>
      <input
        id="password"
        type="password"
        v-model="password"
        placeholder="••••••••"
        required
      >
    </div>
    
    <button type="submit" :disabled="loading">
      <span v-if="!loading">Iniciar Sesión</span>
      <span v-else class="loading">Cargando...</span>
    </button>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue';

const email = ref('');
const password = ref('');

defineProps({
  loading: Boolean,
  error: String
});
</script>

<style scoped>
.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #4a5568;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 16px;
}

button {
  width: 100%;
  padding: 14px;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #3182ce;
}

button:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

.error-message {
  margin-top: 15px;
  padding: 10px;
  background-color: #fff5f5;
  color: #e53e3e;
  border-radius: 6px;
  text-align: center;
  font-size: 14px;
}
</style>