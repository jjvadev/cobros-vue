<template>
  <div class="dashboard-container">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="user-profile">
        <div class="avatar">
          {{ userName.charAt(0).toUpperCase() }}
        </div>
        <div class="user-info">
          <h2>¡Hola, {{ userName }}!</h2>
          <p class="user-email">{{ userEmail }}</p>
          <span class="user-role">{{ userRole }}</span>
        </div>
      </div>
      <button @click="handleLogout" class="logout-btn">
        <i class="fas fa-sign-out-alt"></i>
      </button>
    </header>

    <!-- Quick Actions -->
    <section class="quick-actions">
      <h3><i class="fas fa-bolt"></i> Acciones Rápidas</h3>
      <div class="actions-grid">
        <router-link to="/crear-usuario" class="action-card">
          <div class="action-icon bg-blue">
            <i class="fas fa-user-plus"></i>
          </div>
          <span>Registrar Usuario</span>
        </router-link>

        <router-link to="/lista-clientes" class="action-card">
          <div class="action-icon bg-green">
            <i class="fas fa-users"></i>
          </div>
          <span>Lista Clientes</span>
        </router-link>

        <router-link to="/lista-prestamos" class="action-card">
          <div class="action-icon bg-green">
            <i class="fas fa-money"></i>
          </div>
          <span>Lista Prestamos</span>
        </router-link>
        
        <router-link v-if="userRole === 'admin'" to="/rutas" class="action-card">
          <div class="action-icon bg-orange">
            <i class="fas fa-route"></i>
          </div>
          <span>Gestionar Rutas</span>
        </router-link>
      </div>
    </section>

    <!-- Notifications -->
    <section class="notifications-section">
      <div class="notifications-header">
        <h3><i class="fas fa-bell"></i> Notificaciones</h3>
        <button @click="markAllAsRead" v-if="hasUnread" class="mark-read-btn">
          Marcar todas como leídas
        </button>
      </div>
      <div class="notifications-list">
        <div 
          v-for="(notif, index) in notifications" 
          :key="index"
          class="notification-item"
          :class="{ 'unread': !notif.read }"
          @click="markAsRead(index)"
        >
          <div :class="['notification-icon', notif.type]">
            <i :class="notif.icon"></i>
          </div>
          <div class="notification-content">
            <p>{{ notif.message }}</p>
            <small><i class="fas fa-clock"></i> {{ notif.time }}</small>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db } from '@/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

const router = useRouter();
const userEmail = ref('');
const userName = ref('Usuario');
const userRole = ref('user');

const notifications = ref([
  {
    icon: 'fas fa-check-circle',
    message: 'Sesión iniciada correctamente',
    time: 'Hace 2 minutos',
    type: 'success',
    read: true
  },
  {
    icon: 'fas fa-envelope',
    message: 'Tienes 3 nuevos clientes',
    time: 'Hace 1 hora',
    type: 'info',
    read: false
  },
  {
    icon: 'fas fa-exclamation-triangle',
    message: 'Actualización disponible',
    time: 'Ayer',
    type: 'warning',
    read: false
  }
]);

const hasUnread = computed(() => notifications.value.some(n => !n.read));

onMounted(async () => {
  const user = auth.currentUser;
  if (user) {
    userEmail.value = user.email;
    
    try {
      const usersRef = collection(db, 'Users');
      const q = query(usersRef, where('Correo', '==', user.email));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
        userName.value = userData.Nombre || user.email.split('@')[0];
        userRole.value = userData.Rol || 'user';
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }
});

const handleLogout = async () => {
  try {
    await signOut(auth);
    router.push('/login');
  } catch (error) {
    console.error("Logout error:", error);
  }
};

const markAsRead = (index) => {
  notifications.value[index].read = true;
};

const markAllAsRead = () => {
  notifications.value.forEach(n => n.read = true);
};
</script>

<style scoped>
/* Base Styles */
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

/* Header */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%);
  border-radius: 12px;
  color: white;
  margin-bottom: 30px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 15px;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
}

.user-info h2 {
  margin: 0;
  font-size: 1.4rem;
}

.user-email {
  margin: 5px 0;
  opacity: 0.9;
  font-size: 0.9rem;
}

.user-role {
  display: inline-block;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  font-size: 0.8rem;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Quick Actions */
.quick-actions {
  margin-bottom: 30px;
}

.quick-actions h3 {
  color: #4361ee;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  text-decoration: none;
  color: #333;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
  border: 1px solid #eee;
}

.action-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.action-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  margin: 0 auto 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.bg-blue { background: #4361ee; }
.bg-green { background: #2ec4b6; }
.bg-orange { background: #f8961e; }

/* Notifications */
.notifications-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.notifications-header h3 {
  color: #4361ee;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}

.mark-read-btn {
  background: none;
  border: none;
  color: #4361ee;
  font-size: 0.8rem;
  cursor: pointer;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notification-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.notification-item.unread {
  background: #f8f9fa;
  border-left: 3px solid #4361ee;
}

.notification-item:hover {
  background: #f1f3f5;
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.notification-icon.success { background: #4cc9f0; }
.notification-icon.info { background: #4895ef; }
.notification-icon.warning { background: #f8961e; }

.notification-content p {
  margin: 0 0 5px 0;
}

.notification-content small {
  color: #666;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 15px;
  }
  
  .dashboard-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .user-profile {
    flex-direction: column;
  }
  
  .actions-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .notification-item {
    padding: 12px;
  }
}
</style>