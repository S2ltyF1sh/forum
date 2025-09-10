import createStore from 'vuex'

interface Report {
  id: string;
  postId: string;
  username: string;
  reason: string;
  date: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  likes: number;
}

interface User {
  user_id?: number;
  user_type?: number;
  name?: string;
}

interface State {
  user: User | null;
  posts: Post[];
  reports: Report[];
}

export default createStore<State>({
  state: {
    user: null,
    posts: [],
    reports: JSON.parse(localStorage.getItem('forumReports') || '[]')
  },
  // 帖子相关mutations
  mutations: {
    SET_POST_LIKES(state:State, payload: { postId: string; likes: number }) {
      const post = state.posts.find(p => p.id === payload.postId);
      if (post) {
      post.likes = payload.likes;
      localStorage.setItem('forumPosts', JSON.stringify(state.posts));
      }
    },
    SET_USER(state:State, user: User) {
      state.user = user
    },
    CLEAR_USER(state:State) {
      state.user = null
    },
    SET_POSTS(state:State, posts: Post[]) {
      state.posts = posts
      localStorage.setItem('forumPosts', JSON.stringify(posts))
    },
    ADD_POST(state:State, post: Post) {
      state.posts.push(post)
      localStorage.setItem('forumPosts', JSON.stringify(state.posts))
    },
    UPDATE_POST(state:State, updatedPost: Post) {
      const index = state.posts.findIndex(p => p.id === updatedPost.id)
      if (index !== -1) {
        state.posts[index] = { ...state.posts[index], ...updatedPost }
        localStorage.setItem('forumPosts', JSON.stringify(state.posts))
      }
    },
    DELETE_POST(state:State, postId: string) {
      state.posts = state.posts.filter(post => post.id !== postId)
      localStorage.setItem('forumPosts', JSON.stringify(state.posts))
    },
    LIKE_POST(state:State, postId: string) {
      const post = state.posts.find(p => p.id === postId)
      if (post) {
        post.likes = (post.likes || 0) + 1
        localStorage.setItem('forumPosts', JSON.stringify(state.posts))
      }
    },
    CLEAR_POSTS(state:State) {
      state.posts = []
      localStorage.setItem('forumPosts', JSON.stringify(state.posts))
    },
    //举报相关mutations
    ADD_REPORT(state:State, report: Report) {
      state.reports.push(report)
      localStorage.setItem('forumReports', JSON.stringify(state.reports))
    },
    REMOVE_REPORT(state:State, reportId: string) {
      state.reports = state.reports.filter(report => report.id !== reportId)
      localStorage.setItem('forumReports', JSON.stringify(state.reports))
    }
  },
  actions: {
    login({ commit }, user: User) {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          commit('SET_USER', user);
          resolve();
        }, 100);
      });
    },
    logout({ commit }) {
      commit('CLEAR_USER');
    },
    setPostLikes({ commit }, payload: { postId: string; likes: number }) {
      commit('SET_POST_LIKES', payload);
    },
    // 帖子相关actions
    addPost({ commit }, post: Post) {
      commit('ADD_POST', post);
    },
    updatePost({ commit }, updatedPost: Post) {
      commit('UPDATE_POST', updatedPost);
    },
    deletePost({ commit }, postId: string) {
      commit('DELETE_POST', postId);
    },
    likePost({ commit }, postId: string) {
      commit('LIKE_POST', postId);
    },
    // 添加 clearPosts action
    clearPosts({ commit }) {
      commit('CLEAR_POSTS')
    },
    //举报相关actions
   addReport({ commit }, reportData: { postId: string; username: string; reason: string }) {
      const report: Report = {
        id: Date.now().toString(),
        postId: reportData.postId,
        username: reportData.username,
        reason: reportData.reason,
        date: new Date().toISOString()
      };
      commit('ADD_REPORT', report);
    },
    removeReport({ commit }, reportId: string) {
      commit('REMOVE_REPORT', reportId);
    }
  },
  getters: {
    isAuthenticated: (state:State) => !!state.user,
    getUser: (state:State) => state.user,
    isLogin: (state:State) => !!state.user,
    name: (state:State) => state.user?.name || '匿名用户',
    // 获取帖子
    getPosts: (state:State) => state.posts,
    //获取举报记录
    getReports: (state:State) => state.reports,
    //获取特定帖子的举报记录
    getReportsForPost: (state:State) => (postId: string) => {
      return state.reports.filter(report => report.postId === postId)
    },
    //获取举报数量
    getReportCount: (state:State) => (postId: string) => {
      return state.reports.filter(report => report.postId === postId).length
    },
    user_id: (state:State) => state.user?.user_id || 0,
    user_type: (state:State) => state.user?.user_type || 1,
  }
})
