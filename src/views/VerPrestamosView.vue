<template>
  <div class="ver-prestamos-container">
    <!-- Header con fondo degradado y sombra -->
    <header class="prestamos-header">
      <div class="header-content">
        <div class="title-container">
          <i class="fas fa-file-invoice-dollar header-icon"></i>
          <h1>Préstamos por Ruta</h1>
        </div>
        <p class="subtitle">Visualiza y gestiona todos los préstamos organizados por rutas</p>
      </div>
      
      <!-- Filtros con diseño de tarjeta -->
      <div class="filtros-container">
        <div class="filtros-card">
          <div class="filter-group">
            <label for="ruta-select" class="filter-label">
              <i class="fas fa-route filter-icon"></i> Filtrar por Ruta:
            </label>
            <select 
              id="ruta-select" 
              v-model="rutaSeleccionada" 
              @change="filtrarPrestamos"
              class="styled-select"
            >
              <option value="todas">Todas las Rutas</option>
              <option v-for="ruta in rutasDisponibles" :key="ruta" :value="ruta">{{ ruta }}</option>
            </select>
          </div>
          
          <div class="filter-group search-group">
            <i class="fas fa-search search-icon"></i>
            <input
              type="text"
              v-model="busqueda"
              placeholder="Buscar por cliente o cédula..."
              @input="filtrarPrestamos"
              class="search-input"
            />
          </div>
        </div>
      </div>
    </header>

    <!-- Estado de carga con animación -->
    <div v-if="cargando" class="cargando-container">
      <div class="spinner-container">
        <div class="spinner"></div>
        <p>Cargando préstamos...</p>
      </div>
    </div>

    <!-- Contenido principal -->
    <main class="main-content">
      <!-- Estado vacío con ilustración -->
      <div v-if="!cargando && prestamosFiltrados.length === 0" class="empty-state">
        <div class="empty-illustration">
          <i class="fas fa-money-check-alt"></i>
        </div>
        <h3>No hay préstamos para mostrar</h3>
        <p>No encontramos préstamos con los filtros aplicados.</p>
        <button class="primary-btn" @click="resetFilters">
          <i class="fas fa-sync-alt"></i> Reiniciar filtros
        </button>
      </div>

      <!-- Lista de préstamos en grid responsivo -->
      <div v-else-if="!cargando" class="prestamos-grid">
        <div 
          class="prestamo-card" 
          v-for="prestamo in prestamosFiltrados" 
          :key="prestamo.id"
          :class="getStatusClass(prestamo.Estado)"
        >
          <div class="card-header">
            <div class="client-info">
              <div class="avatar">
                {{ getInitials(prestamo.clienteNombre) }}
              </div>
              <div>
                <h3>{{ prestamo.clienteNombre }}</h3>
                <p class="cedula">{{ prestamo.Cedula }}</p>
              </div>
            </div>
            <span class="ruta-badge">
              <i class="fas fa-route"></i> {{ prestamo.Ruta }}
            </span>
          </div>

          <div class="card-body">
            <div class="detail-row">
              <span class="detail-label">Valor Préstamo</span>
              <span class="detail-value">${{ formatCurrency(prestamo.Valor_Prestamo) }}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Interés</span>
              <span class="detail-value">{{ prestamo.Interes }}%</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Cuotas</span>
              <span class="detail-value">{{ prestamo.Numero_Cuotas }}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Valor Cuota</span>
              <span class="detail-value">${{ formatCurrency(prestamo.Cuota_Aproximada) }}</span>
            </div>
          </div>

          <div class="card-footer">
            <div class="status-indicator" :class="getStatusClass(prestamo.Estado)">
              {{ prestamo.Estado }}
            </div>
            <div class="next-payment">
              <i class="far fa-calendar-alt"></i>
              <span>{{ prestamo.Proximo_Pago || 'Sin fecha' }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';

const prestamos = ref([]);
const prestamosFiltrados = ref([]);
const rutasDisponibles = ref([]);
const rutaSeleccionada = ref('todas');
const busqueda = ref('');
const cargando = ref(true);

// Formatear moneda
function formatCurrency(value) {
  if (!value) return '0';
  return new Intl.NumberFormat('es-CO', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

// Obtener iniciales del nombre
function getInitials(name) {
  if (!name) return '?';
  return name.split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

// Clase CSS según estado
function getStatusClass(status) {
  if (!status) return '';
  const statusMap = {
    'Activo': 'status-active',
    'Pagado': 'status-paid',
    'Mora': 'status-overdue',
    'Cancelado': 'status-cancelled'
  };
  return statusMap[status] || '';
}

// Reiniciar filtros
function resetFilters() {
  rutaSeleccionada.value = 'todas';
  busqueda.value = '';
  filtrarPrestamos();
}

// Filtrar préstamos
const filtrarPrestamos = () => {
  let resultado = [...prestamos.value];

  if (rutaSeleccionada.value !== 'todas') {
    resultado = resultado.filter(p => p.Ruta === rutaSeleccionada.value);
  }

  if (busqueda.value) {
    const q = busqueda.value.toLowerCase();
    resultado = resultado.filter(p =>
      (p.clienteNombre && p.clienteNombre.toLowerCase().includes(q)) ||
      (p.Cedula && p.Cedula.includes(q))
    );
  }

  prestamosFiltrados.value = resultado;
};

// Cargar datos iniciales
onMounted(async () => {
  cargando.value = true;
  try {
    const prestamosRef = collection(db, 'Prestamos');
    const snapshot = await getDocs(prestamosRef);
    prestamos.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Extraer rutas únicas
    const rutas = new Set(prestamos.value.map(p => p.Ruta).filter(Boolean));
    rutasDisponibles.value = Array.from(rutas);

    filtrarPrestamos();
  } catch (error) {
    console.error('Error al cargar préstamos:', error);
  } finally {
    cargando.value = false;
  }
});
</script>

<style scoped>
/* Estilos base */
.ver-prestamos-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Header styles */
.prestamos-header {
  background: linear-gradient(135deg, #4a6cf7 0%, #2541b2 100%);
  color: white;
  padding: 2rem 1.5rem;
  border-radius: 0 0 20px 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
}

.title-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.header-icon {
  font-size: 2rem;
}

h1 {
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0;
}

.subtitle {
  font-size: 1rem;
  opacity: 0.9;
  margin: 0;
}

/* Filtros section */
.filtros-container {
  max-width: 1200px;
  margin: 2rem auto 0;
}

.filtros-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 200px;
}

.filter-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #4a5568;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-icon {
  color: #4a6cf7;
}

.styled-select {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #f8fafc;
  transition: all 0.3s ease;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
}

.styled-select:focus {
  outline: none;
  border-color: #4a6cf7;
  box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.2);
}

.search-group {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(50%);
  color: #a0aec0;
}

.search-input {
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #f8fafc;
  width: 100%;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #4a6cf7;
  box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.2);
}

/* Loading state */
.cargando-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.spinner-container {
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #4a6cf7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  max-width: 500px;
  margin: 0 auto;
}

.empty-illustration {
  font-size: 5rem;
  color: #cbd5e0;
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #718096;
  margin-bottom: 1.5rem;
}

.primary-btn {
  background-color: #4a6cf7;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.primary-btn:hover {
  background-color: #3a5bd9;
  transform: translateY(-2px);
}

/* Prestamos grid */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem 2rem;
}

