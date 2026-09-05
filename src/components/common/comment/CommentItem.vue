<template>
  <div :id="`comment-${comment.id}`" class="comment-item">
    <div class="comment-header">
      <strong>{{ comment.nickname }}</strong>

      <div class="comment-header-actions">
        <button
          type="button"
          class="comment-share"
          aria-label="댓글 공유"
          @click="emit('share', comment)"
        >
          <FontAwesomeIcon :icon="faShareNodes" />
        </button>

        <div v-if="currentUser && comment.userId === currentUser.id" class="comment-menu-wrap">
          <button
            type="button"
            class="comment-more"
            aria-label="댓글 메뉴"
            @click="emit('toggle-menu', comment.id)"
          >
            <FontAwesomeIcon :icon="faEllipsisVertical" />
          </button>

          <div v-if="openedMenuId === comment.id" class="comment-menu">
            <button type="button" @click="emit('edit', comment)">수정</button>
            <button type="button" class="delete-menu-button" @click="emit('delete', comment.id)">
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="editingCommentId === comment.id" class="comment-edit-form">
      <textarea :value="editedContent" maxlength="500" @input="updateEditedContent"></textarea>
      <div class="comment-edit-actions">
        <button type="button" @click="emit('cancel-edit')">취소</button>
        <button type="button" class="save-button" @click="emit('save-edit', comment.id)">
          수정완료
        </button>
      </div>
    </div>
    <p v-else class="comment-content">{{ comment.content }}</p>

    <img
      v-if="comment.parentCommentId == null && comment.imageUrl"
      class="comment-image"
      :src="comment.imageUrl"
      :alt="`${comment.nickname}님의 댓글 사진`"
      loading="lazy"
    />

    <div class="comment-footer">
      <span class="comment-date">{{ formatCommentDate(comment.createdAt) }}</span>
      <button
        v-if="currentUser"
        type="button"
        class="comment-reply"
        @click="emit('toggle-reply', comment)"
      >
        {{ replyingCommentId === comment.id ? '답글 닫기' : '답글 달기' }}
      </button>
    </div>

    <CommentEditor
      v-if="replyingCommentId === comment.id"
      mode="reply"
      :user="currentUser"
      :loading="replyLoading"
      @cancel="emit('cancel-reply')"
      @submit="(content, image) => emit('submit-reply', comment.id, content, image)"
    />

    <div
      v-for="reply in comment.replies"
      :id="`comment-${reply.id}`"
      :key="reply.id"
      class="reply-item"
    >
      <div class="comment-header">
        <strong>{{ reply.nickname }}</strong>

        <div class="comment-header-actions">
          <button
            type="button"
            class="comment-share"
            aria-label="답글 공유"
            @click="emit('share', reply)"
          >
            <FontAwesomeIcon :icon="faShareNodes" />
          </button>

          <div v-if="currentUser && reply.userId === currentUser.id" class="comment-menu-wrap">
            <button
              type="button"
              class="comment-more"
              aria-label="답글 메뉴"
              @click="emit('toggle-menu', reply.id)"
            >
              <FontAwesomeIcon :icon="faEllipsisVertical" />
            </button>

            <div v-if="openedMenuId === reply.id" class="comment-menu">
              <button type="button" @click="emit('edit', reply)">수정</button>
              <button type="button" class="delete-menu-button" @click="emit('delete', reply.id)">
                삭제
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="editingCommentId === reply.id" class="comment-edit-form">
        <textarea :value="editedContent" maxlength="500" @input="updateEditedContent"></textarea>
        <div class="comment-edit-actions">
          <button type="button" @click="emit('cancel-edit')">취소</button>
          <button type="button" class="save-button" @click="emit('save-edit', reply.id)">
            수정완료
          </button>
        </div>
      </div>
      <p v-else class="comment-content">{{ reply.content }}</p>

      <div class="comment-footer">
        <span class="comment-date">{{ formatCommentDate(reply.createdAt) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faEllipsisVertical, faShareNodes } from '@fortawesome/free-solid-svg-icons'
import CommentEditor from '@/components/common/comment/CommentEditor.vue'

defineProps({
  comment: { type: Object, required: true },
  currentUser: { type: Object, default: null },
  openedMenuId: { type: Number, default: null },
  editingCommentId: { type: Number, default: null },
  editedContent: { type: String, default: '' },
  replyingCommentId: { type: Number, default: null },
  replyLoading: { type: Boolean, default: false },
})

const emit = defineEmits([
  'update:editedContent',
  'toggle-menu',
  'edit',
  'delete',
  'save-edit',
  'cancel-edit',
  'toggle-reply',
  'cancel-reply',
  'submit-reply',
  'share',
])

const updateEditedContent = (event) => emit('update:editedContent', event.target.value)
const formatCommentDate = (date) => {
  if (!date) return ''

  if (Array.isArray(date)) {
    const [year, month, day, hour, minute] = date
    return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  }

  const parts = String(date).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
  if (!parts) return String(date)

  const [, year, month, day, hour, minute] = parts
  return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}
</script>

<style scoped>
.comment-item {
  position: relative;
  padding: 18px 0;
  border-bottom: 1px solid #eee;
}
.comment-item:last-child {
  border-bottom: none;
}
.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.comment-header strong {
  color: #222;
  font-size: 14px;
  font-weight: 700;
}
.comment-header-actions {
  display: flex;
  align-items: center;
}
.comment-share,
.comment-more {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: none;
  background: none;
  color: #999;
  cursor: pointer;
}
.comment-share:hover,
.comment-more:hover {
  color: #635bff;
}
.comment-menu-wrap {
  position: relative;
}
.comment-menu {
  position: absolute;
  top: 30px;
  right: 0;
  z-index: 20;
  width: 90px;
  padding: 5px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 5px 18px rgba(0, 0, 0, 0.1);
}
.comment-menu button {
  display: block;
  width: 100%;
  padding: 8px 10px;
  border: none;
  border-radius: 5px;
  background: none;
  color: #333;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
}
.comment-menu button:hover {
  background: #f5f5f5;
}
.comment-menu .delete-menu-button {
  color: #e5484d;
}
.comment-content {
  margin: 10px 0;
  color: #222;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}
.comment-image {
  display: block;
  width: min(100%, 200px);
  max-height: 200px;
  margin: 10px 0;
  border-radius: 10px;
  object-fit: cover;
}
.comment-footer {
  display: flex;
  align-items: center;
  gap: 12px;
}
.comment-date {
  color: #aaa;
  font-size: 12px;
}
.comment-reply {
  padding: 0;
  border: none;
  background: none;
  color: #777;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.comment-reply:hover {
  color: #635bff;
}
.comment-edit-form {
  margin: 10px 0;
}
.comment-edit-form textarea {
  width: 100%;
  min-height: 80px;
  padding: 10px 12px;
  box-sizing: border-box;
  border: 1px solid #ddd;
  border-radius: 8px;
  outline: none;
  resize: none;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
}
.comment-edit-form textarea:focus {
  border-color: #635bff;
}
.comment-edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}
.comment-edit-actions button {
  height: 34px;
  padding: 0 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  color: #555;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.comment-edit-actions .save-button {
  border-color: #635bff;
  background: #635bff;
  color: #fff;
}
.reply-item {
  margin-top: 14px;
  margin-left: 18px;
  padding: 14px 14px 14px 16px;
  border-left: 3px solid #ddd;
  border-radius: 0 8px 8px 0;
  background: #f7f7fa;
}
@media (max-width: 600px) {
  .reply-item {
    margin-left: 10px;
  }
}
</style>
