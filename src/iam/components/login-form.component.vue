<script>
import { ref } from 'vue'

export default {
  name: 'LoginForm',

  setup() {
    const showPassword = ref(false)

    const togglePassword = () => {
      showPassword.value = !showPassword.value
    }

    return {
      showPassword,
      togglePassword
    }
  },
  methods: {
    goToDataBonus() {
      this.$router.push({name: 'data-bonus'});
    }
  }
}
</script>

<template>
  <div class="login-form-container">
    <h1 class="logo">
      <span class="material-symbols-outlined logo-icon">account_balance</span>
      <span class="logo-text">CuentasClaras</span>
    </h1>

    <h2 class="form-title">Inicia sesión</h2>

    <form class="login-form" @submit.prevent="goToDataBonus">
      <label for="email">Correo electrónico</label>
      <input id="email" type="email" placeholder="example@email.com" class="input-password" />

      <label for="password">Contraseña</label>
      <div class="password-wrapper">
        <input
            id="password"
            :type="showPassword ? 'text' : 'password'"
            class="input-password"
        />
        <span
            class="material-symbols-outlined toggle-password"
            @click="togglePassword"
        >
    {{ showPassword ? 'visibility_off' : 'visibility' }}
  </span>
      </div>

      <div class="form-options">
        <label>
          <input type="checkbox" />
          Recuérdame
        </label>
        <a  class="link">¿Olvidé mi contraseña?</a>
      </div>

      <button  type="submit" class="submit-btn">Ingresa</button>
    </form>

    <div class="divider-with-text">
      <span>o</span>
    </div>
    <div class="social-login">
      <button class="google-btn">
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
        Inicia sesión con Google
      </button>
      <button class="apple-btn">
        <img src="@/assets/apple.svg" alt="Apple" />
      </button>
    </div>
    <div class="separator-line"></div>

    <p class="register-link">
      ¿No tiene cuenta?
      <a >Regístrate</a>
    </p>
  </div>
</template>



<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter&display=swap');

.login-form-container {
  font-family: 'Inter', sans-serif;
  width: 100%;
  max-width: 400px;
  margin: auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 90vh;
}

.logo {
  display: flex;
  align-items: center;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.logo-icon {
  margin-right: 0.5rem;
}

.logo-text {
  font-size: 32px;
  font-weight: 700;
}

.material-symbols-outlined {
  font-variation-settings:
      'FILL' 0,
      'wght' 400,
      'GRAD' 0,
      'opsz' 24;
  font-size: 24px;
  user-select: none;
}

.form-title {
  font-size: 32px;
  font-weight: 500;
  margin-bottom: 1.5rem;
  margin-top: 0.5rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.login-form label {
  font-size: 16px;
  font-weight: 400;
  margin-bottom: 0.25rem;
  display: block;
}

.password-wrapper {
  position: relative;
  width: 100%;
}

.input-password {
  width: 100%;
  padding: 0.5rem;
  padding-right: 2.5rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
}

.toggle-password {
  position: absolute;
  top: 50%;
  right: 0.75rem;
  transform: translateY(-50%);
  cursor: pointer;
  color: #666;
  font-size: 24px;
}


.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.submit-btn {
  background-color: #365e73;
  color: white;
  border: none;
  padding: 0.6rem;
  border-radius: 5px;
  cursor: pointer;
}

.separator-line {
  height: 1px;
  background-color: #e0e0e0;
  margin: 2rem 0 1rem;
  width: 100%;
}

.divider-with-text {
  display: flex;
  align-items: center;
  text-align: center;
  color: #999;
  font-size: 14px;
  margin: 1rem 0 1.25rem;
}
.divider-with-text::before,
.divider-with-text::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e0e0e0;
  margin: 0 0.75rem;
}

.social-login {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}
.google-btn {
  flex-grow: 1;
  padding: 0.6rem 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  height: 48px;
}


.apple-btn {
  width: 48px;
  height: 48px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.google-btn img,
.apple-btn img {
  width: 20px;
  height: 20px;
}

.register-link {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #25617E;

}

.register-link a {
  color: #25617E;
  text-decoration: none;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
}


.link {
  color: #365e73;
  text-decoration: none;
}
</style>
