<script setup>
defineOptions({
  name: 'BonoHeader'
})

defineProps({
  activeStep: {
    type: Number,
    required: true
  },
  steps: {
    type: Array,
    default: () => [ 'Datos de bono', 'Datos de costes/gastos iniciales']
  }
})
</script>




<template>
  <div class="bono-header">
    <h1 class="bono-title">Calcula tu bono</h1>

    <div class="bono-stepper">
      <div
          v-for="(step, index) in steps"
          :key="index"
          class="step"
          :class="{ active: index === activeStep, completed: index < activeStep }"
      >
        <span class="step-number">{{ String(index + 1).padStart(2, '0') }}</span>
        <span class="step-label">{{ step }}</span>
      </div>
    </div>
  </div>
</template>


<style scoped>

.bono-header {
  padding: 0.01rem 4rem 2rem 4rem;
  font-family: 'Inter', sans-serif;

}

.bono-title {
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.bono-stepper {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  gap: 1px;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
}

.step {
  flex: 1;
  text-align: center;
  padding: 1rem;
  background-color: #f9f9f9;
  border-right: 1px solid #ccc;
}

.step:last-child {
  border-right: none;
}

.step.active {
  background-color: #ffffff;
  border-bottom: 3px solid #25617E;
}

.step.completed {
  background-color: #e6f4ea;
}

.step-number {
  display: block;
  font-weight: bold;
  color: #25617E;
}

.step-label {
  font-size: 14px;
}
</style>
