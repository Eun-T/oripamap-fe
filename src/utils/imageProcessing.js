import imageCompression from 'browser-image-compression'

export const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024
export const IMAGE_FILE_ACCEPT = 'image/jpeg,image/png,image/heic,image/heif,.heic,.heif'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png']
const HEIC_IMAGE_TYPES = ['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence']

export class ImageProcessingError extends Error {
  constructor(code, message, options) {
    super(message, options)
    this.name = 'ImageProcessingError'
    this.code = code
  }
}

const throwIfAborted = (signal) => {
  if (signal?.aborted) throw new DOMException('Image processing aborted.', 'AbortError')
}

const isHeicImage = (file) => {
  const normalizedType = file.type.toLowerCase()
  const hasHeicExtension = /\.(heic|heif)$/i.test(file.name)

  return (
    HEIC_IMAGE_TYPES.includes(normalizedType) ||
    ((!normalizedType || normalizedType === 'application/octet-stream') && hasHeicExtension)
  )
}

export const validateImageFile = (file) => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase()) && !isHeicImage(file)) {
    return 'unsupported-type'
  }
  if (file.size > MAX_IMAGE_FILE_SIZE) return 'file-too-large'
  return null
}

const readBlobAsImageData = async (blob, signal) => {
  const imageUrl = URL.createObjectURL(blob)
  const image = new Image()

  try {
    await new Promise((resolve, reject) => {
      const cleanup = () => {
        image.onload = null
        image.onerror = null
        signal?.removeEventListener('abort', handleAbort)
      }
      const handleAbort = () => {
        cleanup()
        image.src = ''
        reject(new DOMException('Image processing aborted.', 'AbortError'))
      }

      image.onload = () => {
        cleanup()
        resolve()
      }
      image.onerror = () => {
        cleanup()
        reject(new Error('Fallback image could not be loaded.'))
      }
      signal?.addEventListener('abort', handleAbort, { once: true })
      image.src = imageUrl
    })

    throwIfAborted(signal)

    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight

    try {
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Canvas context could not be created.')

      context.drawImage(image, 0, 0)
      return context.getImageData(0, 0, canvas.width, canvas.height)
    } finally {
      canvas.width = 0
      canvas.height = 0
    }
  } finally {
    URL.revokeObjectURL(imageUrl)
  }
}

const encodeWebpFallback = async (blob, signal) => {
  const { default: encodeWebp } = await import('@jsquash/webp/encode.js')
  throwIfAborted(signal)

  const imageData = await readBlobAsImageData(blob, signal)
  throwIfAborted(signal)

  const webpBuffer = await encodeWebp(imageData, { quality: 75 })
  throwIfAborted(signal)

  return new Blob([webpBuffer], { type: 'image/webp' })
}

export const processImageFile = async (file, { signal } = {}) => {
  const validationError = validateImageFile(file)
  if (validationError) {
    throw new ImageProcessingError(validationError, `Invalid image file: ${validationError}`)
  }

  let imageToCompress = file

  if (isHeicImage(file)) {
    try {
      const { default: heic2any } = await import('heic2any')
      const convertedImage = await heic2any({ blob: file, toType: 'image/jpeg' })
      throwIfAborted(signal)

      const jpegBlob = Array.isArray(convertedImage) ? convertedImage[0] : convertedImage
      if (!jpegBlob) throw new Error('HEIC/HEIF conversion returned no image.')

      const baseName = file.name.replace(/\.[^.]+$/, '') || 'image'
      imageToCompress = new File([jpegBlob], `${baseName}.jpg`, {
        type: 'image/jpeg',
        lastModified: file.lastModified,
      })
    } catch (error) {
      if (error?.name === 'AbortError') throw error
      throw new ImageProcessingError('heic-conversion-failed', 'HEIC/HEIF conversion failed.', {
        cause: error,
      })
    }
  }

  let processedImage = await imageCompression(imageToCompress, {
    maxWidthOrHeight: 1200,
    initialQuality: 0.75,
    fileType: 'image/webp',
    useWebWorker: true,
    signal,
  })
  throwIfAborted(signal)

  if (processedImage.type !== 'image/webp') {
    processedImage = await encodeWebpFallback(processedImage, signal)
  }
  throwIfAborted(signal)

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'image'
  return new File([processedImage], `${baseName}.webp`, {
    type: 'image/webp',
    lastModified: file.lastModified,
  })
}
