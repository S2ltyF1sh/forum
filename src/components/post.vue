<template>
  <div class="main_container">
    <!-- 帖子头部 -->
    <div class="post-header">
      <h2>{{ headerTitle }}</h2>
      <button class="new-post-btn" @click="showModal('add')" v-if="currentView === 'personal'">
        <i class="fas fa-plus"></i> 发新帖
      </button>
    </div>
    
    <!-- 举报管理视图 -->
    <div class="admin-view" v-if="currentView === 'admin' && isAdmin">
      <h3>举报管理</h3>
      <div class="reports-list">
        <div v-if="reports.length === 0" class="empty-reports">
          暂无举报记录
        </div>
        <div v-for="report in reports" :key="report.id" class="report-item">
          <div class="report-info">
            <div class="report-meta">
              <span class="report-id">举报ID: {{ report.id }}</span>
              <span class="report-date">{{ formatDate(report.date) }}</span>
            </div>
            <div class="report-details">
              <p><strong>帖子ID:</strong> {{ report.postId }}</p>
              <p><strong>举报人:</strong> {{ report.username }}</p>
              <p><strong>举报原因:</strong> {{ report.reason }}</p>
            </div>
          </div>
          <div class="report-actions">
            <button class="btn btn-danger" @click="removeReport(report.id)">
              删除举报
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 帖子容器 -->
    <div class="posts-container" v-if="currentView !== 'admin'">
      <!-- 空状态 -->
      <div class="empty-state" v-if="posts.length === 0">
        <i class="fas fa-file-alt"></i>
        <p>暂无帖子，点击"发新帖"创建第一篇帖子</p>
      </div>
      
      <!-- 帖子列表 - 首页视图 -->
      <template v-if="currentView === 'home'">
        <div v-for="post in sortedPosts" :key="post.id" class="post guest-view">
          <div class="post-header-info">
            <h3 class="post-title">{{ post.title }}</h3>
            <div class="post-meta">
              <span>{{ formatDate(post.date) }}</span>
              <span>作者: {{ post.author }}</span>
              <span class="likes-count">
                <i class="fas fa-heart"></i> {{ post.likes || 0 }}
              </span>
              <!-- 举报计数 -->
              <span class="reports-count" v-if="getReportCount(post.id) > 0 && isAdmin">
                <i class="fas fa-flag"></i> {{ getReportCount(post.id) }}
              </span>
            </div>
          </div>
          <div class="post-content">
            {{ post.content }}
          </div>
          <div class="post-actions">
            <button class="post-action-btn like-btn" @click="likePost(post.id)">
              <i class="fas fa-heart"></i> 点赞
            </button>
            <button class="post-action-btn report-btn" @click="showReportModal(post.id)">
              <i class="fas fa-flag"></i> 举报
            </button>
          </div>
        </div>
      </template>
      
      <!-- 帖子列表 - 个人视图 -->
      <template v-else-if="currentView === 'personal'">
        <div v-for="post in sortedPosts" :key="post.id" class="post personal-view">
          <div class="post-header-info">
            <h3 class="post-title">{{ post.title }}</h3>
            <div class="post-meta">
              <span>{{ formatDate(post.date) }}</span>
              <span>作者: {{ post.author }}</span>
              <span class="likes-count">
                <i class="fas fa-heart"></i> {{ post.likes || 0 }}
              </span>
              <!-- 举报计数 -->
              <span class="reports-count" v-if="getReportCount(post.id) > 0 && isAdmin">
                <i class="fas fa-flag"></i> {{ getReportCount(post.id) }}
              </span>
            </div>
          </div>
          <div class="post-content">
            {{ post.content }}
          </div>
          <div class="post-actions">
            <button class="post-action-btn edit-btn" @click="editPost(post.id)" v-if="post.author === currentUserName || currentUserName === 'admin'">
              <i class="fas fa-edit"></i> 编辑
            </button>
            <button class="post-action-btn delete-btn" @click="deletePost(post.id)" v-if="post.author === currentUserName || currentUserName === 'admin'" >
              <i class="fas fa-trash"></i> 删除
            </button>
            <button class="post-action-btn like-btn" @click="likePost(post.id)">
              <i class="fas fa-heart"></i> 点赞
            </button>
            <button class="post-action-btn report-btn" @click="showReportModal(post.id)">
              <i class="fas fa-flag"></i> 举报
            </button>
          </div>
        </div>
      </template>
    </div>
    
    <!-- 添加/编辑帖子modal -->
    <div class="modal" v-show="modalVisible">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">{{ isEditing ? '编辑帖子' : '添加新帖子' }}</h3>
          <button class="close-btn" @click="hideModal">&times;</button>
        </div>
        <div class="form-group">
          <label for="postTitle">标题</label>
          <input type="text" class="form-control" v-model="currentPost.title" placeholder="请输入帖子标题">
        </div>
        <div class="form-group">
          <label for="postContent">内容</label>
          <textarea class="form-control" v-model="currentPost.content" placeholder="请输入帖子内容"></textarea>
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="hideModal">取消</button>
          <button class="save-btn" @click="savePost">保存</button>
        </div>
      </div>
    </div>
    
    <!-- 举报modal -->
    <div class="modal" v-show="reportModalVisible">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">举报帖子</h3>
          <button class="close-btn" @click="hideReportModal">&times;</button>
        </div>
        <div class="form-group">
          <label>举报原因</label>
          <select class="form-control" v-model="reportReason">
            <option value="">请选择举报原因</option>
            <option value="广告或垃圾内容">广告或垃圾内容</option>
            <option value="骚扰或人身攻击">骚扰或人身攻击</option>
            <option value="不实信息">不实信息</option>
            <option value="侵犯隐私">侵犯隐私</option>
            <option value="其他">其他</option>
          </select>
        </div>
        <div class="form-group" v-if="reportReason === '其他'">
          <label>详细说明</label>
          <textarea class="form-control" v-model="customReportReason" placeholder="请详细说明举报原因"></textarea>
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="hideReportModal">取消</button>
          <button class="save-btn" @click="submitReport">提交举报</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, computed, onMounted, defineProps } from 'vue'
  import { useStore } from 'vuex'
  
  //接收父组件传递的当前视图状态
  const props = defineProps({
    currentView: {
      type: String,
      default: 'home'
    }
  })
  
  const store = useStore()

  const posts = computed(() => store.state.posts || [])
  const modalVisible = ref(false)
  const isEditing = ref(false)

  const reportModalVisible = ref(false)
  const reportReason = ref('')
  const customReportReason = ref('')
  const currentReportPostId = ref('')
  
  const currentPost = reactive({
    id: null,
    title: '',
    content: '',
    author: '',
    date: null,
    likes: 0
  })

  const currentUserName = computed(() => {
    const user = store.getters.getUser
    return user ? user.name : '匿名用户'
  })

  const isAdmin = computed(() => {
    return currentUserName.value === 'admin' 
  })

  const reports = computed(() => store.getters.getReports)

  const headerTitle = computed(() => {
    switch (props.currentView) {
      case 'home': return '全部帖子'
      case 'personal': return '我的帖子'
      case 'admin': return '举报管理'
      default: return '全部帖子'
    }
  })
  
  const sortedPosts = computed(() => {
    return [...posts.value].sort((a, b) => new Date(b.date) - new Date(a.date))
  })

  const likePost = (id) => {
    store.dispatch('likePost', id)
  }

  const showReportModal = (postId) => {
    if (!store.getters.isLogin) {
      alert('请先登录再举报')
      return
    }
    
    currentReportPostId.value = postId
    reportReason.value = ''
    customReportReason.value = ''
    reportModalVisible.value = true
  }

  const hideReportModal = () => {
    reportModalVisible.value = false
  }

  const submitReport = () => {
    if (!reportReason.value) {
      alert('请选择举报原因')
      return
    }
    
    let reason = reportReason.value
    if (reason === '其他' && customReportReason.value) {
      reason = customReportReason.value
    }
    
    store.dispatch('addReport', {
      postId: currentReportPostId.value,
      username: currentUserName.value,
      reason: reason
    })
    
    alert('举报已提交，感谢您的反馈！')
    hideReportModal()
  }

  const removeReport = (reportId) => {
    if (confirm('确定要删除这条举报记录吗？')) {
      store.dispatch('removeReport', reportId)
    }
  }

  const getReportCount = (postId) => {
    return store.getters.getReportCount(postId)
  }
  
  const showModal = (mode, postId = null) => {
    isEditing.value = mode === 'edit'
    
    if (mode === 'edit' && postId) {
      const post = posts.value.find(p => p.id === postId)
      if (post) {
        currentPost.id = post.id
        currentPost.title = post.title
        currentPost.content = post.content
        currentPost.author = post.author
        currentPost.date = post.date
        currentPost.likes = post.likes || 0
      }
    } else {
      // 重置表单
      currentPost.id = null
      currentPost.title = ''
      currentPost.content = ''
      currentPost.author = currentUserName.value
      currentPost.date = null
      currentPost.likes = 0
    }
    
    modalVisible.value = true
  }
  
  const hideModal = () => {
    modalVisible.value = false
  }
  
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  
  const editPost = (id) => {
    showModal('edit', id)
  }

  const deletePost = (id) => {
    if (confirm('要删除这篇帖子吗？')) {
      store.dispatch('deletePost', id)
    }
  }

  const savePost = () => {
    if (!currentPost.title.trim() || !currentPost.content.trim()) {
      alert('请在标题栏和内容栏添加内容')
      return
    }
    
    if (isEditing.value) {
      store.dispatch('updatePost', {
        id: currentPost.id,
        title: currentPost.title,
        content: currentPost.content,
        date: new Date().toISOString()
      })
    } else {
      const newPost = {
        id: Date.now().toString(),
        title: currentPost.title,
        content: currentPost.content,
        author: currentPost.author,
        date: new Date().toISOString(),
        likes: 0
      }
      store.dispatch('addPost', newPost)
    }
    
    hideModal()
  }

  onMounted(() => {
    const savedPosts = JSON.parse(localStorage.getItem('forumPosts')) || []
    if (savedPosts.length > 0) {
      store.commit('SET_POSTS', savedPosts)
    }
  })
