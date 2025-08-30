<template>
  <div>
    <!-- 登录块 -->
    <div class="login_" v-if="!isLogin">
      <button class="button_" @click="view_()">首页</button>
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
            <p><button @click="login()" class="button_">登录</button></p>
          </form>
        </form>
      </div>

      <!-- 注册详细块 -->
      <div class="login_container" v-else-if="reg_log_toggle === 'formB' && !loginSuccess">
        <form class="login_form">
          <h1>注册账号</h1>
          <form class="login_info">
            <p><span class="label_">用户名：</span><input type="text" placeholder="请输入用户名" v-model="userName" class="input_label"></p>
            <p><span class="label_">邮箱账号：</span><input type="text" placeholder="请输入邮箱" v-model="mailBox" class="input_label"></p>
            <p><span class="label_">密码：</span><input type="password" placeholder="请输入密码" v-model="passWord" class="input_label"></p>
          </form>
          <form class="reg_log">
            <p><button @click="toggleForm()" class="button_">切换到登录</button></p>
            <p><button type="submit" @click="registion()" class="button_">注册</button></p>
          </form>
        </form>
      </div>
    </div>
    <div v-else > 
    </div>
  </div> 
</template>


<script lang="ts" setup>
  import axios from 'axios';
  import { ref,watch } from 'vue';
  import { useStore } from 'vuex'
  import { createRouter, RouterLink, useRoute, useRouter } from 'vue-router'
  const router = useRouter()
  const store = useStore()
  const route = useRoute()

  let userName=ref()
  let passWord=ref()
  let mailBox=ref()
  let reg_log_toggle=ref('formA')
  let loginSuccess=ref(false)
  let isLogin=ref(false)

  const url ="http://127.0.0.1:4523/m1/7007008-6725558-default"
  
  watch(() => route.path, (newPath) => {
    if (newPath === '/login') {
      // 重置登录状态
      isLogin.value = false
      loginSuccess.value = false
      userName.value = ''
      passWord.value = ''
      reg_log_toggle.value = 'formA'
    }
  }, { immediate: true })
  function toggleForm(this: any) {
      this.reg_log_toggle = this.reg_log_toggle === 'formA' ? 'formB' : 'formA';
  } 
  function view_(){
    if (true) {
      router.push('/');
    }
  }
  function login(){
    const target = "/api/user/login"
    const body ={
      username: userName.value,
      password: passWord.value,
    }
    
    axios.post(url+target,body)
    .then(Response=>{
      console.log(Response)
    })

    if (userName.value === 'user' && passWord.value === '123') {
      loginSuccess.value = true;
      setTimeout(() => {
        isLogin.value = true;       
        store.dispatch('login', {
          name: userName.value})
          .then(() => {
            router.push('/');
          })
        }, 1500);
    }

    if (userName.value === 'admin' && passWord.value === '123') {
      loginSuccess.value = true;
      setTimeout(() => {
        isLogin.value = true;       
        store.dispatch('login', {
          name: userName.value})
          .then(() => {
            router.push('/');
          })
        }, 1500);
    }
  }

  function registion(){

  }
</script>

<style scoped>
  .login_{
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    
    
    background: url("..\img\illust_122910410_20250306_005156(1).jpg");
    width: 820px;
    min-height: 430px;
    background-color: #e3e5e7;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 10px;
    
  }
  .login_container{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
    /* background-color: aqua;     */
    width: 400px;
    height: 250px;
    animation: fadeIn 0.7s;
  }
  .login_container h1{
    color: #96a5e9;
  }
  .login_info{
    display: flex;
    justify-content: center;
    flex-direction: column;

    place-items: center;
    width: 300px;
    min-height: 90px;
    border: 2px solid #e3e5e7;
    border-radius: 8px;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    color: #212121;
  }

  .reg_log{
    display: flex;
    justify-content: center;

    width: 304px;
  }
  .login_container h1{
    display: grid;
    place-items: center;
    height: min-content;
    text-align: center; 
  }
  .button_:hover{
    background: #b3d3fa;
    color: rgb(54, 107, 180);
  }
  .button_{
    display: grid;
    place-items: center;

    width: 130px;
    height: 40px;
    margin: 0px 20px;
    border: 2px solid #e3e5e7;
    border-radius: 8px;
    background-color: #c9dce2;
    font-size: large;
    transition:0.3s;
    font-weight: 600;
    color: rgb(92, 159, 253);
    font-family: 'Segoe UI';
  }
  input:focus {
    border-color: #6c5ce7;
    outline: none;
  }
  .input_label{
    border: 2px solid #e4f7ff;
    width: 180px;
    height: 30px;
    border-radius: 5px;
    padding: 7px;
    transition: border 0.3s;
  }
  .label_ {
    display: inline-block;
    width: 80px;
    text-align: right;
    margin-right: 5px;
    font-size: 15px;
  }
  .fade-enter-from, .fade-leave-to {
    opacity: 0;
    transform: translateY(20px);
  }
  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.5s, transform 0.5s;
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
</style>
