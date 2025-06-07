<template>
  <div class="rutas-container">
    <!-- Header con título y acciones -->
    <header class="header">
      <h1 class="title">
        <i class="fas fa-route"></i> Gestión de Rutas
      </h1>
      <div class="actions">
        <button @click="toggleForm" class="btn primary">
          <i class="fas" :class="[showForm ? 'fa-times' : 'fa-plus']"></i>
          {{ showForm ? 'Cancelar' : 'Nueva Ruta' }}
        </button>
      </div>
    </header>

    <!-- Formulario desplegable -->
    <transition name="slide-fade">
      <form v-if="showForm" @submit.prevent="guardarRuta" class="ruta-form card">
        <h3 class="form-title">
          <i class="fas fa-plus-circle"></i> {{ editingIndex === null ? 'Agregar' : 'Editar' }} Ruta
        </h3>
        
        <div class="form-grid">
          <div class="form-group">
            <label for="base">Base</label>
            <input id="base" v-model="ruta.Base" required placeholder="Ej: Principal" />
          </div>

          <div class="form-group">
            <label for="caja">Caja</label>
            <input id="caja" v-model="ruta.Caja" required placeholder="Ej: CA-001" />
          </div>

          <div class="form-group">
            <label for="cobrador">Cobrador</label>
            <input id="cobrador" v-model="ruta.Cobrador" required placeholder="Nombre del cobrador" />
          </div>

          <div class="form-group">
            <label for="codigo">Código</label>
            <input
              id="codigo"
              type="number"
              v-model.number="ruta.Codigo"
              required
              min="0"
              placeholder="Ej: 1001"
            />
          </div>

          <div class="form-group">
            <label for="nombre">Nombre Ruta</label>
            <input id="nombre" v-model="ruta.Nombre" required placeholder="Ej: Ruta Norte" />
          </div>

          <div class="form-group">
            <label for="super">Super</label>
            <input id="super" v-model="ruta.Super" required placeholder="Ej: SUP-01" />
          </div>

          <div class="form-group">
            <label for="supervisor">Supervisor</label>
            <input id="supervisor" v-model="ruta.Supervisor" required placeholder="Nombre del supervisor" />
          </div>
        </div>

        <div class="form-actions">
          <button type="button" @click="resetForm" class="btn secondary">
            <i class="fas fa-undo"></i> Limpiar
          </button>
          <button type="submit" class="btn primary" :disabled="loading">
            <template v-if="!loading">
              <i class="fas fa-save"></i> {{ editingIndex === null ? 'Guardar' : 'Actualizar' }}
            </template>
            <template v-else>
              <i class="fas fa-spinner fa-spin"></i> Procesando...
            </template>
          </button>
        </div>

        <div v-if="error" class="error-message">
          <i class="fas fa-exclamation-circle"></i> {{ error }}
        </div>
      </form>
    </transition>

    <!-- Listado de rutas -->
    <section class="rutas-list">
      <div class="list-header">
        <h3>
          <i class="fas fa-list"></i> Rutas Registradas
          <span class="badge">{{ rutas.length }}</span>
        </h3>
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Buscar rutas..." 
            @input="filtrarRutas"
          />
        </div>
      </div>

      <div class="table-responsive">
        <table class="styled-table">
          <thead>
            <tr>
              <th @click="ordenarPor('Codigo')">
                Código <i class="fas" :class="{'fa-sort': sortKey !== 'Codigo', 'fa-sort-up': sortKey === 'Codigo' && sortOrder === 1, 'fa-sort-down': sortKey === 'Codigo' && sortOrder === -1}"></i>
              </th>
              <th @click="ordenarPor('Nombre')">
                Nombre <i class="fas" :class="{'fa-sort': sortKey !== 'Nombre', 'fa-sort-up': sortKey === 'Nombre' && sortOrder === 1, 'fa-sort-down': sortKey === 'Nombre' && sortOrder === -1}"></i>
              </th>
              <th>Base</th>
              <th>Cobrador</th>
              <th>Supervisor</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(ruta, index) in rutasFiltradas" :key="index">
              <td>{{ ruta.Codigo }}</td>
              <td>{{ ruta.Nombre }}</td>
              <td>{{ ruta.Base }}</td>
              <td>{{ ruta.Cobrador }}</td>
              <td>{{ ruta.Supervisor }}</td>
              <td class="actions-cell">
                <button @click="editarRuta(index)" class="btn-icon" title="Editar">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="confirmarEliminar(ruta.id)" class="btn-icon danger" title="Eliminar">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </td>
            </tr>
            <tr v-if="rutasFiltradas.length === 0">
              <td colspan="6" class="no-results">
                <i class="fas fa-info-circle"></i> No se encontraron rutas
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination" v-if="rutasFiltradas.length > 0">
        <button @click="paginaAnterior" :disabled="paginaActual === 1">
          <i class="fas fa-chevron-left"></i>
        </button>
        <span>Página {{ paginaActual }} de {{ totalPaginas }}</span>
        <button @click="paginaSiguiente" :disabled="paginaActual === totalPaginas">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </section>

    <!-- Modal de confirmación -->
    <transition name="fade">
      <div v-if="showDeleteModal" class="modal-overlay">
        <div class="modal-content">
          <h3><i class="fas fa-exclamation-triangle"></i> Confirmar Eliminación</h3>
          <p>¿Estás seguro que deseas eliminar la ruta <strong>{{ rutaAEliminar?.Nombre }}</strong>?</p>
          <div class="modal-actions">
            <button @click="showDeleteModal = false" class="btn secondary">
              <i class="fas fa-times"></i> Cancelar
            </button>
            <button @click="eliminarRuta" class="btn danger">
              <i class="fas fa-trash-alt"></i> Eliminar
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { collection, addDoc, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase';

// Estado del componente
const showForm = ref(false);
const loading = ref(false);
const error = ref(null);
const showDeleteModal = ref(false);
const editingIndex = ref(null);
const searchQuery = ref('');
const sortKey = ref('Codigo');
const sortOrder = ref(1); // 1 para ascendente, -1 para descendente
const paginaActual = ref(1);
const itemsPorPagina = 10;

// Datos
const ruta = ref({
  Base: '',
  Caja: '',
  Cobrador: '',
  Codigo: null,
  Nombre: '',
  Super: '',
  Supervisor: ''
});

const rutas = ref([]);
const rutaAEliminar = ref(null);

// Computed
const rutasFiltradas = computed(() => {
  let filtered = [...rutas.value];
  
  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(r => 
      r.Nombre.toLowerCase().includes(query) || 
      r.Codigo.toString().includes(query) ||
      r.Cobrador.toLowerCase().includes(query) ||
      r.Supervisor.toLowerCase().includes(query)
    );
  }
  
  // Ordenar
  filtered.sort((a, b) => {
    if (a[sortKey.value] < b[sortKey.value]) return -1 * sortOrder.value;
    if (a[sortKey.value] > b[sortKey.value]) return 1 * sortOrder.value;
    return 0;
  });
  
  // Paginación
  const start = (paginaActual.value - 1) * itemsPorPagina;
  const end = start + itemsPorPagina;
  return filtered.slice(start, end);
});

