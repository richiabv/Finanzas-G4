<script>
import { defineStore } from 'pinia';
import ToolBarComponent from '@/public/tool-bar-component.vue'
import BonoHeader from "@/cuentasclaras/components/bono-header.component.vue"
import { useBonoStore } from '@/stores/bono';

export default {
  name: 'DatosBonoPage',
  components: {
    ToolBarComponent,
    BonoHeader
  },
  data() {

    return {
      touched: false,
      form: {
        moneda: '---',
        valorComercial: '',
        frecuencia: '---',
        tipoTasa: '---',
        tasaInteres: '',
        impuestoRenta: '',
        valorNominal: '',
        anios: '',
        dias: '---',
        capitalizacion: '---',
        tasaDescuento: '',
        fechaEmision: ''
      },
      options: {
        moneda: ['---', 'Soles', 'Dólares'],
        frecuencia: ['---', 'Mensual', 'Bimestral','Trimestral', 'Cuatrimestral', 'Semestral','Anual'],
        dias: ['---', '360', '365'],
        tipoTasa: ['---', 'Nominal', 'Efectiva'],
        capitalizacion: ['---', 'Diaria','Quincenal','Mensual','Bimestral', 'Trimestral','Cuatrimestral','Semestral', 'Anual']
      }
    }
  },
  methods: {
    isValid() {
      const fields = Object.values(this.form);
      return fields.every(f => f !== '' && f !== '---');
    },
    goToDataCost() {
      this.touched = true;
      if (this.isValid()) {
        const bonoStore = useBonoStore();
        bonoStore.guardarDatos(this.form);
        this.$router.push({ name: 'initial-expenses' });
      }
    }
  }
}
</script>

<template>
  <div class="bono-container">
    <ToolBarComponent />
    <div class="bono-content">
      <BonoHeader :activeStep="1" />

      <div class="bono-subtitle">
        <h2>2. Datos de bono</h2>
        <p>Ingresa la información del bono</p>
      </div>

      <form class="bono-form">
        <div class="form-col">
          <label>Tipo de moneda</label>
          <select v-model="form.moneda" :class="{ invalid: touched && form.moneda === '---' }">
            <option v-for="m in options.moneda" :key="m">{{ m }}</option>
          </select>
          <span v-if="touched && form.moneda === '---'" class="error-message">Selecciona una moneda</span>

          <label>Valor comercial</label>
          <input v-model="form.valorComercial" type="text" placeholder="Ej: 1,000.00"
                 :class="{ invalid: touched && form.valorComercial === '' }" />
          <span v-if="touched && form.valorComercial === ''" class="error-message">Este campo es obligatorio</span>

          <label>Frecuencia del cupón</label>
          <select v-model="form.frecuencia" :class="{ invalid: touched && form.frecuencia === '---' }">
            <option v-for="f in options.frecuencia" :key="f">{{ f }}</option>
          </select>
          <span v-if="touched && form.frecuencia === '---'" class="error-message">Selecciona una frecuencia</span>

          <label>Tipo de tasa de interés</label>
          <select v-model="form.tipoTasa" :class="{ invalid: touched && form.tipoTasa === '---' }">
            <option v-for="t in options.tipoTasa" :key="t">{{ t }}</option>
          </select>
          <span v-if="touched && form.tipoTasa === '---'" class="error-message">Selecciona el tipo de tasa</span>

          <label>Tasa de interés</label>
          <input v-model="form.tasaInteres" type="text" placeholder="Ej: 10.000%"
                 :class="{ invalid: touched && form.tasaInteres === '' }" />
          <span v-if="touched && form.tasaInteres === ''" class="error-message">Este campo es obligatorio</span>

          <label>Impuesto a la renta</label>
          <input v-model="form.impuestoRenta" type="text" placeholder="Ej: 30.000%"
                 :class="{ invalid: touched && form.impuestoRenta === '' }" />
          <span v-if="touched && form.impuestoRenta === ''" class="error-message">Este campo es obligatorio</span>
        </div>

        <div class="form-col">
          <label>Valor nominal</label>
          <input v-model="form.valorNominal" type="text" placeholder="Ej: 1,000.00"
                 :class="{ invalid: touched && form.valorNominal === '' }" />
          <span v-if="touched && form.valorNominal === ''" class="error-message">Este campo es obligatorio</span>

          <label>Nº de años</label>
          <input v-model="form.anios" type="text" placeholder="Ej: 5"
                 :class="{ invalid: touched && form.anios === '' }" />
          <span v-if="touched && form.anios === ''" class="error-message">Este campo es obligatorio</span>

          <label>Días por año</label>
          <select v-model="form.dias" :class="{ invalid: touched && form.dias === '---' }">
            <option v-for="d in options.dias" :key="d">{{ d }}</option>
          </select>
          <span v-if="touched && form.dias === '---'" class="error-message">Selecciona días por año</span>

          <label>Capitalización</label>
          <select v-model="form.capitalizacion" :class="{ invalid: touched && form.capitalizacion === '---' }">
            <option v-for="c in options.capitalizacion" :key="c">{{ c }}</option>
          </select>
          <span v-if="touched && form.capitalizacion === '---'" class="error-message">Selecciona capitalización</span>

          <label>Tasa anual de descuento</label>
          <input v-model="form.tasaDescuento" type="text" placeholder="Ej: 10.000%"
                 :class="{ invalid: touched && form.tasaDescuento === '' }" />
          <span v-if="touched && form.tasaDescuento === ''" class="error-message">Este campo es obligatorio</span>

          <label>Fecha de emisión</label>
          <input v-model="form.fechaEmision" type="date"
                 :class="{ invalid: touched && form.fechaEmision === '' }" />
          <span v-if="touched && form.fechaEmision === ''" class="error-message">Selecciona una fecha</span>
        </div>
      </form>

      <div class="form-button">
        <button class="continue-btn" @click.prevent="goToDataCost">Continuar</button>
      </div>
    </div>
  </div>
</template>


<style scoped>
.bono-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #ffffff;
  font-family: 'Inter', sans-serif;
  overflow-y: auto;

}

.bono-content {
  padding: 0.1rem 4rem;
}

.bono-subtitle {
  margin-bottom: 2rem;
  color: #1c1c1c;
}

.bono-subtitle h2 {
  font-size: 18px;
  color: #25617E;
}

.bono-subtitle p {
  font-size: 14px;
  margin-top: 0.25rem;
}

.bono-form {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.form-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

label {
  font-size: 14px;
  font-weight: 500;
}

input,
select {
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-family: 'Inter', sans-serif;
}

input[type="date"] {
  font-family: 'Inter', sans-serif;
}

.form-button {
  text-align: center;
}

.continue-btn {
  background-color: #365e73;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 5px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
}
.invalid {
  border: 1px solid red !important;
}

.error-message {
  color: red;
  font-size: 12px; /* más pequeño */
  margin-top: 2px; /* más cerca del input */
  margin-bottom: -0.5rem; /* ayuda a compactar el espacio */
  line-height: 1;
}

</style>
