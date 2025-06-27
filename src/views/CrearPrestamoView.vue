<template>
  <div class="crear-prestamo-container">
    <header class="prestamo-header">
      <h1>
        <i class="fas fa-hand-holding-usd"></i> Nuevo Préstamo
      </h1>
      <div class="cliente-info">
        <h3>{{ nombreCliente }}</h3>
        <p><i class="fas fa-route"></i> {{ rutaCliente }}</p>
      </div>
    </header>

    <div class="prestamo-form">
      <div class="form-section">
        <h2><i class="fas fa-calculator"></i> Datos del Préstamo</h2>
        
        <div class="form-group">
          <label for="valorPrestamo">Valor del Préstamo ($):</label>
          <input 
            type="number" 
            id="valorPrestamo" 
            v-model.number="prestamo.valorPrestamo" 
            @input="calcularTodo"
            min="0"
          >
        </div>

        <div class="form-group">
          <label for="interes">Tasa de Interés (%):</label>
          <input 
            type="number" 
            id="interes" 
            v-model.number="prestamo.interesFinal" 
            @input="calcularTodo"
            min="0"
            max="100"
            step="0.1"
          >
        </div>

        <div class="form-group">
          <label for="tipoPago">Tipo de Pago:</label>
          <select 
            id="tipoPago" 
            v-model="prestamo.selectedTipoPago" 
            @change="calcularTodo"
          >
            <option value="Libre">Solo Interés (Libre)</option>
            <option value="Interés + Capital">Interés + Capital</option>
          </select>
        </div>

        <div class="form-group">
          <label for="plazo">Plazo:</label>
          <select 
            id="plazo" 
            v-model="prestamo.plazo" 
            @change="calcularTodo"
          >
            <option value="Mensual">Mensual (1 cuota)</option>
            <option value="Semanal">Semanal (4 cuotas)</option>
            <option value="Quincenal">Quincenal (2 cuotas)</option>
            <option value="20 Dias">20 Dias (20 cuotas)</option>
            <option value="24 Dias">24 Dias (24 cuotas)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Número de Cuotas:</label>
          <input 
            type="text" 
            :value="numeroCuotas" 
            readonly
          >
        </div>

        <div class="form-group">
          <label>Fecha de Inicio:</label>
          <input 
            type="date" 
            v-model="prestamo.fechaInicio"
            @change="calcularProximoPago"
          >
        </div>
      </div>

      <div class="resultados-section">
        <h2><i class="fas fa-chart-bar"></i> Resumen del Préstamo</h2>
        
        <div class="resultados-grid">
          <div class="resultado-card">
            <div class="resultado-label">Valor del Préstamo</div>
            <div class="resultado-valor">$ {{ formatCurrency(prestamo.valorPrestamo) }}</div>
          </div>

          <div class="resultado-card">
            <div class="resultado-label">Interés Total</div>
            <div class="resultado-valor">$ {{ formatCurrency(interesTotal) }}</div>
          </div>

          <div class="resultado-card">
            <div class="resultado-label">Valor por Cuota</div>
            <div class="resultado-valor">$ {{ formatCurrency(valorCuota) }}</div>
          </div>

          <div class="resultado-card">
            <div class="resultado-label">Total a Pagar</div>
            <div class="resultado-valor">$ {{ formatCurrency(totalPagar) }}</div>
          </div>

          <div class="resultado-card">
            <div class="resultado-label">Próximo Pago</div>
            <div class="resultado-valor">{{ proximoPago || 'No calculado' }}</div>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn-cancelar" @click="cancelar">
            <i class="fas fa-times"></i> Cancelar
          </button>
          <button 
            class="btn-guardar" 
            @click="guardarPrestamo"
            :disabled="!formValido"
          >
            <i class="fas fa-save"></i> Guardar Préstamo
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { db } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';

const router = useRouter();
const route = useRoute();

// Datos del cliente
const id = route.params.id;
const nombreCliente = route.query.nombreCliente || route.query.nombreCliente || 'Cliente';
const rutaCliente = route.query.rutaCliente || 'Sin ruta';
const cedulaCliente = route.query.cedula || '';

// Datos del préstamo
const prestamo = ref({
  valorPrestamo: 0,
  interesFinal: 0,
  selectedTipoPago: 'Libre',
  plazo: 'Mensual',
  fechaInicio: new Date().toISOString().substr(0, 10)
});

// Variables calculadas
const interesTotal = ref(0);
const valorCuota = ref(0);
const totalPagar = ref(0);
const proximoPago = ref('');
const formValido = ref(false);

// Calcular número de cuotas basado en el plazo
const numeroCuotas = computed(() => {
  switch(prestamo.value.plazo) {
    case 'Mensual': return 1;
    case 'Semanal': return 4;
    case 'Quincenal': return 2;
    case '20 Dias': return 20;
    case '24 Dias': return 24;
    default: return 1;
  }
});

