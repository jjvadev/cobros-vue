<template>
  <div class="ver-prestamos-container">
    <!-- Header -->
    <header class="prestamos-header">
      <div class="header-content">
        <div class="title-container">
          <i class="fas fa-file-invoice-dollar header-icon"></i>
          <h1>Préstamos por Ruta</h1>
        </div>
        <p class="subtitle">Visualiza y gestiona todos los préstamos organizados por rutas</p>
      </div>
      
      <!-- Filtros -->
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

    <!-- Estado de carga -->
    <div v-if="cargando" class="cargando-container">
      <div class="spinner-container">
        <div class="spinner"></div>
        <p>Cargando préstamos...</p>
      </div>
    </div>

    <!-- Contenido principal -->
    <main class="main-content">
      <!-- Estado vacío -->
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

      <!-- Lista de préstamos -->
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
              <span class="detail-label">Saldo Pendiente</span>
              <span class="detail-value">${{ formatCurrency(prestamo.Saldo_Pendiente || prestamo.Valor_Prestamo) }}</span>
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
              <span class="detail-label">Método Pago</span>
              <span class="detail-value">{{ prestamo.Metodo_Pago || 'No especificado' }}</span>
            </div>
            
            <div class="detail-row" v-if="prestamo.Estado === 'Activo'">
              <span class="detail-label">Valor Cuota</span>
              <span class="detail-value">${{ formatCurrency(prestamo.Cuota_Aproximada) }}</span>
            </div>
          </div>

          <div class="card-footer">
            <div class="status-indicator" :class="getStatusClass(prestamo.Estado)">
              {{ prestamo.Estado }}
            </div>
            <div class="next-payment" v-if="prestamo.Estado === 'Activo'">
              <i class="far fa-calendar-alt"></i>
              <span>{{ prestamo.Proximo_Pago || 'Sin fecha' }}</span>
            </div>
          </div>

          <!-- Acciones -->
          <div class="card-actions">
            <button 
              class="action-btn history-btn"
              @click="openHistoryModal(prestamo)"
            >
              <i class="fas fa-history"></i> Historial
            </button>
            <div class="payment-buttons">
              <button 
                class="action-btn pay-full" 
                @click="openPaymentModal(prestamo, 'full')"
                :disabled="prestamo.Estado !== 'Activo'"
              >
                <i class="fas fa-money-bill-wave"></i> Pagar
              </button>
              <button 
                class="action-btn pay-partial" 
                @click="openPaymentModal(prestamo, 'partial')"
                :disabled="prestamo.Estado !== 'Activo'"
              >
                <i class="fas fa-hand-holding-usd"></i> Abonar
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal de pago -->
    <div v-if="showPaymentModal" class="payment-modal-overlay">
      <div class="payment-modal">
        <div class="modal-header">
          <h3>{{ paymentType === 'full' ? 'Pagar Cuota' : 'Realizar Abono' }}</h3>
          <button class="close-modal" @click="closePaymentModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="client-info-modal">
            <div class="avatar">{{ getInitials(selectedLoan?.clienteNombre) }}</div>
            <div>
              <h4>{{ selectedLoan?.clienteNombre }}</h4>
              <p>Cédula: {{ selectedLoan?.Cedula }}</p>
              <p>Préstamo: ${{ formatCurrency(selectedLoan?.Valor_Prestamo) }}</p>
            </div>
          </div>
          
          <div class="payment-details">
            <div v-if="paymentType === 'full'" class="full-payment">
              <div class="detail-row">
                <span>Valor cuota:</span>
                <span>${{ formatCurrency(selectedLoan?.Cuota_Aproximada) }}</span>
              </div>
              <div class="detail-row">
                <span>Saldo pendiente:</span>
                <span>${{ formatCurrency(selectedLoan?.Saldo_Pendiente) }}</span>
              </div>
              <div class="detail-row">
                <span>Fecha pago:</span>
                <span>{{ new Date().toLocaleDateString('es-CO') }}</span>
              </div>
            </div>
            
            <div v-else class="partial-payment">
              <div class="form-group">
                <label for="payment-amount">Monto a abonar:</label>
                <div class="input-group">
                  <span class="input-prefix">$</span>
                  <input 
                    type="number" 
                    id="payment-amount" 
                    v-model.number="paymentAmount"
                    :max="selectedLoan?.Saldo_Pendiente"
                    min="1"
                    placeholder="Ingrese el monto"
                    @input="validatePaymentAmount"
                  >
                </div>
                <p class="hint">Saldo pendiente: ${{ formatCurrency(selectedLoan?.Saldo_Pendiente) }}</p>
              </div>
            </div>
            
            <div class="form-group">
              <label for="payment-method">Método de pago:</label>
              <select id="payment-method" v-model="paymentMethod" class="styled-select">
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Tarjeta">Tarjeta de crédito/débito</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            
            <div class="form-group" v-if="paymentMethod === 'Otro'">
              <label for="custom-method">Especificar método:</label>
              <input 
                type="text" 
                id="custom-method" 
                v-model="customPaymentMethod"
                placeholder="Ej: Nequi, Daviplata, etc."
                class="styled-input"
              >
            </div>
            
            <div class="form-group">
              <label for="payment-notes">Observaciones:</label>
              <textarea 
                id="payment-notes" 
                v-model="paymentNotes"
                placeholder="Notas adicionales sobre el pago..."
                class="styled-textarea"
              ></textarea>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="cancel-btn" @click="closePaymentModal" :disabled="processingPayment">
            Cancelar
          </button>
          <button 
            class="confirm-btn" 
            @click="processPayment"
            :disabled="processingPayment || (paymentType === 'partial' && (!paymentAmount || paymentAmount <= 0))"
          >
            <span v-if="!processingPayment">
              {{ paymentType === 'full' ? 'Confirmar Pago' : 'Confirmar Abono' }}
            </span>
            <span v-else>
              <i class="fas fa-spinner fa-spin"></i> Procesando...
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de historial de pagos -->
    <div v-if="showHistoryModal" class="history-modal-overlay">
      <div class="history-modal">
        <div class="modal-header">
          <h3>Historial de Pagos</h3>
          <button class="close-modal" @click="closeHistoryModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="client-info-modal">
            <div class="avatar">{{ getInitials(selectedLoan?.clienteNombre) }}</div>
            <div>
              <h4>{{ selectedLoan?.clienteNombre }}</h4>
              <p>Préstamo: ${{ formatCurrency(selectedLoan?.Valor_Prestamo) }}</p>
              <p>Saldo actual: ${{ formatCurrency(selectedLoan?.Saldo_Pendiente) }}</p>
            </div>
          </div>
          
          <div class="history-summary">
            <div class="summary-card">
              <div class="summary-icon">
                <i class="fas fa-money-bill-wave"></i>
              </div>
              <div>
                <p class="summary-label">Total Pagado</p>
                <p class="summary-value">${{ formatCurrency(totalPagado) }}</p>
              </div>
            </div>
            <div class="summary-card">
              <div class="summary-icon">
                <i class="fas fa-calendar-check"></i>
              </div>
              <div>
                <p class="summary-label">Pagos Realizados</p>
                <p class="summary-value">{{ historialPagos.length }}</p>
              </div>
            </div>
          </div>
          
          <div class="history-list-container">
            <div class="history-list-header">
              <h4>Detalle de Pagos</h4>
              <div class="search-history">
                <i class="fas fa-search"></i>
                <input 
                  type="text" 
                  v-model="historySearch" 
                  placeholder="Buscar en pagos..."
                >
              </div>
            </div>
            
            <div class="history-list">
              <div 
                v-for="pago in pagosFiltrados" 
                :key="pago.fecha" 
                class="payment-item"
                :class="{'last-payment': pago === historialPagos[0]}"
              >
                <div class="payment-date">
                  <div class="date-day">{{ formatDateDay(pago.fecha) }}</div>
                  <div class="date-month">{{ formatDateMonth(pago.fecha) }}</div>
                </div>
                
                <div class="payment-details">
                  <div class="payment-amount">
                    ${{ formatCurrency(pago.monto) }}
                    <span class="payment-type" :class="pago.tipo">
                      {{ pago.tipo === 'full' ? 'Cuota completa' : 'Abono' }}
                    </span>
                  </div>
                  <div class="payment-method">
                    <i class="fas" 
                      :class="{
                        'fa-money-bill-wave': pago.metodo === 'Efectivo',
                        'fa-exchange-alt': pago.metodo === 'Transferencia',
                        'fa-credit-card': pago.metodo === 'Tarjeta',
                        'fa-question-circle': !['Efectivo', 'Transferencia', 'Tarjeta'].includes(pago.metodo)
                      }"
                    ></i>
                    {{ pago.metodo }}
                  </div>
                </div>
                
                <div class="payment-notes" v-if="pago.notas">
                  <i class="fas fa-comment-alt"></i> {{ pago.notas }}
                </div>
              </div>
              
              <div v-if="pagosFiltrados.length === 0" class="empty-history">
                <i class="fas fa-file-invoice"></i>
                <p>No se encontraron pagos registrados</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="close-btn" @click="closeHistoryModal">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { db } from '@/firebase';
