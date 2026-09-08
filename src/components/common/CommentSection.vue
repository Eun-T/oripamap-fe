<template>
  <div class="community-section">
    <div class="section-divider"></div>

    <VisitorPhotoSection
      ref="visitorPhotoSection"
      :place-id="placeId"
      @loaded="emit('photos-changed', $event)"
    />

    <div class="section-divider"></div>

    <!-- =========================
         댓글
    ========================== -->
    <section ref="commentSection" class="comment-section">
      <div class="comment-title">
        댓글
        <span>{{ totalCount }}</span>
      </div>

      <!-- =========================
           댓글 작성
      ========================== -->
      <CommentEditor
        ref="commentEditor"
        :user="authStore.user"
        :loading="commentLoading || commentsLoading"
        @submit="submitComment"
      />

      <!-- 댓글 없음 -->
      <div v-if="!commentsLoading && comments.length === 0" class="comment-empty">
        아직 댓글이 없습니다.
      </div>

      <!-- =========================
           원댓글 목록
      ========================== -->
      <CommentItem
        v-for="comment in comments"
        :key="comment.id"
        v-model:edited-content="editedContent"
        :comment="comment"
        :current-user="authStore.user"
        :opened-menu-id="openedMenuId"
        :editing-comment-id="editingCommentId"
        :replying-comment-id="replyingCommentId"
        :reply-loading="replyLoading || commentsLoading"
        @toggle-menu="toggleCommentMenu"
        @edit="editComment"
        @delete="handleDelete"
        @save-edit="saveEditedComment"
        @cancel-edit="cancelEditComment"
        @toggle-reply="replyComment"
        @cancel-reply="cancelReply"
        @submit-reply="submitReply"
        @share="shareComment"
      />

      <div v-if="hasNext" class="comment-load-more-wrap">
        <button
          type="button"
          class="comment-load-more"
          :disabled="commentsLoading || commentLoading || replyLoading"
          @click="loadMoreComments"
        >
          {{ commentsLoading ? '불러오는 중...' : '댓글 더보기' }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

import { getComments, addComment, deleteComment, updateComment, addReply } from '@/api/commentApi'

import { useAuthStore } from '@/stores/authStore'
import { shareContent } from '@/utils/shareContent'
import VisitorPhotoSection from '@/components/common/comment/VisitorPhotoSection.vue'
import CommentEditor from '@/components/common/comment/CommentEditor.vue'
import CommentItem from '@/components/common/comment/CommentItem.vue'

const authStore = useAuthStore()

const props = defineProps({
  placeId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['photos-changed'])

const comments = ref([])
const totalCount = ref(0)
const currentPage = ref(0)
const hasNext = ref(false)
const commentsLoading = ref(false)
const COMMENTS_PAGE_SIZE = 5
let commentsRequestId = 0

const commentLoading = ref(false)

const commentSection = ref(null)
const commentEditor = ref(null)
const visitorPhotoSection = ref(null)

const openedMenuId = ref(null)

/* 수정 */
const editingCommentId = ref(null)
const editedContent = ref('')

/* 답글 */
const replyingCommentId = ref(null)
const replyLoading = ref(false)

/* =========================
   댓글 조회
========================= */

const loadComments = async ({ reset = true } = {}) => {
  if (!props.placeId) {
    if (reset) {
      comments.value = []
      totalCount.value = 0
      currentPage.value = 0
      hasNext.value = false
    }
    return
  }

  if (!reset && (commentsLoading.value || !hasNext.value)) return

  const placeId = props.placeId
  const targetPage = reset ? 0 : currentPage.value + 1
  const requestId = ++commentsRequestId

  if (reset) {
    comments.value = []
    totalCount.value = 0
    currentPage.value = 0
    hasNext.value = false
  }

  commentsLoading.value = true

  try {
    const data = await getComments(placeId, targetPage, COMMENTS_PAGE_SIZE)

    if (requestId !== commentsRequestId || placeId !== props.placeId) return

    const nextComments = Array.isArray(data?.comments) ? data.comments : []
    if (reset) {
      comments.value = nextComments
    } else {
      const existingIds = new Set(comments.value.map((comment) => String(comment.id)))
      const uniqueNextComments = nextComments.filter(
        (comment) => !existingIds.has(String(comment.id)),
      )
      comments.value = [...comments.value, ...uniqueNextComments]
    }
    totalCount.value = Number.isInteger(data?.totalCount) ? data.totalCount : 0
    currentPage.value = Number.isInteger(data?.page) ? data.page : targetPage
    hasNext.value = data?.hasNext === true
  } catch (error) {
    console.error('댓글 조회 실패:', error)

    if (requestId === commentsRequestId && reset) {
      comments.value = []
      totalCount.value = 0
      currentPage.value = 0
      hasNext.value = false
    }
  } finally {
    if (requestId === commentsRequestId) {
      commentsLoading.value = false
    }
  }
}

const loadMoreComments = () => {
  if (commentLoading.value || replyLoading.value) return
  return loadComments({ reset: false })
}

const incrementTotalCount = () => {
  totalCount.value = (Number.isInteger(totalCount.value) ? totalCount.value : 0) + 1
}

/* =========================
   댓글 작성
========================= */

const submitComment = async (content, file) => {
  if (!authStore.user) return

  if (!content) {
    alert('댓글 내용을 입력해주세요.')
    return
  }

  if (!props.placeId || commentLoading.value || commentsLoading.value) {
    return
  }

  try {
    commentLoading.value = true

    const placeId = props.placeId
    const createdComment = await addComment(placeId, content, file)

    await commentEditor.value?.resetEditor()

    if (placeId !== props.placeId) return

    // Ignore an older in-flight list request so it cannot overwrite the new comment.
    commentsRequestId += 1
    commentsLoading.value = false
    comments.value = [
      {
        ...createdComment,
        replies: Array.isArray(createdComment?.replies) ? createdComment.replies : [],
      },
      ...comments.value,
    ]
    incrementTotalCount()

    if (file) await visitorPhotoSection.value?.refresh()
  } catch (error) {
    console.error('댓글 작성 실패:', error)
  } finally {
    commentLoading.value = false
  }
}

/* =========================
   댓글 삭제
========================= */

const handleDelete = async (commentId) => {
  openedMenuId.value = null

  try {
    await deleteComment(commentId)
    await Promise.all([loadComments(), visitorPhotoSection.value?.refresh()])
  } catch (error) {
    console.error('댓글 삭제 실패:', error)
  }
}

/* =========================
   댓글 메뉴
========================= */

const toggleCommentMenu = (commentId) => {
  openedMenuId.value = openedMenuId.value === commentId ? null : commentId
}

/* =========================
   댓글 수정 시작
========================= */

const editComment = (comment) => {
  editingCommentId.value = comment.id
  editedContent.value = comment.content

  openedMenuId.value = null
}

/* =========================
   댓글 수정 저장
========================= */

const saveEditedComment = async (commentId) => {
  const content = editedContent.value.trim()

  if (!content) {
    alert('댓글 내용을 입력해주세요.')
    return
  }

  try {
    await updateComment(commentId, content)

    editingCommentId.value = null
    editedContent.value = ''

    await loadComments()
  } catch (error) {
    console.error('댓글 수정 실패:', error)

    if (error.response?.status === 403) {
      alert('본인 댓글만 수정할 수 있습니다.')
    } else {
      alert('댓글 수정에 실패했습니다.')
    }
  }
}

const cancelEditComment = () => {
  editingCommentId.value = null
  editedContent.value = ''
}

/* =========================
   답글 입력창 열기
========================= */

const replyComment = (comment) => {
  if (!authStore.user) return

  if (replyingCommentId.value === comment.id) {
    cancelReply()
    return
  }

  replyingCommentId.value = comment.id
}

/* =========================
   답글 취소
========================= */

const cancelReply = () => {
  replyingCommentId.value = null
}

/* =========================
   답글 등록
========================= */

const submitReply = async (commentId, content) => {
  if (!authStore.user) return

  if (!content) {
    alert('답글 내용을 입력해주세요.')
    return
  }

  if (replyLoading.value || commentsLoading.value) return

  try {
    replyLoading.value = true

    const placeId = props.placeId
    const createdReply = await addReply(commentId, content)

    cancelReply()

    if (placeId !== props.placeId) return

    // Ignore an older in-flight list request so it cannot overwrite the new reply.
    commentsRequestId += 1
    commentsLoading.value = false

    // Prefer the response's parent id, but retain the submitted id for compatibility.
    const parentCommentId = createdReply?.parentCommentId ?? commentId
    const parentIndex = comments.value.findIndex(
      (comment) => String(comment.id) === String(parentCommentId),
    )

    if (parentIndex !== -1) {
      const parent = comments.value[parentIndex]
      const replies = Array.isArray(parent.replies) ? parent.replies : []
      comments.value[parentIndex] = {
        ...parent,
        replies: [...replies, createdReply],
      }
    }

    incrementTotalCount()
  } catch (error) {
    console.error('답글 작성 실패:', error)

    if (error.response?.status === 400) {
      alert('답글을 등록할 수 없습니다.')
    } else {
      alert('답글 작성에 실패했습니다.')
    }
  } finally {
    replyLoading.value = false
  }
}

/* =========================
   공유
========================= */

const shareComment = (comment) =>
  shareContent({
    title: '오리파맵 댓글',
    text: comment.content,
    url: `${window.location.href}#comment-${comment.id}`,
    successMessage: '댓글 링크가 복사되었습니다.',
  })

/* =========================
   댓글 위치
========================= */

const scrollToComments = (offset = 0) => {
  const target = commentSection.value
  const scrollContainer = target?.closest('.place-content')

  if (!target || !scrollContainer) return

  const top =
    target.getBoundingClientRect().top -
    scrollContainer.getBoundingClientRect().top +
    scrollContainer.scrollTop

  scrollContainer.scrollTo({
    top: top - offset,
    behavior: 'smooth',
  })
}

defineExpose({
  scrollToComments,
  getCommentElement: () => commentSection.value,
})

/* =========================
   장소 변경
========================= */

watch(
  () => props.placeId,
  async () => {
    openedMenuId.value = null

    editingCommentId.value = null
    editedContent.value = ''

    replyingCommentId.value = null

    await commentEditor.value?.resetEditor()
    await loadComments()
  },
  { immediate: true },
)
</script>

<style scoped>
.community-section {
  margin-top: 24px;
}

/* =========================
   섹션 구분
========================= */

.section-divider {
  height: 8px;

  margin: 24px -18px;

  background: #f3f4f6;
}

/* =========================
   댓글
========================= */

.comment-section {
  scroll-margin-top: 10px;
}

.comment-title {
  display: flex;
  align-items: center;
  gap: 5px;
  padding-top: 5px;
  margin-bottom: 14px;

  color: #222;

  font-size: 17px;
  font-weight: 700;
}

.comment-title span {
  color: #635bff;

  font-size: 15px;
}

/* =========================
   댓글 없음
========================= */

.comment-empty {
  padding: 28px 0;

  color: #999;

  font-size: 14px;
  text-align: center;
}

.comment-load-more-wrap {
  display: flex;
  justify-content: center;
  padding-top: 16px;
}

.comment-load-more {
  min-width: 120px;
  padding: 9px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;

  background: #fff;
  color: #555;

  font-size: 14px;
  cursor: pointer;
}

.comment-load-more:hover:not(:disabled) {
  border-color: #635bff;
  color: #635bff;
}

.comment-load-more:disabled {
  cursor: default;
  opacity: 0.6;
}

/* =========================
   모바일
========================= */

@media (max-width: 600px) {
  .community-section {
    margin-top: 20px;
  }

  .section-divider {
    margin: 20px -18px;
  }

  .comment-title {
    font-size: 16px;
  }
}
</style>
