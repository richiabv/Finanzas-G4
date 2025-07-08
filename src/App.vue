<script>

import {Notifications} from "@kyvg/vue3-notification";

export default {
  components: {Notifications}

}
</script>

<template>
  <router-view></router-view>
  <notifications position="top right" />

</template>

<style scoped>

</style>
