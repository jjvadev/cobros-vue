<template>
  <div class="client-registration">
    <!-- Header con efecto de gradiente -->
    <header class="form-header">
      <div class="header-content">
        <i class="fas fa-user-plus header-icon"></i>
        <h1>Registro de Nuevo Cliente</h1>
        <p>Complete todos los campos requeridos</p>
      </div>
    </header>

    <!-- Contenedor principal del formulario -->
    <div class="form-container">
      <!-- Formulario en tarjeta con sombra -->
      <el-card class="form-card" shadow="hover">
        <el-form 
          :model="formData" 
          :rules="validationRules" 
          ref="formRef" 
          label-position="top"
          @submit.prevent="submitForm"
        >
          <!-- Sección 1: Información Básica -->
          <section class="form-section">
            <div class="section-header" @click="toggleSection('basic')">
              <h2>
                <i class="fas fa-id-card"></i> 
                Información Personal
                <i class="fas" :class="sectionVisibility.basic ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
              </h2>
            </div>
            
            <transition name="slide">
              <div v-show="sectionVisibility.basic" class="section-content">
                <div class="form-grid">
                  <el-form-item label="Cédula" prop="Cedula" class="animated-input">
                    <el-input 
                      v-model="formData.Cedula" 
                      placeholder="Ej: 100065433"
                    >
                      <template #prefix>
                        <i class="fas fa-id-card"></i>
                      </template>
                      <template #append>
                        <el-tooltip content="Cédula sin puntos ni guiones">
                          <i class="fas fa-info-circle"></i>
                        </el-tooltip>
                      </template>
                    </el-input>
                  </el-form-item>

                  <el-form-item label="Nombre Completo" prop="Nombre" class="animated-input">
                    <el-input 
                      v-model="formData.Nombre" 
                      placeholder="Ej: Juan Pérez"
                    >
                      <template #prefix>
                        <i class="fas fa-user"></i>
                      </template>
                    </el-input>
                  </el-form-item>

                  <el-form-item label="Celular" prop="Celular" class="animated-input">
                    <el-input 
                      v-model="formData.Celular" 
                      placeholder="Ej: 44567755"
                    >
                      <template #prefix>
                        <i class="fas fa-mobile-alt"></i>
                      </template>
                    </el-input>
                  </el-form-item>

                  <el-form-item label="Ciudad" prop="Ciudad" class="animated-input">
                    <el-input 
                      v-model="formData.Ciudad" 
                      placeholder="Ej: Pereira"
                    >
                      <template #prefix>
                        <i class="fas fa-city"></i>
                      </template>
                    </el-input>
                  </el-form-item>

                  <el-form-item label="Dirección" prop="Direccion" class="animated-input">
                    <el-input 
                      v-model="formData.Direccion" 
                      placeholder="Ej: cra34 55 56"
                    >
                      <template #prefix>
                        <i class="fas fa-map-marker-alt"></i>
                      </template>
                    </el-input>
                  </el-form-item>

                  <el-form-item label="Trabajo" prop="Trabajo" class="animated-input">
                    <el-input 
                      v-model="formData.Trabajo" 
                      placeholder="Ej: panaderia"
                    >
                      <template #prefix>
                        <i class="fas fa-briefcase"></i>
                      </template>
                    </el-input>
                  </el-form-item>
                </div>
              </div>
            </transition>
          </section>

          <!-- Sección 2: Referencias Familiares -->
          <section class="form-section">
            <div class="section-header" @click="toggleSection('references')">
              <h2>
                <i class="fas fa-users"></i> 
                Referencias Familiares
                <i class="fas" :class="sectionVisibility.references ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
              </h2>
            </div>
            
            <transition name="slide">
              <div v-show="sectionVisibility.references" class="section-content">
                <div class="form-grid">
                  <el-form-item label="Referencia Familiar 1" prop="ReferenciasFamiliares1" class="animated-input">
                    <el-input 
                      v-model="formData.ReferenciasFamiliares1" 
                      placeholder="Nombre y teléfono"
                    >
                      <template #prefix>
                        <i class="fas fa-user-friends"></i>
                      </template>
                    </el-input>
                  </el-form-item>

                  <el-form-item label="Referencia Familiar 2" prop="ReferenciasFamiliares2" class="animated-input">
                    <el-input 
                      v-model="formData.ReferenciasFamiliares2" 
                      placeholder="Nombre y teléfono"
                    >
                      <template #prefix>
                        <i class="fas fa-user-friends"></i>
                      </template>
                    </el-input>
                  </el-form-item>
                </div>
              </div>
            </transition>
          </section>

          <!-- Sección 3: Información del Fiador -->
          <section class="form-section">
            <div class="section-header" @click="toggleSection('guarantor')">
              <h2>
                <i class="fas fa-user-shield"></i> 
                Información del Fiador
                <i class="fas" :class="sectionVisibility.guarantor ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
              </h2>
            </div>
            
            <transition name="slide">
              <div v-show="sectionVisibility.guarantor" class="section-content">
                <div class="form-grid">
                  <el-form-item label="Nombre del Fiador" prop="NombreFiador" class="animated-input">
                    <el-input 
                      v-model="formData.NombreFiador" 
                      placeholder="Ej: loooes"
                    >
                      <template #prefix>
                        <i class="fas fa-user-tie"></i>
                      </template>
                    </el-input>
                  </el-form-item>

                  <el-form-item label="Celular del Fiador" prop="CelularFiador" class="animated-input">
                    <el-input 
                      v-model="formData.CelularFiador" 
                      placeholder="Ej: 34455666"
                    >
                      <template #prefix>
                        <i class="fas fa-phone-alt"></i>
                      </template>
                    </el-input>
                  </el-form-item>

                  <el-form-item label="Dirección del Fiador" prop="DireccionFiador" class="animated-input">
                    <el-input 
                      v-model="formData.DireccionFiador" 
                      placeholder="Ej: xdf"
                    >
                      <template #prefix>
                        <i class="fas fa-map-marked-alt"></i>
                      </template>
                    </el-input>
                  </el-form-item>

                  <el-form-item label="Trabajo del Fiador" prop="TrabajoFiador" class="animated-input">
                    <el-input 
                      v-model="formData.TrabajoFiador" 
                      placeholder="Ej: ffhyy"
                    >
                      <template #prefix>
                        <i class="fas fa-building"></i>
                      </template>
                    </el-input>
                  </el-form-item>

                  <el-form-item label="Referencia del Fiador 1" prop="ReferenciasFiador1" class="animated-input">
                    <el-input 
                      v-model="formData.ReferenciasFiador1" 
                      placeholder="Nombre y teléfono"
                    >
                      <template #prefix>
                        <i class="fas fa-address-book"></i>
                      </template>
                    </el-input>
                  </el-form-item>

                  <el-form-item label="Referencia del Fiador 2" prop="ReferenciasFiador2" class="animated-input">
                    <el-input 
                      v-model="formData.ReferenciasFiador2" 
                      placeholder="Nombre y teléfono"
                    >
                      <template #prefix>
                        <i class="fas fa-address-book"></i>
                      </template>
                    </el-input>
                  </el-form-item>
                </div>
              </div>
            </transition>
          </section>

          <!-- Sección 4: Ruta Asociada -->
          <section class="form-section">
            <div class="section-header" @click="toggleSection('route')">
              <h2>
                <i class="fas fa-route"></i> 
                Información de Ruta
                <i class="fas" :class="sectionVisibility.route ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
              </h2>
            </div>
            
            <transition name="slide">
              <div v-show="sectionVisibility.route" class="section-content">
                <div class="form-grid">
                  <el-form-item label="Ruta Asociada" prop="RutaSeleccionada" class="animated-input">
                    <el-select 
                      v-model="formData.RutaSeleccionada" 
                      placeholder="Seleccione una ruta"
                      filterable
                      clearable
                      class="custom-select"
                    >
                      <el-option
                        v-for="ruta in rutas"
                        :key="ruta.id"
                        :label="ruta.Nombre"
                        :value="ruta.Nombre"
                      />
                      <template #prefix>
                        <i class="fas fa-map-signs"></i>
                      </template>
                    </el-select>
                  </el-form-item>
                </div>
              </div>
            </transition>
          </section>

          <!-- Acciones del formulario -->
          <div class="form-actions">
            <el-button 
              type="primary" 
              @click="submitForm" 
              :loading="loading"
              class="submit-btn"
            >
              <i class="fas fa-save"></i> {{ loading ? 'Guardando...' : 'Guardar Cliente' }}
            </el-button>
            
            <el-button 
              @click="resetForm" 
              class="reset-btn"
            >
              <i class="fas fa-eraser"></i> Limpiar Formulario
            </el-button>
          </div>
        </el-form>
      </el-card>
    </div>

    <!-- Notificación flotante -->
    <transition name="fade">
      <div v-if="showSuccess" class="success-notification">
        <i class="fas fa-check-circle"></i>
        <span>Cliente registrado exitosamente!</span>
      </div>
    </transition>
  </div>
