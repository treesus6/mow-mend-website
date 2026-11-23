import { MAX_RAW_PHOTO_BYTES, MAX_STORED_PHOTO_BYTES } from './validation.ts';
import type { CompressedPhotoPayload } from './firebase.ts';

function readFileAsImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Unable to read image file "${file.name}". Please choose a standard JPEG, PNG, or WebP photo.`));
    };
    img.src = objectUrl;
  });
}

export async function compressProjectPhoto(file: File, index: number): Promise<CompressedPhotoPayload> {
  if (!file.type.startsWith('image/')) {
    throw new Error(`"${file.name}" is not a supported image file.`);
  }
  if (file.size > MAX_RAW_PHOTO_BYTES) {
    throw new Error(`"${file.name}" exceeds the 5 MB raw file limit.`);
  }

  const img = await readFileAsImage(file);
  const maxDim = 1280;
  let width = img.naturalWidth || img.width;
  let height = img.naturalHeight || img.height;

  if (width > maxDim || height > maxDim) {
    const ratio = Math.min(maxDim / width, maxDim / height);
    width = Math.max(1, Math.round(width * ratio));
    height = Math.max(1, Math.round(height * ratio));
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Browser canvas is unavailable for photo optimization.');
  }
  ctx.drawImage(img, 0, 0, width, height);

  let quality = 0.82;
  let dataUrl = canvas.toDataURL('image/jpeg', quality);

  while (dataUrl.length > MAX_STORED_PHOTO_BYTES && quality > 0.4) {
    quality -= 0.12;
    dataUrl = canvas.toDataURL('image/jpeg', quality);
  }

  // If still slightly above limit on a dense photo, scale down dimensions once more
  if (dataUrl.length > MAX_STORED_PHOTO_BYTES) {
    const scaleCanvas = document.createElement('canvas');
    scaleCanvas.width = Math.round(width * 0.7);
    scaleCanvas.height = Math.round(height * 0.7);
    const sCtx = scaleCanvas.getContext('2d');
    if (sCtx) {
      sCtx.drawImage(canvas, 0, 0, scaleCanvas.width, scaleCanvas.height);
      dataUrl = scaleCanvas.toDataURL('image/jpeg', 0.72);
    }
  }

  if (dataUrl.length > 580_000) {
    throw new Error(`"${file.name}" is still too large after optimization. Please select a smaller photo.`);
  }

  const base64Part = dataUrl.split(',')[1] || '';
  const estimatedBytes = Math.min(490_000, Math.floor((base64Part.length * 3) / 4));
  const safeName = (file.name || `photo-${index + 1}.jpg`).replace(/[^\w.\- ]+/g, '_').slice(0, 120);

  return {
    photoId: `photo-${index + 1}-${Date.now().toString(36)}`,
    fileName: safeName,
    mimeType: 'image/jpeg',
    dataUrl,
    sizeBytes: Math.max(32, estimatedBytes),
  };
}
