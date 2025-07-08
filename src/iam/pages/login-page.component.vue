  <script >
  import LoginForm from "@/iam/components/login-form.component.vue";
  import AuthBackground from "@/iam/components/auth-background.component.vue";

  export default {
    name: 'LoginPage',
    components: {AuthBackground, LoginForm},

  }
  </script>

  <template>
    <div class="login-page">
      <div class="right-image">
          <login-form></login-form>
      </div>
      <div class="left-form">
        <auth-background></auth-background>
      </div>
    </div>
  </template>


  <style scoped>


  .login-page {
    display: flex;
    width: 100vw;
    height: 100vh;
    overflow: hidden  ;
  }


  .right-image {
    width: 50%;
    height: 100vh;
    overflow: hidden;
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