</script>

<style scoped>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Helvetica Neue', Arial, sans-serif;
  }

  body {
    background-color: #f5f6f7;
    color: #333;
    line-height: 1.6;
    padding: 20px;
  }

  .main_container {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    min-width: 900px;
    margin: 0 auto;
  }

  .post-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
  }

  .post-header h2 {
    color: #2c3e50;
    font-size: 1.5rem;
  }

  .new-post-btn {
    background: #96a5e9;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    font-weight: 500;
    transition: all 0.3s;
  }

  .new-post-btn:hover {
    background: #596392;
  }

  .posts-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .post {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 20px;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .post:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .post-header-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }

  .post-title {
    font-size: 1.2rem;
    color: #2c3e50;
    font-weight: 600;
  }

  .post-meta {
    display: flex;
    gap: 15px;
    color: #7f8c8d;
    font-size: 0.9rem;
  }

  .likes-count {
    color: #00ad3f;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: large;
  }

  .post-content {
    color: #34495e;
    margin-bottom: 15px;
    line-height: 1.6;
  }

  .post-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .post-action-btn {
    background: none;
    border: none;
    color: #7f8c8d;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border-radius: 4px;
    transition: background 0.2s;
  }

  .post-action-btn:hover {
    background: #f5f5f5;
    color: #34495e;
  }

  .edit-btn:hover {
    color: #3498db;
  }

  .like-btn:hover {
    color: #04ed78;
  }

  .delete-btn:hover {
    color: #e74c3c;
  }

  .report-btn:hover {
    color: #f39c12;
  }

  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    padding: 30px;
    border-radius: 8px;
    width: 90%;
    max-width: 600px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .modal-title {
    font-size: 1.5rem;
    color: #2c3e50;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #7f8c8d;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #34495e;
  }

  .form-control {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  .form-control:focus {
    outline: none;
    border-color: #3498db;
  }

  textarea.form-control {
    min-height: 150px;
    resize: vertical;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }

  .cancel-btn {
    background: #aeb4cd;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
  }

  .cancel-btn:hover {
    background: #a8aab2;
  }

  .save-btn {
    background: #96a5e9;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
  }

  .save-btn:hover {
    background: #596392;
  }

  .empty-state {
    text-align: center;
    padding: 40px 0;
    color: #7f8c8d;
  }

  .empty-state i {
    font-size: 3rem;
    margin-bottom: 15px;
    color: #ddd;
  }

  .empty-state p {
    font-size: 1.1rem;
  }

  .admin-view {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
  }
  
  .admin-view h3 {
    color: #2c3e50;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .reports-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .report-item {
    background: white;
    border-radius: 6px;
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .report-info {
    flex: 1;
  }
  
  .report-meta {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    font-size: 0.9rem;
    color: #7f8c8d;
  }
  
  .report-details p {
    margin: 5px 0;
  }
  
  .empty-reports {
    text-align: center;
    padding: 20px;
    color: #7f8c8d;
  }

  .reports-count {
    color: #e67e22;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .admin-btn {
    background-color: #e67e22 !important;
    color: white !important;
  }
  
  .admin-btn.active {
    background-color: #d35400 !important;
  }

  .report-btn:hover {
    color: #e67e22;
  }
</style>