// Formatear moneda
const formatCurrency = (value) => {
  if (!value) return '0';
  return new Intl.NumberFormat('es-CO', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Calcular todos los valores
const calcularTodo = () => {
  if (prestamo.value.valorPrestamo <= 0 || prestamo.value.interesFinal < 0) {
    resetValores();
    return;
  }

  interesTotal.value = prestamo.value.valorPrestamo * (prestamo.value.interesFinal / 100);

  if (prestamo.value.selectedTipoPago === 'Libre') {
    valorCuota.value = interesTotal.value / numeroCuotas.value;
    totalPagar.value = interesTotal.value;
  } else if (prestamo.value.selectedTipoPago === 'Interés + Capital') {
    valorCuota.value = (prestamo.value.valorPrestamo + interesTotal.value) / numeroCuotas.value;
    totalPagar.value = prestamo.value.valorPrestamo + interesTotal.value;
  }

  calcularProximoPago();
  formValido.value = true;
};

// Calcular próxima fecha de pago
const calcularProximoPago = () => {
  if (!prestamo.value.fechaInicio) return;
  
  const fecha = new Date(prestamo.value.fechaInicio);
  
  switch(prestamo.value.plazo) {
    case 'Mensual':
      fecha.setMonth(fecha.getMonth() + 1);
      break;
    case 'Semanal':
      fecha.setDate(fecha.getDate() + 7);
      break;
    case 'Quincenal':
      fecha.setDate(fecha.getDate() + 15);
      break;
    case '20 Dias':
      fecha.setDate(fecha.getDate() + 20);
      break;
    case '24 Dias':
      fecha.setDate(fecha.getDate() + 24);
      break;
  }
  
  proximoPago.value = fecha.toLocaleDateString('es-CO');
};

// Resetear valores
const resetValores = () => {
  interesTotal.value = 0;
  valorCuota.value = 0;
  totalPagar.value = 0;
  proximoPago.value = '';
  formValido.value = false;
};

function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO);
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
  const anio = fecha.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

const fechaFormateada = formatearFecha(prestamo.value.fechaInicio);

const guardarPrestamo = async () => {
  if (!id) {
    alert('No se encontró el ID del cliente. No se puede guardar el préstamo.');
    return;
  }

  try {
    const prestamoData = {
      clienteId: id, // Aquí está el cambio
      clienteNombre: nombreCliente,
      Cedula: cedulaCliente,
      Ruta: rutaCliente,
      Valor_Prestamo: prestamo.value.valorPrestamo,
      Prestamo_Inicial: prestamo.value.valorPrestamo,
      Interes: prestamo.value.interesFinal,
      Metodo_Pago: prestamo.value.selectedTipoPago,
      plazo: prestamo.value.plazo,
      cuotas: numeroCuotas.value,
      valorCuota: valorCuota.value,
      ValorTotal: totalPagar.value,
      fechaInicio: formatearFecha(prestamo.value.fechaInicio),
      Proximo_Pago: proximoPago.value,
      Estado: 'Activo',
    };

    const docRef = await addDoc(collection(db, 'Prestamos'), prestamoData);
    if (!navigator.onLine) {
      alert('Estás sin conexión. El préstamo se guardará localmente y se sincronizará cuando vuelvas a estar en línea.');
    } 
    alert('¡Préstamo guardado exitosamente! ID: ' + docRef.id);
    router.push(`/`);
  } catch (error) {
    alert('Error al guardar el préstamo: ' + error.message);
    console.error('Error al guardar el préstamo:', error);
  }
};

// Cancelar y volver
const cancelar = () => {
  router.push(`/clientes/${id}`);
};

// Calcular al montar el componente si hay valores iniciales
onMounted(() => {
  if (prestamo.value.valorPrestamo > 0 && prestamo.value.interesFinal > 0) {
    calcularTodo();
  }
});
</script>

<style scoped>
.crear-prestamo-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.prestamo-header {
  background: linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%);
  border-radius: 12px;
  padding: 20px;
  color: white;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.prestamo-header h1 {
  margin: 0;
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.cliente-info {
  text-align: right;
}

.cliente-info h3 {
  margin: 0;
  font-size: 1.2rem;
}

.cliente-info p {
  margin: 5px 0 0 0;
  opacity: 0.9;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
}

.prestamo-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.form-section, .resultados-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.form-section h2, .resultados-section h2 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 1.3rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus, .form-group select:focus {
  outline: none;
  border-color: #4361ee;
}

.resultados-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 25px;
}

.resultado-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  border-left: 4px solid #4361ee;
}

.resultado-label {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 5px;
}

.resultado-valor {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 20px;
}

.btn-cancelar, .btn-guardar {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-cancelar {
  background: #f8f9fa;
  color: #555;
  border: 1px solid #ddd;
}

.btn-cancelar:hover {
  background: #e9ecef;
}

.btn-guardar {
  background: #4361ee;
  color: white;
  border: none;
}

.btn-guardar:hover {
  background: #3a0ca3;
}

.btn-guardar:disabled {
  background: #ccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .prestamo-form {
    grid-template-columns: 1fr;
  }
  
  .prestamo-header {
    flex-direction: column;
    text-align: center;
  }
  
  .cliente-info {
    text-align: center;
  }
  
  .resultados-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn-cancelar, .btn-guardar {
    width: 100%;
    justify-content: center;
  }
}
</style>