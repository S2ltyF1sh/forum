import useStore from 'vuex'
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router'

export function ts() {
  const router = useRouter()
  const store = useStore()

  const isLogin = computed<boolean>(() => store.getters.isLogin)
  const name = computed(() => store.getters.name)
  const user_type = computed(() => store.getters.user_type)

  const currentView = ref('home')

  function login_(){
    router.push('/login');
  }

  function logout_(){
    store.dispatch('logout')
  }

  function changeView(view: string) {
    currentView.value = view;
  }

  return {
    isLogin,
    name,
    user_type,
    currentView,
    login_,
    logout_,
    changeView
  }
}