</template>

<script>
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/firebase';

export default {
  name: 'ClientRegistration',
  data() {
    return {
      formData: {
        Cedula: '',
        Celular: '',
        CelularFiador: '',
        Ciudad: '',
        Direccion: '',
        DireccionFiador: '',
        Nombre: '',
        NombreFiador: '',
        ReferenciasFamiliares1: '',
        ReferenciasFamiliares2: '',
        ReferenciasFiador1: '',
        ReferenciasFiador2: '',
        RutaSeleccionada: '',
        Trabajo: '',
        TrabajoFiador: ''
      },
      rutas: [],
      loading: false,
      showSuccess: false,
      sectionVisibility: {
        basic: true,
        references: true,
        guarantor: true,
        route: true
      },
      validationRules: {
        Cedula: [
          { required: true, message: 'La cédula es requerida', trigger: 'blur' },
          { pattern: /^\d{6,12}$/, message: 'Cédula inválida (6-12 dígitos)', trigger: 'blur' }
        ],
        Nombre: [
          { required: true, message: 'El nombre es requerido', trigger: 'blur' },
          { min: 3, message: 'Mínimo 3 caracteres', trigger: 'blur' }
        ],
        Celular: [
          { required: true, message: 'El celular es requerido', trigger: 'blur' },
          { pattern: /^\d{8,15}$/, message: 'Celular inválido', trigger: 'blur' }
        ],
        Ciudad: [
          { required: true, message: 'La ciudad es requerida', trigger: 'blur' }
        ],
        Direccion: [
          { required: true, message: 'La dirección es requerida', trigger: 'blur' }
        ],
        RutaSeleccionada: [
          { required: true, message: 'La ruta es requerida', trigger: 'change' }
        ]
      }
    };
  },
  async mounted() {
    await this.loadRoutes();
  },
  methods: {
    toggleSection(section) {
      this.sectionVisibility[section] = !this.sectionVisibility[section];
    },
    async loadRoutes() {
      try {
        const rutasRef = collection(db, 'Rutas');
        const querySnapshot = await getDocs(rutasRef);
        this.rutas = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
      } catch (error) {
        console.error('Error cargando rutas:', error);
        this.$message.error('Error al cargar las rutas disponibles');
      }
    },
    async submitForm() {
      try {
        await this.$refs.formRef.validate();
        
        this.loading = true;
        
        await addDoc(collection(db, 'Clientes'), {
          ...this.formData,
          fechaRegistro: new Date(),
          estado: 'activo'
        });
        this.$message.success('Cliente registrado exitosamente');

        // Redirigir al inicio después de 1.5 segundos
        setTimeout(() => {
          this.$router.push('/');
        }, 1500);

        
        this.showSuccess = true;
        setTimeout(() => {
          this.showSuccess = false;
        }, 3000);
        
        this.resetForm();
        
      } catch (error) {
        console.error('Error al registrar cliente:', error);
        if (error.code !== 'VALIDATE_ERROR') {
          this.$message.error('Error al registrar el cliente');
        }
      } finally {
        this.loading = false;
      }
    },
    resetForm() {
      this.$refs.formRef.resetFields();
    }
  }
};
</script>

