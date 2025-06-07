<template>
  <div class="loan-container">
    <div class="loan-header">
      <h2><i class="fas fa-hand-holding-usd"></i> Nuevo Préstamo</h2>
      <p class="client-info">Cliente ID: {{ clienteId }}</p>
    </div>

    <div class="loan-form">
      <!-- Monto -->
      <div class="form-group">
        <label for="monto"><i class="fas fa-money-bill-wave"></i> Monto del préstamo</label>
        <div class="input-with-icon">
          <span class="currency">$</span>
          <input 
            id="monto"
            type="number" 
            v-model.number="prestamo.valorPrestamo" 
            placeholder="Ej: 1000000"
            min="0"
            @input="calcularTodo"
          >
        </div>
      </div>

      <!-- Plazo -->
      <div class="form-group">
        <label for="plazo"><i class="fas fa-calendar-alt"></i> Plazo de pago</label>
        <select 
          id="plazo"
          v-model="prestamo.plazoSeleccionado"
          @change="calcularTodo"
        >
          <option value="20">20 Días (20 cuotas diarias)</option>
          <option value="24">24 Días (24 cuotas diarias)</option>
          <option value="7">Semanal (4 cuotas)</option>
          <option value="15">Quincenal (2 cuotas)</option>
          <option value="30">Mensual (1 cuota)</option>
        </select>
      </div>

      <!-- Interés -->
      <div class="form-group">
        <label for="interes"><i class="fas fa-percentage"></i> Tasa de interés (%)</label>
        <div class="input-with-icon">
          <input 
            id="interes"
            type="number" 
            v-model.number="prestamo.interesFinal" 
            placeholder="Ej: 10"
            min="0"
            max="100"
            step="0.1"
            @input="calcularTodo"
          >
          <span class="percentage">%</span>
        </div>
      </div>

      <!-- Tipo de pago -->
      <div class="form-group">
        <label for="tipoPago"><i class="fas fa-calculator"></i> Tipo de pago</label>
        <select 
          id="tipoPago"
          v-model="prestamo.selectedTipoPago"
          @change="calcularTodo"
        >
          <option value="Libre">Libre</option>
          <option value="Interés + Capital">Interés + Capital</option>
        </select>
      </div>

      <!-- Resumen de cálculos -->
      <div class="calculation-summary">
        <h3><i class="fas fa-file-invoice-dollar"></i> Resumen del Préstamo</h3>
        
        <div class="summary-item">
          <span>Valor total a pagar:</span>
          <span class="amount">{{ calcularTotalPagar | currency }}</span>
        </div>
        
        <div class="summary-item">
          <span>Valor por cuota:</span>
          <span class="amount">{{ valorCuota | currency }}</span>
        </div>
        
        <div class="summary-item">
          <span>Número de cuotas:</span>
          <span>{{ numeroCuotas }}</span>
        </div>
        
        <div class="summary-item">
          <span>Interés total:</span>
          <span>{{ interesTotal | currency }}</span>
        </div>
        
        <div class="summary-item">
          <span>Fecha próximo pago:</span>
          <span>{{ proximoPago }}</span>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="form-actions">
        <button @click="cancelar" class="btn cancel">
          <i class="fas fa-times"></i> Cancelar
        </button>
        <button @click="guardarPrestamo" class="btn submit" :disabled="!formValido">
          <i class="fas fa-save"></i> Guardar Préstamo
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/firebase';  // Ajusta la ruta según dónde tengas firebase.js
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default {
  props: ['clienteId'],
  data() {
    return {
      prestamo: {
        valorPrestamo: 0,
        plazoSeleccionado: '20',
        interesFinal: 0,
        selectedTipoPago: 'Interés + Capital'
      },
      valorCuota: 0,
      interesTotal: 0,
      proximoPago: '',
      formValido: false
    };
  },
  computed: {
    calcularTotalPagar() {
      return this.prestamo.valorPrestamo + this.interesTotal;
    },
    numeroCuotas() {
      switch(this.prestamo.plazoSeleccionado) {
        case '7': return 4;   // Semanal
        case '15': return 2;  // Quincenal
        case '30': return 1;  // Mensual
        default: return parseInt(this.prestamo.plazoSeleccionado); // Diario
      }
    }
  },
  methods: {
    calcularTodo() {
      if (this.prestamo.valorPrestamo <= 0 || this.prestamo.interesFinal < 0) {
        this.resetValores();
        return;
      }

      this.interesTotal = this.prestamo.valorPrestamo * (this.prestamo.interesFinal / 100);

      if (this.prestamo.selectedTipoPago === 'Libre') {
        this.valorCuota = (this.prestamo.valorPrestamo * (this.prestamo.interesFinal / 100)) / this.numeroCuotas;
      } else if (this.prestamo.selectedTipoPago === 'Interés + Capital') {
        this.valorCuota = (this.prestamo.valorPrestamo + this.interesTotal) / this.numeroCuotas;
      }

      this.calcularProximoPago();
      this.formValido = true;
    },
    resetValores() {
      this.valorCuota = 0;
      this.interesTotal = 0;
      this.formValido = false;
    },
    calcularProximoPago() {
      const fecha = new Date();
      const plazoDias = parseInt(this.prestamo.plazoSeleccionado);
      fecha.setDate(fecha.getDate() + plazoDias);

      this.proximoPago = fecha.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    async guardarPrestamo() {
      if (!this.formValido) {
        alert('Formulario no válido.');
        return;
      }

      const prestamoData = {
        cliente_id: this.clienteId,
        valor_prestamo: this.prestamo.valorPrestamo,
        interes: this.prestamo.interesFinal,
        plazo: this.prestamo.plazoSeleccionado,
        tipo_pago: this.prestamo.selectedTipoPago,
        valor_cuota: parseFloat(this.valorCuota.toFixed(2)),
        total_pagar: this.calcularTotalPagar,
        interes_total: this.interesTotal,
        numero_cuotas: this.numeroCuotas,
        fecha: serverTimestamp(),
        proximo_pago: this.proximoPago,
        estado: 'pendiente'
      };

      try {
        const docRef = await addDoc(collection(db, 'Prestamos'), prestamoData);
        console.log('Préstamo guardado con ID:', docRef.id);
        this.$router.push('/');
        this.$notify({
          title: 'Éxito',
          text: 'Préstamo creado correctamente',
          type: 'success'
        });
      } catch (error) {
        console.error('Error al guardar préstamo en Firebase:', error);
        alert('Error al guardar el préstamo: ' + error.message);
      }
    },
    cancelar() {
      this.$router.push('/clientes');
    }
  },
  filters: {
    currency(value) {
      if (!value) return '$0';
      return '$' + value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }
  },
  mounted() {
    this.calcularTodo();
  }
};
</script>


<style scoped>
/* Estilos idénticos al anterior ejemplo */
.loan-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.loan-header {
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.loan-header h2 {
  margin: 0;
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.client-info {
  color: #7f8c8d;
  margin-top: 0.5rem;
}

.loan-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #34495e;
  display: flex;
  align-items: center;
  gap: 8px;
}

input, select {
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
}

input:focus, select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-icon .currency,
.input-with-icon .percentage {
  position: absolute;
  font-weight: bold;
  color: #7f8c8d;
}

.input-with-icon .currency {
  left: 12px;
}

.input-with-icon .percentage {
  right: 12px;
}

.input-with-icon input {
  padding-left: 30px;
  padding-right: 30px;
  width: 100%;
}

.calculation-summary {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 1.5rem;
  margin-top: 1rem;
}

.calculation-summary h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item .amount {
  font-weight: bold;
  color: #27ae60;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn.cancel {
  background: #f5f5f5;
  color: #7f8c8d;
  border: none;
}

.btn.cancel:hover {
  background: #e0e0e0;
}

.btn.submit {
  background: #27ae60;
  color: white;
  border: none;
}

.btn.submit:hover {
  background: #219955;
}

.btn.submit:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .loan-container {
    padding: 1.5rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>