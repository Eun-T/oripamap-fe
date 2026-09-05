export const shareContent = async ({
  title,
  text,
  url = window.location.href,
  successMessage = '링크가 복사되었습니다.',
}) => {
  try {
    if (navigator.share) {
      await navigator.share({ title, text, url })
      return true
    }

    await navigator.clipboard.writeText(url)
    alert(successMessage)

    return true
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('공유 실패:', error)
    }

    return false
  }
}
