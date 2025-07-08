<script>
import ToolBarComponent from '@/public/tool-bar-component.vue'
import BonoHeader from "@/cuentasclaras/components/bono-header.component.vue";

export default {
  name: 'ProfileBonoPage',
  components: {BonoHeader, ToolBarComponent},
  methods: {
    selectProfile(profile) {
      localStorage.setItem('selectedProfile', profile)
      this.$router.push({name: 'data-bonus'})
    }
  }
}
</script>

<template>
  <div class="bono-container">
  <tool-bar-component></tool-bar-component>
    <div class="bono-content">
      <bono-header :activeStep="0"></bono-header>

      <div class="bono-subtitle">
        <h2>1. Perfil financiero</h2>
        <p>Selecciona tu perfil financiero en el mercado de bonos</p>
      </div>

      <div class="perfil-options">
        <div class="perfil-card" @click="selectProfile('emisor')">
          <img src="@/assets/emisor.png" alt="Emisor" />
          <h3>Emisor</h3>
          <p>Entidad que vende el bono para obtener dinero</p>
        </div>
        <div class="perfil-card" @click="selectProfile('bonista')">
          <img src="@/assets/bonista.png" alt="Bonista" />
          <h3>Bonista</h3>
          <p>Inversionista que compra el bono y presta dinero</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bono-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #ffffff;
  font-family: 'Inter', sans-serif;
}

.bono-content {
  padding: 2rem 4rem;
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

.perfil-options {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.perfil-card {
  width: 240px;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  transition: box-shadow 0.3s;
  cursor: pointer;
}

.perfil-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.perfil-card img {
  width: 64px;
  height: 64px;
  object-fit: contain;
  margin-bottom: 1rem;
}

.perfil-card h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.perfil-card p {
  font-size: 13px;
  color: #555;
  margin-top: 0.25rem;
}
</style>
