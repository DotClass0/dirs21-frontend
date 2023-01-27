<template>
  <div id="app" class="m-auto">
    <Menu></Menu>
  </div>
</template>

<script>
import Menu from "@/components/menu/Menu";

export default {
  name: "App",
  components: { Menu },
  created() {
    this.$store.dispatch('fetchDishes')
  }
}
</script>

<style lang="scss">
@import '~bootstrap/scss/bootstrap.scss';
@import '~bootstrap-vue/dist/bootstrap-vue.css';

#app {
  width: 90%;
  max-width: 900px;
}
</style>
