<template>
  <div
    class="modal-overlay"
    @mousedown="handleBackdropMouseDown"
    @mouseup="handleBackdropMouseUp"
  >
    <section class="modal-box">
      <div class="modal-header">
        <slot name="header" />

        <button
          type="button"
          class="close-button"
          aria-label="닫기"
          @click="emit('close')"
        >
          ×
        </button>
      </div>

      <slot />
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['close'])

const mouseDownOnBackdrop = ref(false)

const handleBackdropMouseDown = (event) => {
  mouseDownOnBackdrop.value =
    event.target === event.currentTarget
}

const handleBackdropMouseUp = (event) => {
  const mouseUpOnBackdrop =
    event.target === event.currentTarget

  if (
    mouseDownOnBackdrop.value &&
    mouseUpOnBackdrop
  ) {
    emit('close')
  }

  mouseDownOnBackdrop.value = false
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 24px;

  background: rgba(15, 23, 42, 0.32);
  backdrop-filter: blur(3px);
}

.modal-box {
  width: 100%;
  max-width: 420px;
  max-height: calc(100vh - 48px);

  padding: 32px 36px 30px;

  overflow-y: auto;
  box-sizing: border-box;

  background: #fff;

  border: 1px solid #e5e7eb;
  border-radius: 10px;

  box-shadow:
    0 24px 70px rgba(15, 23, 42, 0.12),
    0 4px 16px rgba(15, 23, 42, 0.05);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  margin-bottom: 26px;
}

.close-button {
  flex-shrink: 0;

  width: 30px;
  height: 30px;

  padding: 0;
  margin-left: 16px;

  border: 0;
  background: transparent;

  color: #64748b;

  font-size: 28px;
  font-weight: 300;
  line-height: 1;

  cursor: pointer;
}

.close-button:hover {
  color: #111827;
}

@media (max-width: 768px) {
  .auth-slide-enter-active,
  .auth-slide-leave-active {
    transition: opacity 0.4s ease;
  }
  .auth-slide-enter-active .modal-box,
  .auth-slide-leave-active .modal-box {
    transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .auth-slide-enter-from,
  .auth-slide-leave-to { opacity: 0; }
  .auth-slide-enter-from .modal-box,
  .auth-slide-leave-to .modal-box { transform: translateY(100%); }
  .auth-slide-leave-active { pointer-events: none; }

  .modal-overlay {
    padding: 0;
    align-items: flex-end;
  }

  .modal-box {
    max-width: none;
    max-height: calc(100dvh - env(safe-area-inset-top, 0px) - 16px);

    padding: 28px max(20px, env(safe-area-inset-right)) calc(24px + env(safe-area-inset-bottom, 0px)) max(20px, env(safe-area-inset-left));

    border-radius: 24px 24px 0 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .auth-slide-enter-active,
  .auth-slide-leave-active,
  .auth-slide-enter-active .modal-box,
  .auth-slide-leave-active .modal-box { transition: none; }
}
</style>
