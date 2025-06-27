<template>
  <div class="clientes-container">
    <!-- Header con título y acciones -->
    <header class="clientes-header">
      <div class="header-content">
        <h1>
          <i class="fas fa-users"></i> Mis Clientes
        </h1>
        <div class="header-actions">
          <div class="ruta-filter">
            <label for="ruta-select"><i class="fas fa-filter"></i> Filtrar por Ruta:</label>
            <select 
              id="ruta-select" 
              v-model="selectedRuta" 
              @change="filterClientes"
              class="ruta-select"
            >
              <option value="todas">Todas las Rutas</option>
              <option v-for="ruta in userRutas" :key="ruta" :value="ruta">
                {{ ruta }}
              </option>
            </select>
          </div>
          <button class="add-cliente-btn" @click="nuevoCliente">
            <i class="fas fa-plus"></i> Nuevo Cliente
          </button>
        </div>
      </div>
    </header>

    <!-- Estadísticas rápidas -->
    <div class="stats-container">
      <div class="stat-card">
        <div class="stat-icon total">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-info">
          <h3>Total Clientes</h3>
          <p>{{ totalClientes }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon ruta">
          <i class="fas fa-route"></i>
        </div>
        <div class="stat-info">
          <h3>Clientes en {{ selectedRuta === 'todas' ? 'Tus Rutas' : selectedRuta }}</h3>
          <p>{{ filteredClientes.length }}</p>
        </div>
      </div>
    </div>

    <!-- Lista de clientes -->
    <div class="clientes-list-container">
      <div class="search-bar">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Buscar cliente por nombre, cédula o celular..."
          @input="filterClientes"
        >
      </div>

      <div class="clientes-list">
        <div v-if="loading" class="loading-container">
          <i class="fas fa-spinner fa-spin"></i> Cargando clientes...
        </div>

        <div v-else-if="filteredClientes.length === 0" class="empty-state">
          <i class="fas fa-user-slash"></i>
          <h3>No se encontraron clientes</h3>
          <p v-if="selectedRuta !== 'todas'">
            No tienes clientes en la ruta "{{ selectedRuta }}"
          </p>
          <p v-else>No tienes clientes asignados a tus rutas</p>
          <button class="add-cliente-btn" @click="nuevoCliente">
            <i class="fas fa-plus"></i> Agregar Primer Cliente
          </button>
        </div>

        <div v-else>
          <div class="cliente-card" v-for="cliente in filteredClientes" :key="cliente.id">
            <div class="cliente-header">
              <div class="cliente-avatar">
                {{ cliente.Nombre.charAt(0).toUpperCase() }}
              </div>
              <div class="cliente-info">
                <h3>{{ cliente.Nombre }}</h3>
                <p class="cliente-ruta">
                  <i class="fas fa-route"></i> {{ cliente.RutaSeleccionada }}
                </p>
              </div>
              <div class="cliente-actions">
                <button class="action-btn view" @click="verCliente(cliente.id)">
                  <i class="fas fa-eye"></i>
                </button>
                  <button 
                    class="action-btn create-loan" 
                    @click="CrearPrestamo(cliente.id)"
                    title="Crear nuevo préstamo"
                  >
                    <i class="fas fa-hand-holding-usd"></i>
                    <span class="tooltip"></span>
                  </button>
                
                <button class="action-btn edit" @click="editarCliente(cliente.id)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" @click="confirmarEliminar(cliente.id)">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            
            <div class="cliente-details">
              <div class="detail-row">
                <span class="detail-label"><i class="fas fa-id-card"></i> Cédula:</span>
                <span class="detail-value">{{ cliente.Cedula }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label"><i class="fas fa-phone"></i> Celular:</span>
                <span class="detail-value">{{ cliente.Celular }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label"><i class="fas fa-city"></i> Ciudad:</span>
                <span class="detail-value">{{ cliente.Ciudad }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label"><i class="fas fa-briefcase"></i> Trabajo:</span>
                <span class="detail-value">{{ cliente.Trabajo }}</span>
              </div>
            </div>
            
            <div class="cliente-more" @click="toggleMoreDetails(cliente.id)">
              <span>Ver {{ expandedDetails[cliente.id] ? 'menos' : 'más' }} detalles</span>
              <i class="fas" :class="expandedDetails[cliente.id] ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
            </div>
            
            <div class="more-details" v-if="expandedDetails[cliente.id]">
              <div class="details-section">
                <h4><i class="fas fa-home"></i> Dirección</h4>
                <p>{{ cliente.Direccion }}</p>
              </div>
              
              <div class="details-section">
                <h4><i class="fas fa-user-shield"></i> Fiador</h4>
                <div class="detail-row">
                  <span class="detail-label">Nombre:</span>
                  <span class="detail-value">{{ cliente.NombreFiador || 'No especificado' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Celular:</span>
                  <span class="detail-value">{{ cliente.CelularFiador || 'No especificado' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Dirección:</span>
                  <span class="detail-value">{{ cliente.DireccionFiador || 'No especificado' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Trabajo:</span>
                  <span class="detail-value">{{ cliente.TrabajoFiador || 'No especificado' }}</span>
                </div>
              </div>
              
              <div class="details-section">
                <h4><i class="fas fa-user-friends"></i> Referencias Familiares</h4>
                <div class="detail-row">
                  <span class="detail-label">Referencia 1:</span>
                  <span class="detail-value">{{ cliente.ReferenciasFamiliares1 || 'No especificado' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Referencia 2:</span>
                  <span class="detail-value">{{ cliente.ReferenciasFamiliares2 || 'No especificado' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación para eliminar -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Confirmar Eliminación</h3>
          <button class="close-modal" @click="showDeleteModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro que deseas eliminar al cliente {{ clienteToDelete?.Nombre }}?</p>
          <p class="warning-text">
            <i class="fas fa-exclamation-triangle"></i> Esta acción no se puede deshacer
          </p>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showDeleteModal = false">
            Cancelar
          </button>
          <button class="confirm-btn" @click="eliminarCliente">
            <i class="fas fa-trash"></i> Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { db, auth } from '@/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  doc, 
  deleteDoc 
} from 'firebase/firestore';

const router = useRouter();
const clientes = ref([]);
const filteredClientes = ref([]);
const userRutas = ref([]);
const selectedRuta = ref('todas');
const searchQuery = ref('');
const loading = ref(true);
const expandedDetails = ref({});
const showDeleteModal = ref(false);
const clienteToDelete = ref(null);

// Obtener datos del usuario logueado y sus rutas
const currentUser = auth.currentUser;
const totalClientes = computed(() => clientes.value.length);

onMounted(async () => {
  try {
    // Obtener las rutas del usuario logueado
    const usersRef = collection(db, 'Users');
    const q = query(usersRef, where('Correo', '==', currentUser.email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      // Asumimos que el campo de rutas es un array o una cadena
      if (Array.isArray(userData.Rutas)) {
        userRutas.value = userData.Rutas;
      } else if (userData.Rutas) {
        userRutas.value = [userData.Rutas];
      } else {
        userRutas.value = [];
      }
      
      // Si solo tiene una ruta, la seleccionamos por defecto
      if (userRutas.value.length === 1) {
        selectedRuta.value = userRutas.value[0];
      }
    }

    // Obtener todos los clientes que coincidan con las rutas del usuario
    const clientesRef = collection(db, 'Clientes');
    let clientesQuery;
    
    if (userRutas.value.length > 0) {
      clientesQuery = query(clientesRef, where('RutaSeleccionada', 'in', userRutas.value));
    } else {
      clientesQuery = query(clientesRef);
    }

    const clientesSnapshot = await getDocs(clientesQuery);
    clientes.value = clientesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    filterClientes();
  } catch (error) {
    console.error("Error al cargar clientes:", error);
  } finally {
    loading.value = false;
  }
});

const filterClientes = () => {
  let result = [...clientes.value];
  
  // Filtrar por ruta seleccionada
  if (selectedRuta.value !== 'todas') {
    result = result.filter(cliente => cliente.RutaSeleccionada === selectedRuta.value);
  }
  
  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(cliente => 
      cliente.Nombre.toLowerCase().includes(query) ||
      cliente.Cedula.includes(query) ||
      cliente.Celular.includes(query)
    );
  }
  
  filteredClientes.value = result;
};

const toggleMoreDetails = (clienteId) => {
  expandedDetails.value = {
    ...expandedDetails.value,
    [clienteId]: !expandedDetails.value[clienteId]
  };
};

const verCliente = (clienteId) => {
  router.push(`/clientes/${clienteId}`);
};

const CrearPrestamo = (clienteId) => {
  const cliente = clientes.value.find(c => c.id === clienteId);
  router.push({
    path: `/clientes/${clienteId}/crear-prestamos`,
    query: {
      nombreCliente: cliente.Nombre,
      rutaCliente: cliente.RutaSeleccionada,
      cedula: cliente.Cedula
    }
  });
};

const editarCliente = (clienteId) => {
  router.push(`/clientes/editar/${clienteId}`);
};

const nuevoCliente = () => {
  router.push('/crear-usuario');
};

const confirmarEliminar = (clienteId) => {
  clienteToDelete.value = clientes.value.find(c => c.id === clienteId);
  showDeleteModal.value = true;
};

const eliminarCliente = async () => {
  try {
    await deleteDoc(doc(db, 'Clientes', clienteToDelete.value.id));
    clientes.value = clientes.value.filter(c => c.id !== clienteToDelete.value.id);
    filterClientes();
    showDeleteModal.value = false;
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
  }
};
</script>

<style scoped>
.clientes-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

.clientes-header {
  background: linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%);
  border-radius: 12px;
  padding: 20px;
  color: white;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.header-content h1 {
  margin: 0;
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.ruta-filter {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ruta-filter label {
  font-weight: 500;
}

.ruta-select {
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  background-color: white;
  cursor: pointer;
  font-family: inherit;
}

.add-cliente-btn {
  background-color: #4cc9f0;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  transition: all 0.3s;
}

.add-cliente-btn:hover {
  background-color: #3a9ec4;
  transform: translateY(-2px);
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-icon.total {
  background: linear-gradient(135deg, #4361ee 0%, #4cc9f0 100%);
}

.stat-icon.ruta {
  background: linear-gradient(135deg, #7209b7 0%, #b5179e 100%);
}

.stat-info h3 {
  margin: 0 0 5px 0;
  font-size: 1rem;
  color: #666;
  font-weight: 500;
}

.stat-info p {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
}

.clientes-list-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.search-bar {
  display: flex;
  align-items: center;
  background: #f5f7fa;
  border-radius: 8px;
  padding: 10px 15px;
  margin-bottom: 20px;
}

.search-bar i {
  color: #666;
  margin-right: 10px;
}

.search-bar input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 0.9rem;
  outline: none;
}

.clientes-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #666;
  gap: 10px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.empty-state i {
  font-size: 3rem;
  color: #ccc;
  margin-bottom: 15px;
}

.empty-state h3 {
  margin: 0 0 10px 0;
  color: #444;
}

.empty-state p {
  margin: 0 0 20px 0;
}

.cliente-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s;
  border: 1px solid #eee;
}

.cliente-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border-color: #4361ee;
}

.cliente-header {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.cliente-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4361ee 0%, #4cc9f0 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: bold;
  margin-right: 15px;
}

.cliente-info {
  flex: 1;
}

.cliente-info h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.cliente-ruta {
  margin: 5px 0 0 0;
  font-size: 0.8rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 5px;
}

.cliente-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  border: none;
  background: #f5f7fa;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  transform: scale(1.1);
}

.action-btn.view {
  color: #4361ee;
}

.action-btn.view:hover {
  background: rgba(67, 97, 238, 0.1);
}

.action-btn.edit {
  color: #f8961e;
}

.action-btn.edit:hover {
  background: rgba(248, 150, 30, 0.1);
}

.action-btn.delete {
  color: #f72585;
}

.action-btn.delete:hover {
  background: rgba(247, 37, 133, 0.1);
}

.cliente-details {
  padding: 15px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.detail-row {
  display: flex;
  gap: 8px;
}

.detail-label {
  font-weight: 500;
  color: #666;
  display: flex;
  align-items: center;
  gap: 5px;
}

.detail-label i {
  font-size: 0.8rem;
}

.detail-value {
  color: #333;
}

.cliente-more {
  padding: 10px 15px;
  background: #f9f9f9;
  border-top: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #4361ee;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cliente-more:hover {
  background: #f0f4ff;
}

.more-details {
  padding: 15px;
  background: #f9f9f9;
  border-top: 1px solid #eee;
}

.details-section {
  margin-bottom: 15px;
}

.details-section:last-child {
  margin-bottom: 0;
}

.details-section h4 {
  margin: 0 0 10px 0;
  color: #444;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.details-section p {
  margin: 0 0 10px 15px;
  color: #333;
  font-size: 0.9rem;
}

/* Modal de confirmación */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  animation: modalFadeIn 0.3s;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-modal {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #666;
  cursor: pointer;
  padding: 5px;
}

.modal-body {
  padding: 20px;
}

.modal-body p {
  margin: 0 0 10px 0;
}

.warning-text {
  color: #f72585;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn, .confirm-btn {
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.cancel-btn {
  background: #f5f7fa;
  color: #666;
  border: none;
}

.cancel-btn:hover {
  background: #e9ecef;
}

.confirm-btn {
  background: #f72585;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.confirm-btn:hover {
  background: #d3166d;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .ruta-filter {
    width: 100%;
  }
  
  .ruta-select {
    width: 100%;
  }
  
  .add-cliente-btn {
    width: 100%;
    justify-content: center;
  }
  
  .cliente-header {
    flex-wrap: wrap;
    gap: 15px;
  }
  
  .cliente-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .cliente-details {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .clientes-container {
    padding: 10px;
  }
  
  .clientes-header {
    padding: 15px;
  }
  
  .header-content h1 {
    font-size: 1.4rem;
  }
  
  .stats-container {
    grid-template-columns: 1fr;
  }
}
</style>