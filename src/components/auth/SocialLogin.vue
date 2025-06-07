<template>
  <div class="social-login">
    <button 
      v-for="provider in providers" 
      :key="provider.id"
      :class="['social-button', provider.id]"
      @click="handleSocialLogin(provider.id)"
    >
      <i :class="provider.icon"></i>
      <span>Continuar con {{ provider.name }}</span>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { auth } from '@/firebase';
import { useRouter } from 'vue-router';

const router = useRouter();
const error = ref(null);

const providers = [
  {
    id: 'google',
    name: 'Google',
    icon: 'fab fa-google',
    provider: new GoogleAuthProvider()
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'fab fa-facebook-f',
    provider: new FacebookAuthProvider()
  }
  // Puedes añadir más proveedores aquí
];

const emit = defineEmits(['google', 'facebook', 'error']);

const handleSocialLogin = async (providerId) => {
  try {
    error.value = null;
    const selected = providers.find(p => p.id === providerId);
    
    // Configuración adicional para Facebook
    if (providerId === 'facebook') {
      selected.provider.addScope('email');
    }
    
    const result = await signInWithPopup(auth, selected.provider);
    emit(providerId, result.user);
    
    // Redirección después de login exitoso
    router.push('/dashboard');
    
  } catch (err) {
    error.value = parseSocialError(err.code);
    emit('error', error.value);
    console.error('Error en social login:', err);
  }
};

const parseSocialError = (code) => {
  const errors = {
    'auth/account-exists-with-different-credential': 'Este email ya está registrado con otro método',
    'auth/popup-closed-by-user': 'Ventana de login cerrada',
    'auth/cancelled-popup-request': 'Solicitud cancelada',
    'auth/popup-blocked': 'El popup fue bloqueado por tu navegador',
    'default': 'Error al iniciar sesión con red social'
  };
  return errors[code] || errors['default'];
};
</script>

<style scoped>
.social-login {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.social-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background-color: white;
  color: #4a5568;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.social-button:hover {
  background-color: #f7fafc;
  transform: translateY(-1px);
}

.social-button i {
  font-size: 18px;
}

/* Estilos específicos para cada proveedor */
.social-button.google {
  border-color: #e53e3e;
  color: #e53e3e;
}

.social-button.google:hover {
  background-color: #fff5f5;
}

.social-button.facebook {
  border-color: #3182ce;
  color: #3182ce;
}

.social-button.facebook:hover {
  background-color: #ebf8ff;
}

/* Para Font Awesome */
.fab {
  font-family: 'Font Awesome 6 Brands';
}
</style>