import { collection, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useToast } from 'vue-toastification';

export default {
  setup() {
    const toast = useToast();
    const prestamos = ref([]);
    const prestamosFiltrados = ref([]);
    const rutasDisponibles = ref([]);
    const rutaSeleccionada = ref('todas');
    const busqueda = ref('');
    const cargando = ref(true);

    // Variables para el modal de pago
    const showPaymentModal = ref(false);
    const selectedLoan = ref(null);
    const paymentType = ref('full');
    const paymentAmount = ref(0);
    const paymentMethod = ref('Efectivo');
    const customPaymentMethod = ref('');
    const paymentNotes = ref('');
    const processingPayment = ref(false);

    // Variables para el historial de pagos
    const showHistoryModal = ref(false);
    const historialPagos = ref([]);
    const historySearch = ref('');

    // Computed para pagos filtrados
    const pagosFiltrados = computed(() => {
      if (!historySearch.value) return historialPagos.value;
      
      const searchTerm = historySearch.value.toLowerCase();
      return historialPagos.value.filter(pago => 
        (pago.metodo && pago.metodo.toLowerCase().includes(searchTerm)) ||
        (pago.notas && pago.notas.toLowerCase().includes(searchTerm)) ||
        (pago.fecha && pago.fecha.toLowerCase().includes(searchTerm))
      );
    });
    
    // Computed para total pagado
    const totalPagado = computed(() => {
      return historialPagos.value.reduce((sum, pago) => sum + (pago.monto || 0), 0);
    });

    // Formatear moneda
    const formatCurrency = (value) => {
      if (value === undefined || value === null) return '0';
      return new Intl.NumberFormat('es-CO', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    };

    // Obtener iniciales del nombre
    const getInitials = (name) => {
      if (!name) return '?';
      return name.split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    };

    // Clase CSS según estado
    const getStatusClass = (status) => {
      if (!status) return '';
      const statusMap = {
        'Activo': 'status-active',
        'Pagado': 'status-paid',
        'Mora': 'status-overdue',
        'Cancelado': 'status-cancelled',
        'Atrasado': 'status-overdue'
      };
      return statusMap[status] || '';
    };

    // Formatear fecha (día)
    const formatDateDay = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.getDate();
    };

    // Formatear fecha (mes abreviado)
    const formatDateMonth = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleString('es-CO', { month: 'short' });
    };

    // Reiniciar filtros
    const resetFilters = () => {
      rutaSeleccionada.value = 'todas';
      busqueda.value = '';
      filtrarPrestamos();
    };

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
          (p.Cedula && p.Cedula.toString().includes(q))
        );
      }

      prestamosFiltrados.value = resultado;
    };

    // Validar monto de pago
    const validatePaymentAmount = () => {
      if (paymentType.value === 'partial' && selectedLoan.value) {
        if (paymentAmount.value > selectedLoan.value.Saldo_Pendiente) {
          paymentAmount.value = selectedLoan.value.Saldo_Pendiente;
        }
        if (paymentAmount.value < 0) {
          paymentAmount.value = 0;
        }
      }
    };

    // Abrir modal de pago
    const openPaymentModal = (prestamo, type) => {
      selectedLoan.value = prestamo;
      paymentType.value = type;
      paymentMethod.value = 'Efectivo';
      customPaymentMethod.value = '';
      paymentNotes.value = '';
      
      if (type === 'full') {
        paymentAmount.value = prestamo.Cuota_Aproximada;
      } else {
        paymentAmount.value = Math.min(100000, prestamo.Saldo_Pendiente);
      }
      
      showPaymentModal.value = true;
    };

    // Cerrar modal de pago
    const closePaymentModal = () => {
      if (!processingPayment.value) {
        showPaymentModal.value = false;
      }
    };

    // Abrir modal de historial
    const openHistoryModal = (prestamo) => {
      selectedLoan.value = prestamo;
      historialPagos.value = prestamo.pagos || [];
      showHistoryModal.value = true;
    };

    // Cerrar modal de historial
    const closeHistoryModal = () => {
      showHistoryModal.value = false;
      historySearch.value = '';
    };

    // Calcular próxima fecha de pago
    const calcularProximoPago = () => {
      const hoy = new Date();
      let proximaFecha = new Date(hoy);
      
      const frecuencia = selectedLoan.value?.Frecuencia_Pago || 'Mensual';
      
      switch(frecuencia) {
        case 'Diario':
          proximaFecha.setDate(hoy.getDate() + 1);
          break;
        case 'Semanal':
          proximaFecha.setDate(hoy.getDate() + 7);
          break;
        case 'Quincenal':
          proximaFecha.setDate(hoy.getDate() + 15);
          break;
        case 'Mensual':
        default:
          proximaFecha.setMonth(hoy.getMonth() + 1);
          break;
      }
      
      return proximaFecha.toISOString().split('T')[0];
    };

    // Procesar el pago
    const processPayment = async () => {
      processingPayment.value = true;
      
      try {
        const prestamoRef = doc(db, 'Prestamos', selectedLoan.value.id);
        const montoPago = parseFloat(paymentAmount.value);
        const nuevoSaldo = selectedLoan.value.Saldo_Pendiente - montoPago;
        
        const paymentData = {
          fecha: new Date().toISOString(),
          monto: montoPago,
          metodo: paymentMethod.value === 'Otro' ? customPaymentMethod.value : paymentMethod.value,
          tipo: paymentType.value,
          notas: paymentNotes.value,
          procesadoPor: 'UsuarioActual',
          saldoAnterior: selectedLoan.value.Saldo_Pendiente,
          saldoNuevo: nuevoSaldo
        };
        
        const updateData = {
          pagos: arrayUnion(paymentData),
          Saldo_Pendiente: nuevoSaldo,
          Ultimo_Pago: new Date().toISOString()
        };
        
        if (paymentType.value === 'full') {
          updateData.Estado = nuevoSaldo <= 0 ? 'Pagado' : 'Activo';
          updateData.Proximo_Pago = nuevoSaldo > 0 ? calcularProximoPago() : null;
        }
        
        await updateDoc(prestamoRef, updateData);
        
        toast.success(paymentType.value === 'full' ? 'Pago registrado exitosamente!' : 'Abono registrado exitosamente!', {
          timeout: 3000
        });
        
        closePaymentModal();
        await cargarPrestamos();
      } catch (error) {
        console.error('Error al procesar el pago:', error);
        toast.error('Ocurrió un error al procesar el pago. Por favor intente nuevamente.', {
          timeout: 3000
        });
      } finally {
        processingPayment.value = false;
      }
    };

    // Cargar los préstamos
    const cargarPrestamos = async () => {
      cargando.value = true;
      try {
        const prestamosRef = collection(db, 'Prestamos');
        const snapshot = await getDocs(prestamosRef);
        
        prestamos.value = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            Saldo_Pendiente: data.Saldo_Pendiente ?? data.Valor_Prestamo,
            Estado: data.Estado || 'Activo'
          };
        });

        const rutas = [...new Set(prestamos.value.map(p => p.Ruta).filter(Boolean))];
        rutasDisponibles.value = rutas.sort();

        filtrarPrestamos();
      } catch (error) {
        console.error('Error al cargar préstamos:', error);
        toast.error('Error al cargar los préstamos', {
          timeout: 3000
        });
      } finally {
        cargando.value = false;
      }
    };

    // Cargar datos iniciales
    onMounted(cargarPrestamos);

    return {
      prestamos,
      prestamosFiltrados,
      rutasDisponibles,
      rutaSeleccionada,
      busqueda,
      cargando,
      showPaymentModal,
      selectedLoan,
      paymentType,
      paymentAmount,
      paymentMethod,
      customPaymentMethod,
      paymentNotes,
      processingPayment,
      showHistoryModal,
      historialPagos,
      historySearch,
      pagosFiltrados,
      totalPagado,
      formatCurrency,
      getInitials,
      getStatusClass,
      formatDateDay,
      formatDateMonth,
      resetFilters,
      filtrarPrestamos,
      openPaymentModal,
      closePaymentModal,
      openHistoryModal,
      closeHistoryModal,
      processPayment,
      validatePaymentAmount
    };
  }
};
</script>

