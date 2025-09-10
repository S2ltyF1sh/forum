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
    <div class="admin-view" v-if="currentView === 'admin' && user_type === 2">
      <h3>举报管理</h3>
      <!-- <div class="admin-controls">
        <button class="btn btn-primary" @click="fetchUnapprovedReports">
          <i class="fas fa-sync-alt"></i> 刷新未审批举报
        </button>
      </div> -->
      <div class="reports-list">
        <div v-if="unapprovedReports.length === 0" class="empty-reports">
          暂无未审批举报
        </div>
        <div v-for="report in unapprovedReports" :key="report.report_id" class="report-item">
          <div class="report-info">
            <div class="report-meta">
              <span class="report-id">举报ID: {{ report.report_id }}</span>
              <span class="report-username">举报人: {{ report.username }}</span>
              <span class="report-post-id">帖子ID: {{ report.post_id }}</span>
            </div>
            <div class="report-details">
              <p><strong>帖子内容:</strong> {{ report.content }}</p>
              <p><strong>举报原因:</strong> {{ report.reason }}</p>
            </div>
          </div>
          <div class="report-actions">
            <button class="btn btn-success" @click="approveReport(report.report_id, 1)">
              <i class="fas fa-check"></i> 通过
            </button>
            <button class="btn btn-danger" @click="approveReport(report.report_id, 2)">
              <i class="fas fa-times"></i> 驳回
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 反馈视图 - 用户查看自己的举报结果 -->
    <div class="feedback-view" v-if="currentView === 'feedback'">
      <h3>我的举报反馈</h3>
      <div class="feedback-list">
        <div v-if="userReports.length === 0" class="empty-feedback">
          暂无举报记录
        </div>
        <div v-for="report in userReports" :key="report.post_id" class="feedback-item">
          <div class="feedback-info">
            <div class="feedback-meta">
              <span class="feedback-post-id">帖子ID: {{ report.post_id }}</span>
              <span class="feedback-status" :class="getStatusClass(report.status)">
                {{ getStatusText(report.status) }}
              </span>
            </div>
            <div class="feedback-details">
              <p><strong>帖子内容:</strong> {{ report.content }}</p>
              <p><strong>举报原因:</strong> {{ report.reason }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 帖子容器 -->
    <div class="posts-container" v-if="currentView !== 'admin' && currentView !== 'feedback'">
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
              <span class="reports-count" v-if="getReportCount(post.id) > 0 && user_type === 2">
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
              <span class="reports-count" v-if="getReportCount(post.id) > 0 && user_type === 2">
                <i class="fas fa-flag"></i> {{ getReportCount(post.id) }}
              </span>
            </div>
          </div>
          <div class="post-content">
            {{ post.content }}
          </div>
          <div class="post-actions">
            <button class="post-action-btn edit-btn" @click="editPost(post.id)" v-if="Number(post.author) === user_id || user_type === 2">
              <i class="fas fa-edit"></i> 编辑
            </button>
            <button class="post-action-btn delete-btn" @click="deletePost(post.id)" v-if="Number(post.author) === user_id || user_type === 2" >
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

<script setup lang="ts">
import { defineProps } from 'vue'
import { ts } from './ts/post'

const props = defineProps({
  currentView: {
    type: String,
    default: 'home'
  }
})

const {
  posts,
  modalVisible,
  isEditing,
  reportModalVisible,
  reportReason,
  customReportReason,
  user_id,
  user_type,
  userReports,
  unapprovedReports,
  currentPost,
  headerTitle,
  sortedPosts,
  likePost,
  showReportModal,
  hideReportModal,
  submitReport,
  getReportCount,
  approveReport,
  showModal,
  hideModal,
  formatDate,
  editPost,
  deletePost,
  savePost,
  getStatusText,
  getStatusClass
} = ts(props)
</script>

<style scoped>
@import './style/post.css';
</style>