.prestamos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

/* Prestamo card */
.prestamo-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border-top: 4px solid #4a6cf7;
}

.prestamo-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.prestamo-card.status-active {
  border-top-color: #48bb78;
}

.prestamo-card.status-paid {
  border-top-color: #9f7aea;
}

.prestamo-card.status-overdue {
  border-top-color: #f56565;
}

.prestamo-card.status-cancelled {
  border-top-color: #a0aec0;
}

.card-header {
  padding: 1.25rem;
  border-bottom: 1px solid #edf2f7;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.client-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 40px;
  height: 40px;
  background-color: #4a6cf7;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

h3 {
  font-size: 1.1rem;
  margin: 0;
  color: #2d3748;
  font-weight: 600;
}

.cedula {
  font-size: 0.85rem;
  color: #718096;
  margin-top: 0.25rem;
}

.ruta-badge {
  background-color: #ebf4ff;
  color: #4a6cf7;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.card-body {
  padding: 1.25rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  color: #718096;
  font-size: 0.9rem;
}

.detail-value {
  color: #2d3748;
  font-weight: 500;
}

.card-footer {
  padding: 1rem 1.25rem;
  background-color: #f8fafc;
  border-top: 1px solid #edf2f7;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-indicator {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-active {
  background-color: #f0fff4;
  color: #48bb78;
}

.status-paid {
  background-color: #faf5ff;
  color: #9f7aea;
}

.status-overdue {
  background-color: #fff5f5;
  color: #f56565;
}

.status-cancelled {
  background-color: #edf2f7;
  color: #718096;
}

.next-payment {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #4a5568;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .prestamos-header {
    padding: 1.5rem 1rem;
    border-radius: 0;
  }
  
  .filtros-card {
    flex-direction: column;
    gap: 1rem;
  }
  
  .prestamos-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .title-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .header-icon {
    font-size: 1.5rem;
  }
  
  h1 {
    font-size: 1.5rem;
  }
}
</style>