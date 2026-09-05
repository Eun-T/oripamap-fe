<template>
  <section class="photo-section">
    <div class="photo-header">
      <h3>방문자 사진</h3>

      <button
        type="button"
        class="photo-all-button"
      >
        사진 전체
        <span>›</span>
      </button>
    </div>

    <div class="photo-list">
      <div class="photo-empty">
        아직 등록된 사진이 없습니다.
      </div>
    </div>
  </section>
</template>

<style scoped>
.photo-section {
  padding: 0;
}

.photo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 14px;
}

.photo-header h3 {
  margin: 0;

  color: #222;

  font-size: 17px;
  font-weight: 700;
}

.photo-all-button {
  display: flex;
  align-items: center;
  gap: 4px;

  padding: 0;

  border: none;
  background: none;

  color: #333;

  font-size: 13px;
  font-weight: 600;

  cursor: pointer;
}

.photo-all-button:hover {
  color: #635bff;
}

.photo-all-button span {
  font-size: 22px;
  line-height: 1;
}

.photo-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.photo-empty {
  grid-column: 1 / -1;

  padding: 30px 0;

  color: #999;

  font-size: 13px;
  text-align: center;
}

@media (max-width: 600px) {
  .photo-header h3 {
    font-size: 16px;
  }
}
</style>
