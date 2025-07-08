<template>
  <div class="login-page">
    <div class="right-image">
      <register-form />
    </div>
    <div class="left-form">
      <auth-background />
    </div>
  </div>
</template>

<script>
import RegisterForm from "@/iam/components/register-form.component.vue";
import AuthBackground from "@/iam/components/auth-background.component.vue";

export default {
  name: 'RegisterPage',
  components: { AuthBackground, RegisterForm }
};
</script>

<style scoped>
.login-page {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
.right-image {
  width: 50%;
  height: 100vh;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
}
.left-form {
  width: 50%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
}
</style>
