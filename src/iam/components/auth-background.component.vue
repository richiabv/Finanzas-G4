<script>
export default {
  name: 'AuthBackground',

}
</script>

<template>
  <div class="auth-background"></div>
</template>

<style scoped>
.auth-background {
  background-image: url('@/assets/background-auth.jpg'); /* Usa tu ruta real */
  background-size: cover;
  background-position: center;
  height: 100%;
  width: 100%;
  border-top-left-radius: 1rem;
  border-bottom-left-radius: 1rem;
}
</style>
