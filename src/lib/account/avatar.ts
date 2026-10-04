// Re-encode in the browser: no SVG/HTML or original image metadata is uploaded.
export async function prepareAvatar(file: File): Promise<Blob> {
  if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size>5*1024*1024) throw new Error('JPEG, PNG или WebP, до 5 МБ.');
  const bitmap=await createImageBitmap(file);
  try {
    if (!bitmap.width || !bitmap.height || bitmap.width*bitmap.height>40000000) throw new Error('Изображение слишком большое.');
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;
    const context=canvas.getContext('2d');if (!context) throw new Error('Не удалось обработать фото.');
    const side=Math.min(bitmap.width,bitmap.height);
    context.drawImage(bitmap,(bitmap.width-side)/2,(bitmap.height-side)/2,side,side,0,0,512,512);
    return await new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>blob ? resolve(blob):reject(new Error('Не удалось обработать фото.')),'image/webp',0.85));
  } finally {bitmap.close();}
}
