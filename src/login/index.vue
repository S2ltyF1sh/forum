<template>
  <div>
    <!-- 登录块 -->
    <div class="login_" v-if="!isLogin">
      <!-- 登录详细块 -->
      <div class="login_container" v-if="loginSuccess">
        <form class="login_form">
          <h1>登陆成功</h1>
          <h1>请稍等...</h1>
        </form>
      </div>
      <div class="login_container" v-if="reg_log_toggle === 'formA' && !loginSuccess">
        <form class="login_form">
          <h1>欢迎登录</h1>
          <form class="login_info">
            <p><span class="label_">用户名：</span><input type="text" placeholder="请输入用户名" v-model="userName" class="input_label"></p>
            <p><span class="label_">密码：</span><input type="password" placeholder="请输入密码" v-model="passWord" class="input_label"></p>
          </form>
          <form class="reg_log">
            <p><button @click="toggleForm()" class="button_">切换到注册</button></p>
            <p><button type="button" @click="login()" class="button_">登录</button></p>
          </form>
        </form>
      </div>

      <!-- 注册详细块 -->
      <div class="login_container" v-else-if="reg_log_toggle === 'formB' && !loginSuccess">
        <form class="login_form">
          <h1>注册账号</h1>
          <form class="login_info">
            <p><span class="label_">用户名：</span><input type="text" placeholder="请输入用户名" v-model="userName" class="input_label"></p>
            <p><span class="label_">姓名：</span><input type="text" placeholder="请输入姓名" v-model="name" class="input_label"></p>
            <p><span class="label_">密码：</span><input type="password" placeholder="请输入密码" v-model="passWord" class="input_label"></p>
            <p><span class="label_">用户类型：</span>普通用户<input type="radio" v-model="userType" name="usertype" value=1>管理员<input type="radio" v-model="userType" name="usertype" value=2></p>

          </form>
          <form class="reg_log">
            <p><button @click="toggleForm()" class="button_">切换到登录</button></p>
            <p><button type="button" @click="registion()" class="button_">注册</button></p>
          </form>
        </form>
      </div>
    </div>
    <div v-else >
    </div>
  </div>
</template>


<script setup lang="ts">
  import { useLoginLogic } from './index'

  const {
    userName,
    passWord,
    name,
    reg_log_toggle,
    loginSuccess,
    isLogin,
    userType,
    toggleForm,
    login,
    registion
  } = useLoginLogic()
</script>

<style scoped>
@import './index.css';
</style>