<style scoped>
.client-registration {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.form-header {
  background: linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%);
  color: white;
  padding: 2rem 1rem;
  text-align: center;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
}

.header-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.9);
}

.form-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
}

.form-header p {
  margin: 0.5rem 0 0;
  opacity: 0.9;
  font-size: 1rem;
}

.form-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem 2rem;
}

.form-card {
  border-radius: 12px;
  overflow: hidden;
  border: none;
}

.form-section {
  margin-bottom: 1.5rem;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.section-header {
  padding: 1rem 1.5rem;
  background-color: #f8f9fa;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e9ecef;
}

.section-header h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #4361ee;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-content {
  padding: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.animated-input :deep(.el-input__wrapper) {
  transition: all 0.3s ease;
  box-shadow: 0 0 0 1px #dcdfe6;
}

.animated-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc;
}

.animated-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #4361ee !important;
}

.custom-select :deep(.el-select__wrapper) {
  padding-left: 35px;
}

.custom-select :deep(.el-select__prefix) {
  left: 10px;
  color: #c0c4cc;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.submit-btn {
  background-color: #4361ee;
  border-color: #4361ee;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  background-color: #364fc7;
  transform: translateY(-2px);
}

.reset-btn {
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  transform: translateY(-2px);
}

.success-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background-color: #4bb543;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.success-notification i {
  font-size: 1.2rem;
}

/* Transiciones */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  max-height: 1000px;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
  padding: 0 1.5rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .submit-btn, .reset-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .form-header h1 {
    font-size: 1.5rem;
  }
  
  .section-header h2 {
    font-size: 1rem;
  }
  
  .section-content {
    padding: 1rem;
  }
}
</style>