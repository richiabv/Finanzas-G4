<script>
import ToolBarComponent from '@/public/tool-bar-component.vue'
import BonoHeader from "@/cuentasclaras/components/bono-header.component.vue"
import { useBonoStore } from '@/stores/bono'

export default {
  name: 'DataExpenses',
  components: { BonoHeader, ToolBarComponent },
  data() {
    return {
      profile: null,
      form: {
        prima: '',
        estructuracion: '',
        colocacion: '',
        flotacion: '',
        cavali: '',
      }
    }
  },
  mounted() {
    this.profile = localStorage.getItem('selectedProfile')
    if (!this.profile) {
      this.$router.push({ name: 'profile-bonus' })
    }
  },
  methods: {
    goToDataResult() {
      const bonoStore = useBonoStore()
      bonoStore.guardarCostes(this.form)
      this.$router.push({ name: 'bonus-result' })
    }
  }
}
</script>


<template>
  <div class="scrollable-page">
    <ToolBarComponent />
    <BonoHeader :activeStep="2" />

    <div class="bono-content">
      <div class="bono-subtitle">
        <h2>3. Datos de costes / gastos iniciales</h2>
        <p>Ingresa la información de los costes y gastos</p>
      </div>

      <form class="bono-form">
        <div class="form-row">
          <div class="form-field">
            <label>% Prima</label>
            <input
                v-model="form.prima"
                type="text"
                placeholder="Ej: 1.00"
            />
          </div>
          <div class="form-field">
            <label>% Estructuración</label>
            <input
                v-model="form.estructuracion"
                type="text"
                placeholder="Ej: 1.00"

            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label>% Colocación</label>
            <input
                v-model="form.colocacion"
                type="text"
                placeholder="Ej: 0.50"

            />
          </div>
          <div class="form-field">
            <label>% Flotación</label>
            <input
                v-model="form.flotacion"
                type="text"
                placeholder="Ej: 0.30"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label>% CAVALI</label>
            <input
                v-model="form.cavali"
                type="text"
                placeholder="Ej: 0.10"
            />
          </div>
          <div class="form-field hidden-field"></div>
        </div>
      </form>

      <div class="form-button">
        <button class="calculate-btn" @click="goToDataResult">Calcular bono</button>
      </div>
    </div>
  </div>
</template>


<style scoped>
.scrollable-page {
  height: 100vh;
  overflow-y: auto;
  background-color: #ffffff;
  font-family: 'Inter', sans-serif;
  padding-bottom: 2rem;
}

.bono-content {
  padding: 0 4rem;
  max-width: 960px;
  margin: 0 auto;
}

.bono-subtitle {
  margin-bottom: 2rem;
}

.bono-subtitle h2 {
  font-size: 18px;
  color: #25617E;
  margin-bottom: 0.2rem;
}

.bono-subtitle p {
  font-size: 14px;
  margin: 0;
}

.bono-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: flex;
  gap: 2rem;
}

.form-field {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.hidden-field {
  visibility: hidden;
}

label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

input {
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-family: 'Inter', sans-serif;
}

.form-button {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

.calculate-btn {
  background-color: #365e73;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 5px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
}
</style>
