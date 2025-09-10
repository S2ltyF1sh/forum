import { ref, watch } from 'vue';
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios';

export function useLoginLogic() {
  const router = useRouter()
  const store = useStore()
  const route = useRoute()

  const userName = ref('')
  const passWord = ref('')
  const name = ref('')
  const reg_log_toggle = ref('formA')
  const loginSuccess = ref(false)
  const isLogin = ref(false)
  const userType = ref(1)

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

  const toggleForm = () => {
    reg_log_toggle.value = reg_log_toggle.value === 'formA' ? 'formB' : 'formA';
  }

  const login = () => {
    const target = "/api/user/login"
    const body = {
      username: userName.value,
      password: passWord.value,
    }

    axios.post(target, body)
      .then(response => {
        console.log("完整响应对象:", response);
        const responseData = {
          code: response.data.code,
          user_type: response.data.data.user_type,
          user_id: response.data.data.user_id
        };

        if (responseData.code === 200) {
          loginSuccess.value = true;
          setTimeout(() => {
            isLogin.value = true;
            store.dispatch('login', {
              name: userName.value,
              user_id: responseData.user_id,
              user_type: responseData.user_type
            })
            .then(() => {
              router.push('/');
            })
          }, 1500)
        }
      })
      .catch(error => {
        console.error("登录错误:", error);
        alert('登录时发生错误');
      });
  }

  const registion = () => {
    console.log(userType)
    const target = "/api/user/reg"
    const body = {
      username: userName.value,
      name: name.value,
      password: passWord.value,
      user_type: Number(userType.value)
    }

    axios.post(target, body)
      .then(response => {
        console.log("完整响应对象:", response);
        const responseData = {
          code: response.data.code,
        };
        if (responseData.code === 200) {
          alert('注册成功');
          // 注册成功后切换到登录表单
          toggleForm();
        } else {
          alert('注册失败: ' + response.data.msg);
        }
      })
      .catch(error => {
        console.error("注册错误:", error);
        alert('注册时发生错误');
      });
  }

  return {
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
  }
}