const totalPaginas = computed(() => {
  return Math.ceil(rutas.value.length / itemsPorPagina);
});

// Métodos
const toggleForm = () => {
  showForm.value = !showForm.value;
  if (!showForm.value) {
    resetForm();
  }
};

const resetForm = () => {
  ruta.value = {
    Base: '',
    Caja: '',
    Cobrador: '',
    Codigo: null,
    Nombre: '',
    Super: '',
    Supervisor: ''
  };
  editingIndex.value = null;
  error.value = null;
};

const cargarRutas = async () => {
  try {
    loading.value = true;
    const querySnapshot = await getDocs(collection(db, 'Rutas'));
    rutas.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error('Error cargando rutas:', err);
    error.value = 'Error al cargar las rutas';
  } finally {
    loading.value = false;
  }
};

const guardarRuta = async () => {
  try {
    // Validación
    if (!ruta.value.Base || !ruta.value.Caja || !ruta.value.Cobrador || 
        ruta.value.Codigo === null || !ruta.value.Nombre || 
        !ruta.value.Super || !ruta.value.Supervisor) {
      error.value = 'Todos los campos son requeridos';
      return;
    }

    loading.value = true;
    error.value = null;

    await addDoc(collection(db, 'Rutas'), { ...ruta.value });
    
    // Recargar y resetear
    await cargarRutas();
    resetForm();
    showForm.value = false;
    
  } catch (err) {
    console.error('Error guardando ruta:', err);
    error.value = 'Error al guardar la ruta';
  } finally {
    loading.value = false;
  }
};

