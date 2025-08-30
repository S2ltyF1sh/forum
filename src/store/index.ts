import { createStore } from 'vuex'

// 新增：定义Report接口
interface Report {
  id: string;
  postId: string;
  username: string;
  reason: string;
  date: string;
}

export default createStore({
  state: {
    user: null,
    posts: [],
    // 新增：举报记录
    reports: JSON.parse(localStorage.getItem('forumReports')) || []
  },
  mutations: {
    SET_USER(state, user: string) {
      state.user = user
    },
    CLEAR_USER(state) {
      state.user = null
    },
    // 帖子相关mutations
    SET_POSTS(state, posts) {
      state.posts = posts
      localStorage.setItem('forumPosts', JSON.stringify(posts))
    },
    ADD_POST(state, post) {
      state.posts.push(post)
      localStorage.setItem('forumPosts', JSON.stringify(state.posts))
    },
    UPDATE_POST(state, updatedPost) {
      const index = state.posts.findIndex(p => p.id === updatedPost.id)
      if (index !== -1) {
        state.posts[index] = { ...state.posts[index], ...updatedPost }
        localStorage.setItem('forumPosts', JSON.stringify(state.posts))
      }
    },
    DELETE_POST(state, postId) {
      state.posts = state.posts.filter(post => post.id !== postId)
      localStorage.setItem('forumPosts', JSON.stringify(state.posts))
    },
    LIKE_POST(state, postId) {
      const post = state.posts.find(p => p.id === postId)
      if (post) {
        post.likes = (post.likes || 0) + 1
        localStorage.setItem('forumPosts', JSON.stringify(state.posts))
      }
    },
    // 新增：举报相关mutations
    ADD_REPORT(state, report: Report) {
      state.reports.push(report)
      localStorage.setItem('forumReports', JSON.stringify(state.reports))
    },
    REMOVE_REPORT(state, reportId: string) {
      state.reports = state.reports.filter(report => report.id !== reportId)
      localStorage.setItem('forumReports', JSON.stringify(state.reports))
    }
  },
  actions: {
    login({ commit }, user) {
      return new Promise((resolve) => {
        setTimeout(() => {
          commit('SET_USER', user)
          resolve()
        }, 100)
      })
    },
    logout({ commit }) {
      commit('CLEAR_USER')
    },
    // 帖子相关actions
    addPost({ commit }, post) {
      commit('ADD_POST', post)
    },
    updatePost({ commit }, updatedPost) {
      commit('UPDATE_POST', updatedPost)
    },
    deletePost({ commit }, postId) {
      commit('DELETE_POST', postId)
    },
    likePost({ commit }, postId) {
      commit('LIKE_POST', postId)
    },
    // 新增：举报相关actions
    addReport({ commit }, reportData) {
      const report: Report = {
        id: Date.now().toString(),
        postId: reportData.postId,
        username: reportData.username,
        reason: reportData.reason,
        date: new Date().toISOString()
      }
      commit('ADD_REPORT', report)
    },
    removeReport({ commit }, reportId) {
      commit('REMOVE_REPORT', reportId)
    }
  },
  getters: {
    isAuthenticated: state => !!state.user,
    getUser: state => state.user,
    isLogin: state => !!state.user,
    name: state => state.user?.name || '匿名用户',
    // 获取帖子
    getPosts: state => state.posts,
    // 新增：获取举报记录
    getReports: state => state.reports,
    // 新增：获取特定帖子的举报记录
    getReportsForPost: state => (postId: string) => {
      return state.reports.filter(report => report.postId === postId)
    },
    // 新增：获取举报数量
    getReportCount: state => (postId: string) => {
      return state.reports.filter(report => report.postId === postId).length
    }
  }
})
