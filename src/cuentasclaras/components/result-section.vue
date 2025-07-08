<script setup>
defineOptions({
  name: 'ResultSection',
})
defineProps({
  titulo: String,
  items: Array
})
</script>


<template>
  <div class="section">
    <h3 class="section-title">{{ titulo }}</h3>
    <div class="cards">
      <div v-for="(item, index) in items" :key="index" class="card">
        <small class="label">{{ item.label }}</small>
        <div class="value">{{ item.value }}</div>
      </div>
    </div>
  </div>
</template>


<style scoped>
.section {
  margin-top: 2rem;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #25617E;
  margin-bottom: 1rem;
}

.cards {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.card {
  flex: 1 1 180px;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  min-width: 180px;
  background-color: white;
}

.label {
  font-size: 12px;
  color: #555;
  font-weight: 500;
}

.value {
  font-size: 20px;
  font-weight: 600;
  margin-top: 0.25rem;
}
</style>
