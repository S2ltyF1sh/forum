<template>
  <div id="app">
    <!-- 导航栏 -->
    <header>
      <div class="logo">
        <i class="fas fa-comments"></i>
        <span>精弘论坛</span>
      </div>

      <div class="guide">
        <a href="#"
           :class="{ active: currentView === 'home' }"
           @click.prevent="changeView('home')">
          首页
        </a>
        <a href="#"
           :class="{ active: currentView === 'personal' }"
           @click.prevent="changeView('personal')">
          个人
        </a>
        <a href="#"
           :class="{ active: currentView === 'admin' }"
           @click.prevent="changeView('admin')"
           v-if="user_type === 2">
          管理
        </a>
        <!-- 添加反馈按钮 -->
        <a href="#"
           :class="{ active: currentView === 'feedback' }"
           @click.prevent="changeView('feedback')"
           v-if="isLogin">
          反馈
        </a>
      </div>

      <div class="user_actions">
        <div>
          <button class="btn btn_outline" @click="login_()" v-if="!isLogin">登录</button>
          <button class="btn btn_outline" v-if="isLogin">欢迎!{{ name }}</button>

          <button class="btn btn_inline" @click="login_()" v-if="!isLogin">注册</button>
          <button class="btn btn_inline" @click="logout_()" v-if="isLogin">退出登录</button>
        </div>
      </div>
    </header>
    <div class="main_">
      <div class="aside_container">
        <Aside />
      </div>
      <div class="main_container">
        <Post :currentView="currentView" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import Aside from '@/components/aside.vue';
  import { useStore } from 'vuex'
  import Post from '@/components/post.vue'
  import axios from 'axios';
  import { ref,computed } from 'vue';
  import { createRouter, RouterLink, useRoute, useRouter } from 'vue-router'

  const router = useRouter()
  const store = useStore()

  const isLogin = computed<boolean>(() => store.getters.isLogin)
  const name = computed(() => store.getters.name)
  const user_type = computed(() => store.getters.user_type)

  const currentView = ref('home')

  function test_(){
    console.log('用户是否登录:', isLogin.value)
    console.log('用户名', name.value)
    console.log('用户类型：', user_type.value)
  }

  function login_(){
    router.push('/login');
  }

  function logout_(){
    store.dispatch('logout')
  }

  function changeView(view: string) {
    currentView.value = view;
  }
</script>
<style scoped>
  * {
    box-sizing: border-box;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    
  }

  #app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  header {
    height: 60px;
    background-color: #ffffff;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    position: sticky;
    top: 0;
    z-index: 100;
    border-bottom: 1px solid #e0e0e0;
  }

  .logo {
    display: flex;
    align-items: center;
    font-weight: 700;
    font-size: 1.5rem;
    color: rgb(195, 49, 105);
  }

  .guide {
    display: flex;
    justify-content: center;
    flex-direction: row;
    min-width: 180px;
  }

  .guide a {
    margin: 10px;
    text-decoration: none;
    color: #54527d;
    font-weight: 500;
    transition: color 0.4s;
    padding: 5px 10px;
    border-radius: 4px;
  }

  .guide a:hover,
  .guide a.active {
    color: #96a5e9;
    background-color: #f0f2f5;
  }

  .user_actions {
    display: flex;
    align-items: center;
  }

  .btn {
    padding: 8px 16px;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
  }

  .btn_outline {
    background-color: transparent;
    border: 1px solid #96a5e9;
    color: #96a5e9;
    margin-right: 10px;
  }

  .btn_inline {
    background-color: #96a5e9;
    color: white;
    border: none;
  }

  .btn_outline:hover {
    background-color: #96a5e9;
    color: white;
  }

  .btn_inline:hover {
    background-color: #596392;
  }

  .main_{
    display: flex;
  }

</style>
