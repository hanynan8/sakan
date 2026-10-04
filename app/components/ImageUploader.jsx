// path: app/components/ImageUploader.jsx
// رفع صور السكن: بيصغّر الصورة في المتصفح (max 1600px) ويرفعها لـ /api/upload.
'use client';

import { useRef, useState } from 'react';

const MAX_DIM = 1600;

async function compress(file) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error('JPG / PNG / WebP only');
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIM / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.82));
  if (!blob) throw new Error('compress failed');
  return blob;
}

export default function ImageUploader({ value, onChange, ar, max = 10 }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pick = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, max - value.length);
    e.target.value = '';
    if (!files.length) return;
    setError('');
    setBusy(true);
    const added = [];
    try {
      for (const f of files) {
        const blob = await compress(f);
        const fd = new FormData();
        fd.append('file', blob, 'photo.jpg');
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Upload failed');
        added.push(data.url);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      if (added.length) onChange([...value, ...added]);
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((url, i) => (
          <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-full h-full object-cover" />
            {i === 0 && <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] text-center">{ar ? 'الرئيسية' : 'Cover'}</span>}
            <button
              type="button"
              onClick={() => onChange(value.filter((u) => u !== url))}
              aria-label={ar ? 'حذف الصورة' : 'Remove image'}
              className="absolute top-0.5 end-0.5 w-5 h-5 rounded-full bg-black/70 text-white text-xs leading-5 text-center"
            >×</button>
          </div>
        ))}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={pick} />
      <button
        type="button"
        disabled={busy || value.length >= max}
        onClick={() => inputRef.current?.click()}
        className="px-4 py-2 text-sm font-semibold border border-gray-300 rounded hover:border-gray-500 disabled:opacity-50"
      >
        {busy ? (ar ? 'جارٍ الرفع...' : 'Uploading...') : (ar ? `إضافة صور (${value.length}/${max})` : `Add photos (${value.length}/${max})`)}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
