<template>
  <header class="toolbar">
    <div class="toolbar-content">
      <button class="menu-btn" @click="showSidenav = !showSidenav">
        <span class="material-symbols-outlined">menu</span>
      </button>
      <span class="material-symbols-outlined logo-icon" @click="goToHome">account_balance</span>
      <span class="logo-text" @click="goToHome">CuentasClaras</span>
    </div>
  </header>

  <div v-if="showSidenav" class="sidenav">
    <ul>
      <li @click="goToMisCronogramas">📄 Mis cronogramas</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'ToolBarComponent',
  data() {
    return {
      showSidenav: false
    };
  },
  methods: {
    goToHome() {
      this.$router.push({ name: 'data-bonus' });
      this.showSidenav = false;
    },
    goToMisCronogramas() {
      this.$router.push({ name: 'schedule' });
      this.showSidenav = false;
    }
  }
};
</script>

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
  position: relative;
  z-index: 100;
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
  margin: 0 0.5rem;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
}

.menu-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: white;
  margin-right: 1rem;
}

.sidenav {
  position: absolute;
  top: 64px;
  left: 0;
  width: 200px;
  background-color: #ffffff;
  border: 1px solid #ccc;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  z-index: 999;
}

.sidenav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidenav li {
  padding: 10px;
  cursor: pointer;
  color: #25617E;
  font-weight: 500;
}

.sidenav li:hover {
  background-color: #f0f0f0;
}
</style>