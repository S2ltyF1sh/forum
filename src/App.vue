<template>
  <RouterView></RouterView>
</template>

<script lang="ts">
import router from './router';

  export default {
    name: 'App'
  }
</script>

<style>
/* 全局样式 */
body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  background-color: #f5f5f5;
}
</style>