export const copyToClipboard = async (text) => {
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('복사할 텍스트가 없습니다.')
  }

  await navigator.clipboard.writeText(text)
}
