<template>
  <div class="home-container">
    <!-- Header con información del usuario -->
    <header class="user-header">
      <div class="user-info">
        <div class="avatar">
          <i class="fas fa-user-circle"></i>
        </div>
        <div class="user-details">
            <h2>¡Hola, {{ userName }}!</h2>
            <p>{{ userEmail }}</p>
            <p><strong>Rol:</strong> {{ userRole }}</p> <!-- ← Aquí se muestra el Rol -->
        </div>

        
      </div>
      <button @click="handleLogout" class="logout-btn">
        <i class="fas fa-sign-out-alt"></i>
      </button>
    </header>

    <!-- Sección principal con iconos -->
    <main class="dashboard">
      <h3 class="section-title">Mis Acciones Rápidas</h3>

      <div class="icon-grid">

        <router-link to="/crear-usuario" class="icon-card">
          <i class="fas fa-user-plus"></i> Registrar Usuario
        </router-link>

        <router-link to="/lista-clientes" class="icon-card">
          <i class="fas fa-user-plus"></i> Lista Clientes
        </router-link>
        
        <router-link v-if="userRole === 'admin'" to="/rutas" class="icon-card">
          <i class="fas fa-user-plus"></i> Crear Ruta
        </router-link>
      </div>
    </main>

    <!-- Notificaciones recientes -->
    <section class="notifications">
      <h3 class="section-title">Notificaciones Recientes</h3>
      <ul class="notification-list">
        <li
          v-for="(notification, index) in notifications"
          :key="index"
          class="notification-item"
        >
          <i :class="notification.icon"></i>
          <div class="notification-content">
            <p>{{ notification.message }}</p>
            <small>{{ notification.time }}</small>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db } from '@/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

const router = useRouter();
const userEmail = ref('');
const userName = ref('Usuario');
const userRole = ref(''); // ← Nuevo campo para el rol
const notifications = ref([
  {
    icon: 'fas fa-check-circle success',
    message: 'Tu sesión ha sido iniciada correctamente',
    time: 'Hace 2 minutos'
  },
  {
    icon: 'fas fa-bell warning',
    message: 'Nuevo mensaje recibido',
    time: 'Hace 1 hora'
  },
  {
    icon: 'fas fa-info-circle info',
    message: 'Actualización del sistema disponible',
    time: 'Ayer'
  }
]);

onMounted(async () => {
  const user = auth.currentUser;
  if (user) {
    userEmail.value = user.email;

    try {
      const usersRef = collection(db, 'Users');
      const q = query(usersRef, where('Correo', '==', user.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const data = userDoc.data();
        userName.value = data.Nombre || user.email.split('@')[0];
        userRole.value = data.Rol || ''; // ← Obtiene el Rol del usuario
      } else {
        console.warn('No se encontró usuario con ese correo.');
        userName.value = user.email.split('@')[0];
      }
    } catch (error) {
      console.error('Error al buscar el nombre del usuario:', error);
    }
  } else {
    router.push('/login');
  }
});

const handleLogout = async () => {
  try {
    await signOut(auth);
    router.push('/login');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
};
</script>


<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  color: #333;
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%);
  border-radius: 12px;
  color: white;
  margin-bottom: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.avatar {
  font-size: 50px;
}

.user-details h2 {
  margin: 0;
  font-size: 1.5rem;
}

.user-details p {
  margin: 5px 0 0;
  opacity: 0.9;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.section-title {
  font-size: 1.3rem;
  color: #4361ee;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.icon-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 25px 15px;
  background: white;
  border-radius: 10px;
  text-decoration: none;
  color: #333;
  transition: all 0.3s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  border: 1px solid #eee;
}

.icon-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  border-color: #4361ee;
}

.icon-wrapper {
  width: 60px;
  height: 60px;
  background: #f0f8ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  font-size: 24px;
  color: #4361ee;
}

.icon-card span {
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}

.notification-list {
  list-style: none;
  padding: 0;
}

.notification-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  margin-bottom: 10px;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.notification-item i {
  font-size: 20px;
}

.notification-item i.success {
  color: #4caf50;
}

.notification-item i.warning {
  color: #ff9800;
}

.notification-item i.info {
  color: #2196f3;
}

.notification-content p {
  margin: 0;
  font-size: 14px;
}

.notification-content small {
  color: #777;
  font-size: 12px;
}

@media (max-width: 768px) {
  .icon-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 15px;
  }
  
  .user-header {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
  
  .user-info {
    flex-direction: column;
  }
}
.create-user-btn {
  background-color: #4361ee;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  transition: background 0.3s ease;
}

.create-user-btn:hover {
  background-color: #364fc7;
}

</style>