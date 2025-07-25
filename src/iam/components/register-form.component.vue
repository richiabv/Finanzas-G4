<template>
  <div class="login-form-container">
    <h1 class="logo">
      <span class="material-symbols-outlined logo-icon">account_balance</span>
      <span class="logo-text">CuentasClaras</span>
    </h1>

    <h2 class="form-title">Regístrate</h2>

    <form class="login-form" @submit.prevent="registerUser">
      <label for="email">Correo electrónico</label>
      <input id="email" v-model="email" type="email" placeholder="Ej: juan@mail.com" class="input-password" required />

      <label for="password">Contraseña</label>
      <div class="password-wrapper">
        <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            class="input-password"
            required
        />
        <span class="material-symbols-outlined toggle-password" @click="togglePassword">
          {{ showPassword ? 'visibility_off' : 'visibility' }}
        </span>
      </div>

      <button type="submit" class="submit-btn">Crear cuenta</button>
    </form>

    <p class="register-link">
      ¿Ya tienes cuenta?
      <a @click="goToLogin">Inicia sesión</a>
    </p>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase';
import { notify } from '@kyvg/vue3-notification';

const firebaseErrorMessages = {
  'auth/email-already-in-use': 'Este correo ya está registrado.',
  'auth/invalid-email': 'Correo inválido.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/network-request-failed': 'Problemas de red. Revisa tu conexión.',
};

function getFriendlyErrorMessage(error) {
  return firebaseErrorMessages[error.code] || 'Error inesperado. Intenta nuevamente.';
}

export default {
  name: 'RegisterForm',
  setup() {
    const email = ref('');
    const password = ref('');
    const showPassword = ref(false);
    const router = useRouter();

    const togglePassword = () => {
      showPassword.value = !showPassword.value;
    };

    const goToLogin = () => {
      router.push('/');
    };

    const registerUser = async () => {
      try {
        await createUserWithEmailAndPassword(auth, email.value, password.value);
        notify({
          title: 'Éxito',
          text: 'Cuenta creada correctamente',
          type: 'success',
          duration: 3000
        });
        router.push({ name: 'data-bonus' });
      } catch (error) {
        notify({
          title: 'Error',
          text: getFriendlyErrorMessage(error),
          type: 'error',
          duration: 4000
        });
      }
    };

    return {
      email,
      password,
      showPassword,
      togglePassword,
      registerUser,
      goToLogin
    };
  }
};
</script>

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

.form-title {
  font-size: 32px;
  font-weight: 500;
  margin-bottom: 1.5rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-password {
  width: 100%;
  padding: 0.5rem;
  padding-right: 2.5rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
}

.password-wrapper {
  position: relative;
}

.toggle-password {
  position: absolute;
  top: 50%;
  right: 0.75rem;
  transform: translateY(-50%);
  cursor: pointer;
  color: #666;
}

.submit-btn {
  background-color: #365e73;
  color: white;
  border: none;
  padding: 0.6rem;
  border-radius: 5px;
  cursor: pointer;
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
  cursor: pointer;
}
</style>
