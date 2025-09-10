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
        <!-- 可以更具currentView的状态细化Post页面，将components/Post细化为各个组块 -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import Aside from '@/components/leftAside.vue';
  import Post from '@/components/mainPost.vue'
  import { ts } from './index';

  const {
    isLogin,
    name,
    user_type,
    currentView,
    login_,
    logout_,
    changeView
  } = ts();
</script>
<style scoped>
@import './index.css';
</style>
