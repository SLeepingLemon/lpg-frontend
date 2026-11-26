/**
 * Centre-crop an image file to a square and resize it, returning a JPEG data
 * URL (~15–40 KB at 256 px). Keeps localStorage small until the backend
 * stores real files.
 */
export async function resizeImageToDataUrl(file, size = 256, quality = 0.85) {
  const bitmap = await loadImage(file)
  const side = Math.min(bitmap.width, bitmap.height)
  const sx = (bitmap.width - side) / 2
  const sy = (bitmap.height - side) / 2

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff' // transparent PNGs get a white background in JPEG
  ctx.fillRect(0, 0, size, size)
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, size, size)
  bitmap.close?.()
  return canvas.toDataURL('image/jpeg', quality)
}

async function loadImage(file) {
  if ('createImageBitmap' in window) return createImageBitmap(file)
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    return img
  } finally {
    URL.revokeObjectURL(url)
  }
}