const editarRuta = (index) => {
  const rutaSeleccionada = rutasFiltradas.value[index];
  ruta.value = { ...rutaSeleccionada };
  editingIndex.value = index;
  showForm.value = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const confirmarEliminar = (id) => {
  rutaAEliminar.value = rutas.value.find(r => r.id === id);
  showDeleteModal.value = true;
};

const eliminarRuta = async () => {
  try {
    loading.value = true;
    await deleteDoc(doc(db, 'Rutas', rutaAEliminar.value.id));
    await cargarRutas();
    showDeleteModal.value = false;
  } catch (err) {
    console.error('Error eliminando ruta:', err);
    error.value = 'Error al eliminar la ruta';
  } finally {
    loading.value = false;
  }
};

const ordenarPor = (key) => {
  if (sortKey.value === key) {
    sortOrder.value *= -1;
  } else {
    sortKey.value = key;
    sortOrder.value = 1;
  }
};

const filtrarRutas = () => {
  paginaActual.value = 1;
};

const paginaAnterior = () => {
  if (paginaActual.value > 1) paginaActual.value--;
};

const paginaSiguiente = () => {
  if (paginaActual.value < totalPaginas.value) paginaActual.value++;
};

// Ciclo de vida
onMounted(() => {
  cargarRutas();
});
</script>

<style scoped>
.rutas-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.title {
  font-size: 28px;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.title i {
  color: #4361ee;
}

.actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  border: none;
}

.btn.primary {
  background-color: #4361ee;
  color: white;
}

.btn.primary:hover {
  background-color: #3a56d4;
}

.btn.secondary {
  background-color: #f1f5f9;
  color: #334155;
}

.btn.secondary:hover {
  background-color: #e2e8f0;
}

.btn.danger {
  background-color: #ef4444;
  color: white;
}

.btn.danger:hover {
  background-color: #dc2626;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f1f5f9;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background-color: #e2e8f0;
}

.btn-icon.danger {
  color: #ef4444;
}

.btn-icon.danger:hover {
  background-color: #fee2e2;
}

/* Formulario */
.ruta-form {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.form-title {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-title i {
  color: #4361ee;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #475569;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #4361ee;
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.error-message {
  margin-top: 15px;
  padding: 12px;
  background-color: #fff5f5;
  color: #ef4444;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Lista de rutas */
.rutas-list {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.list-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.badge {
  background-color: #4361ee;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box i {
  position: absolute;
  left: 12px;
  color: #94a3b8;
}

.search-box input {
  padding: 8px 12px 8px 36px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  min-width: 250px;
}

.search-box input:focus {
  outline: none;
  border-color: #4361ee;
}

.table-responsive {
  overflow-x: auto;
}

.styled-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.styled-table th {
  background-color: #f8fafc;
  color: #475569;
  font-weight: 600;
  text-align: left;
  padding: 12px 16px;
  border-bottom: 2px solid #e2e8f0;
  cursor: pointer;
  user-select: none;
}

.styled-table th:hover {
  background-color: #f1f5f9;
}

.styled-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
}

.styled-table tr:hover td {
  background-color: #f8fafc;
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.no-results {
  text-align: center;
  padding: 20px;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
}

.pagination button {
  background-color: #f1f5f9;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.modal-content h3 {
  margin-top: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #2c3e50;
}

.modal-content h3 i {
  color: #ef4444;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

/* Transiciones */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .search-box input {
    min-width: 100%;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .styled-table {
    font-size: 13px;
  }
  
  .styled-table th, 
  .styled-table td {
    padding: 8px 12px;
  }
}
</style>