<style scoped>
/* Estilos base */
.ver-prestamos-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

/* Header */
.prestamos-header {
  margin-bottom: 30px;
}

.header-content {
  text-align: center;
  margin-bottom: 30px;
}

.title-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 10px;
}

.header-icon {
  font-size: 2.5rem;
  color: #4a6baf;
}

h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin: 0;
}

.subtitle {
  color: #7f8c8d;
  font-size: 1.1rem;
  margin: 0;
}

/* Filtros */
.filtros-container {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.filtros-card {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: space-between;
  align-items: flex-end;
}

.filter-group {
  flex: 1;
  min-width: 250px;
}

.filter-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.filter-icon {
  margin-right: 8px;
  color: #4a6baf;
}

.styled-select, .search-input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: white;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.styled-select:focus, .search-input:focus {
  outline: none;
  border-color: #4a6baf;
  box-shadow: 0 0 0 2px rgba(74, 107, 175, 0.2);
}

.search-group {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
}

.search-input {
  padding-left: 40px;
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
  border: 5px solid #f3f3f3;
  border-top: 5px solid #4a6baf;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  background-color: #f8f9fa;
  border-radius: 10px;
  margin: 30px 0;
}

.empty-illustration i {
  font-size: 4rem;
  color: #bdc3c7;
  margin-bottom: 20px;
}

.empty-state h3 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.empty-state p {
  color: #7f8c8d;
  margin-bottom: 20px;
}

.primary-btn {
  background-color: #4a6baf;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.primary-btn:hover {
  background-color: #3a5a9f;
}

.primary-btn i {
  font-size: 0.9rem;
}

/* Prestamos Grid */
.prestamos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.prestamo-card {
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  border-top: 4px solid #4a6baf;
  display: flex;
  flex-direction: column;
}

.prestamo-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

/* Status Colors */
.status-active {
  border-top-color: #2ecc71;
}

.status-paid {
  border-top-color: #3498db;
}

.status-overdue {
  border-top-color: #e74c3c;
}

.status-cancelled {
  border-top-color: #95a5a6;
}

/* Card Header */
.card-header {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.client-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  background-color: #4a6baf;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}

.client-info h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

.cedula {
  margin: 0;
  font-size: 0.85rem;
  color: #7f8c8d;
}

.ruta-badge {
  background-color: #e8f0fe;
  color: #4a6baf;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

.ruta-badge i {
  font-size: 0.7rem;
}

/* Card Body */
.card-body {
  padding: 15px;
  flex-grow: 1;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.detail-label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.detail-value {
  font-weight: 600;
  color: #2c3e50;
}

/* Card Footer */
.card-footer {
  padding: 12px 15px;
  background-color: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-indicator {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-active {
  background-color: #e8f8f0;
  color: #2ecc71;
}

.status-paid {
  background-color: #e8f4fc;
  color: #3498db;
}

.status-overdue {
  background-color: #fdedec;
  color: #e74c3c;
}

.status-cancelled {
  background-color: #f0f2f3;
  color: #95a5a6;
}

.next-payment {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.85rem;
  color: #7f8c8d;
}

.next-payment i {
  font-size: 0.8rem;
}

/* Card Actions */
.card-actions {
  display: flex;
  border-top: 1px solid #eee;
}

.action-btn {
  flex: 1;
  padding: 12px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 0.3s;
}

.action-btn i {
  font-size: 0.9rem;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn:not(:disabled):hover {
  background-color: #f8f9fa;
}

.history-btn {
  color: #7f8c8d;
  border-right: 1px solid #eee;
}

.history-btn:hover {
  color: #4a6baf;
}

.payment-buttons {
  display: flex;
  flex: 2;
}

.pay-full {
  color: #2ecc71;
  border-right: 1px solid #eee;
}

.pay-partial {
  color: #3498db;
}

/* Payment Modal */
.payment-modal-overlay, .history-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.payment-modal, .history-modal {
  background-color: white;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
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
s
.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #2c3e50;
}

.close-modal, .close-btn {
  background: none;
  border: none;
  color: #7f8c8d;
  font-size: 1.2rem;
  cursor: pointer;
  transition: color 0.2s;
}

.close-modal:hover, .close-btn:hover {
  color: #e74c3c;
}

.modal-body {
  padding: 20px;
}

.client-info-modal {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.client-info-modal .avatar {
  width: 45px;
  height: 45px;
  font-size: 1.1rem;
}

.client-info-modal h4 {
  margin: 0 0 5px 0;
  font-size: 1rem;
  color: #2c3e50;
}

.client-info-modal p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.95rem;
}

.payment-details .detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 0.98rem;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: #2c3e50;
  font-weight: 500;
}

.input-group {
  display: flex;
  align-items: center;
}

.input-prefix {
  background: #f0f2f3;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-right: none;
  border-radius: 6px 0 0 6px;
  color: #7f8c8d;
}

input[type="number"], .styled-input, .styled-select, .styled-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  background: #fff;
  transition: border-color 0.2s;
}

input[type="number"]:focus, .styled-input:focus, .styled-select:focus, .styled-textarea:focus {
  border-color: #4a6baf;
  outline: none;
}

.styled-textarea {
  min-height: 60px;
  resize: vertical;
}

.hint {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-top: 4px;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background: #fafbfc;
}

.cancel-btn, .close-btn {
  background: #f0f2f3;
  color: #7f8c8d;
  border: none;
  padding: 8px 18px;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.cancel-btn:hover, .close-btn:hover {
  background: #e74c3c;
  color: #fff;
}

.confirm-btn {
  background: #4a6baf;
  color: #fff;
  border: none;
  padding: 8px 18px;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.confirm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.confirm-btn:hover:not(:disabled) {
  background: #3a5a9f;
}

/* Historial de pagos */
.history-summary {
  display: flex;
  gap: 15px;
  margin-bottom: 18px;
}

.summary-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.summary-icon {
  font-size: 1.5rem;
  color: #4a6baf;
}

.summary-label {
  color: #7f8c8d;
  font-size: 0.95rem;
  margin: 0;
}

.summary-value {
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.history-list-container {
  margin-top: 10px;
}

.history-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.history-list-header h4 {
  margin: 0;
  font-size: 1rem;
  color: #2c3e50;
}

.search-history {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #f0f2f3;
  border-radius: 6px;
  padding: 4px 8px;
}

.search-history i {
  color: #7f8c8d;
}

.search-history input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.95rem;
  padding: 4px 0;
  width: 120px;
}

.history-list {
  max-height: 250px;
  overflow-y: auto;
  margin-top: 5px;
}

.payment-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 10px 0;
  border-bottom: 1px solid #f0f2f3;
  transition: background 0.2s;
}

.payment-item.last-payment {
  background: #e8f4fc;
}

.payment-date {
  text-align: center;
  min-width: 40px;
}

.date-day {
  font-size: 1.2rem;
  font-weight: 700;
  color: #4a6baf;
}

.date-month {
  font-size: 0.9rem;
  color: #7f8c8d;
  text-transform: capitalize;
}

.payment-details {
  flex: 1;
}

.payment-amount {
  font-size: 1.05rem;
  font-weight: 600;
  color: #2c3e50;
}

.payment-type {
  margin-left: 8px;
  font-size: 0.85rem;
  padding: 2px 8px;
  border-radius: 12px;
  background: #f0f2f3;
  color: #4a6baf;
}

.payment-type.full {
  background: #e8f8f0;
  color: #2ecc71;
}

.payment-type.partial {
  background: #e8f4fc;
  color: #3498db;
}

.payment-method {
  font-size: 0.95rem;
  color: #7f8c8d;
  display: flex;
  align-items: center;
  gap: 5px;
}

.payment-method i {
  font-size: 1rem;
}

.payment-notes {
  font-size: 0.92rem;
  color: #7f8c8d;
  margin-top: 3px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.empty-history {
  text-align: center;
  color: #bdc3c7;
  margin: 30px 0 10px 0;
}

.empty-history i {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

/* Responsive */
@media (max-width: 900px) {
  .prestamos-grid {
    grid-template-columns: 1fr;
  }
  .filtros-card {
    flex-direction: column;
    gap: 15px;
  }
  .history-summary {
    flex-direction: column;
    gap: 10px;
  }
}

@media (max-width: 600px) {
  .ver-prestamos-container {
    padding: 8px;
  }
  .prestamos-header {
    margin-bottom: 18px;
  }
  .prestamos-grid {
    gap: 10px;
  }
  .payment-modal, .history-modal {
    max-width: 98vw;
    padding: 0;
  }
  .modal-body, .modal-footer, .modal-header {
    padding-left: 10px;
    padding-right: 10px;
  }
}
</style>