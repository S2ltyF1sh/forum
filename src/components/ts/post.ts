import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import axios from 'axios'

export function ts(props: any) {
  const store = useStore()

  const posts = computed(() => store.state.posts || [])
  const modalVisible = ref(false)
  const isEditing = ref(false)

  const reportModalVisible = ref(false)
  const reportReason = ref('')
  const customReportReason = ref('')
  const currentReportPostId = ref('')
  const user_id = computed(() => store.getters.user_id)
  const user_type = computed(() => store.getters.user_type)
  const userReports = ref([])
  const unapprovedReports = ref([])

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

  const headerTitle = computed(() => {
    switch (props.currentView) {
      case 'home': return '全部帖子'
      case 'personal': return '我的帖子'
      case 'admin': return '举报管理'
      case 'feedback': return '举报反馈'
      default: return '全部帖子'
    }
  })

  const sortedPosts = computed(() => {
    return [...posts.value].sort((a, b) => new Date(b.date) - new Date(a.date))
  })

  const likePost = (id: string) => {
    const target = "/api/student/likes"
    const body = {
      post_id: Number(id),
      user_id: user_id.value
    }

    axios.post(target, body)
      .then(response => {
        console.log("点赞响应:", response);
        if (response.data.code === 200) {
          store.dispatch('setPostLikes', {
            postId: id.toString(),
            likes: response.data.data.likeCount
          });
        } else {
          alert('点赞失败: ' + response.data.msg);
        }
      })
      .catch(error => {
        console.error("点赞错误:", error);
        alert('点赞时发生错误');
      });
  }

  const showReportModal = (postId: string) => {
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
      alert('请选择举报原因');
      return;
    }

    let reason = reportReason.value;
    if (reason === '其他' && customReportReason.value) {
      reason = customReportReason.value;
    }

    const target = "/api/student/report-post";
    const body = {
      post_id: Number(currentReportPostId.value),
      user_id: user_id.value,
      reason: reason
    };

    axios.post(target, body)
      .then(response => {
        console.log("举报响应:", response);
        if (response.data.code === 200) {
          store.dispatch('addReport', {
            postId: currentReportPostId.value,
            username: currentUserName.value,
            reason: reason
          });

          alert('举报已提交，感谢您的反馈！');
          hideReportModal();
        } else {
          alert('举报失败: ' + response.data.msg);
        }
      })
      .catch(error => {
        console.error("举报错误:", error);
        alert('举报时发生错误');
      });
  };

  const fetchUnapprovedReports = () => {
    const target = "/api/admin/report"
    const params = {
      user_id: user_id.value
    }

    axios.get(target, { params })
      .then(response => {
        console.log("未审批举报:", response);
        if (response.data.code === 200 || response.data.code === 0) {
          unapprovedReports.value = response.data.data.report_list || [];
          alert('获取未审批举报成功');
        } else {
          alert('获取未审批举报失败: ' + response.data.msg);
        }
      })
      .catch(error => {
        console.error("获取未审批举报错误:", error);
        alert('获取未审批举报时发生错误');
      });
  }

  const getReportCount = (postId: string) => {
    return store.getters.getReportCount(postId)
  }

  const approveReport = (reportId: number, approval: number) => {
    const target = "/api/admin/report"
    const body = {
      user_id: user_id.value,
      report_id: reportId,
      approval: approval
    }

    axios.post(target, body)
      .then(response => {
        console.log("审批响应:", response);
        if (response.data.code === 200 || response.data.code === 0) {
          alert(approval === 1 ? '举报已通过' : '举报已驳回');
          unapprovedReports.value = unapprovedReports.value.filter(
            (report: any) => report.report_id !== reportId
          );
        } else {
          alert('审批操作失败: ' + response.data.msg);
        }
      })
      .catch(error => {
        console.error("审批错误:", error);
        alert('审批操作时发生错误');
      });
  }

  const showModal = (mode: string, postId: string | null = null) => {
    isEditing.value = mode === 'edit'

    if (mode === 'edit' && postId) {
      const post = posts.value.find((p: any) => p.id === postId)
      if (post) {
        currentPost.id = post.id
        currentPost.title = post.title
        currentPost.content = post.content
        currentPost.author = post.author
        currentPost.date = post.date
        currentPost.likes = post.likes || 0
      }
    } else {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  const editPost = (id: string) => {
    showModal('edit', id)
  }

  const deletePost = (id: string) => {
    if (confirm('要删除这篇帖子吗？')) {
      const target = "/api/student/post"
      const params = {
        user_id: user_id.value,
        post_id: Number(id)
      }

      axios.delete(target, { params })
        .then(response => {
          console.log("删除响应:", response);
          if (response.data.code === 200) {
            store.dispatch('deletePost', id);
            alert('删除成功');
            getPost()
          } else {
            alert('删除失败')
          }
        })
        .catch(error => {
          console.error("删除帖子错误:", error);
          alert('删除帖子时发生错误');
        });
    }
  }

  const savePost = () => {
    if (isEditing.value && currentPost.id) {
      const target = "/api/student/post"
      const body = {
        user_id: user_id.value,
        post_id: Number(currentPost.id),
        content: currentPost.title + "\n\n" + currentPost.content
      }

      axios.put(target, body)
        .then(response => {
          console.log("编辑响应:", response);
          if (response.data.code === 200) {
            alert('编辑成功');
            store.dispatch('updatePost', {
              id: currentPost.id,
              title: currentPost.title,
              content: currentPost.content,
              date: new Date().toISOString()
            });
          } else {
            alert('编辑失败');
          }
          getPost();
          hideModal();
        })
        .catch(error => {
          console.error("编辑帖子错误:", error);
          alert('编辑帖子时发生错误');
        });
    } else {
      const target = "/api/student/post"
      const body = {
        content: currentPost.title + "\n\n" + currentPost.content,
        user_id: user_id.value
      }

      axios.post(target, body)
        .then(response => {
          console.log("发布响应:", response);
          const responseData = {
            code: response.data.code
          };
          if (responseData.code === 200) {
            alert('发布成功');
          } else {
            alert('发布失败');
          }
          getPost();
          hideModal();
        })
        .catch(error => {
          console.error("发布帖子错误:", error);
          alert('发布帖子时发生错误');
        });
    }
  }

  const getPost = () => {
    const target = "/api/student/post"

    axios.get(target)
      .then(response => {
        console.log("帖子详细:", response);
        if (response.data.code === 200) {
          const postList = response.data.data.post_list;
          store.dispatch('clearPosts');
          postList.forEach((post: any) => {
            store.dispatch('addPost', {
              id: post.id.toString(),
              title: post.content,
              content: post.content,
              author: post.user_id.toString(),
              date: post.time,
              likes: post.likes
            });
          });

          alert('刷新帖子成功');
        } else {
          alert('获取帖子失败');
        }
    }).catch(error => {
        console.error("获取帖子错误:", error);
        alert('获取帖子时发生错误');
    });
  }

  const getUserReports = () => {
    const target = "/api/student/report-post"
    const params = {
      user_id: user_id.value
    }

    axios.get(target, { params })
      .then(response => {
        console.log("用户举报反馈:", response);
        if (response.data.code === 200) {
          userReports.value = response.data.data.report_list || [];
        } else {
          alert('获取举报反馈失败: ' + response.data.msg);
        }
      })
      .catch(error => {
        console.error("获取举报反馈错误:", error);
        alert('获取举报反馈时发生错误');
      });
  }

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return '待处理';
      case 1: return '已处理';
      case 2: return '已驳回';
      default: return '未知状态';
    }
  }

  const getStatusClass = (status: number) => {
    switch (status) {
      case 0: return 'status-pending';
      case 1: return 'status-approved';
      case 2: return 'status-rejected';
      default: return '';
    }
  }

  onMounted(() => {
    const savedPosts = JSON.parse(localStorage.getItem('forumPosts') || '[]')
    if (savedPosts.length > 0) {
      store.commit('SET_POSTS', savedPosts)
    };
    if (props.currentView === 'admin' && user_type.value === 2) {
      fetchUnapprovedReports();
    }
  })

  watch(() => props.currentView, (newView) => {
    if (newView === 'admin' && user_type.value === 2) {
      fetchUnapprovedReports();
    }
    if (newView === 'feedback') {
      getUserReports()
    }
  })

  return {
    posts,
    modalVisible,
    isEditing,
    reportModalVisible,
    reportReason,
    customReportReason,
    currentReportPostId,
    user_id,
    user_type,
    userReports,
    unapprovedReports,
    currentPost,
    currentUserName,
    headerTitle,
    sortedPosts,
    likePost,
    showReportModal,
    hideReportModal,
    submitReport,
    fetchUnapprovedReports,
    getReportCount,
    approveReport,
    showModal,
    hideModal,
    formatDate,
    editPost,
    deletePost,
    savePost,
    getPost,
    getUserReports,
    getStatusText,
    getStatusClass
  }
}
