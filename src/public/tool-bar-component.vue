<script >
export default {
  name: 'ToolBarComponent',
  methods: {
    goToHome() {
      this.$router.push({name: 'data-bonus'});
    }
  }
}
</script>

<template>

  <header class="toolbar">
    <div class="toolbar-content" @click="goToHome">
      <span class="material-symbols-outlined logo-icon">account_balance</span>
      <span class="logo-text">CuentasClaras</span>
    </div>
  </header>
</template>



<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');

.toolbar {
  background-color: #25617E;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  height: 64px;
  width: 100%;
  box-sizing: border-box;
}

.toolbar-content {
  display: flex;
  align-items: center;
  color: white;
  font-family: 'Inter', sans-serif;
  cursor: pointer;

}

.logo-icon {
  font-variation-settings:
      'FILL' 0,
      'wght' 400,
      'GRAD' 0,
      'opsz' 24;
  font-size: 28px;
  margin-right: 0.5rem;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
}
</style>
