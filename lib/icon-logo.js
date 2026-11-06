// lib/icon-logo.js — بيجهّز اللوجو كـ data URL (PNG) عشان يتحط في أيقونة الموقع.
// بيحوّل التيكست الغامق لأبيض ويكبّر اللوجو لأقصى حجم.
// الأولوية: ملف محلي public/logo.(png|jpg|jpeg|webp|svg) ← بعدين LOGO_URL من lib/brand.js
import fs from 'fs/promises';
import path from 'path';
import { LOGO_URL } from '@/lib/brand';

const LOCAL_NAMES = ['logo.png', 'logo.jpg', 'logo.jpeg', 'logo.webp', 'logo.svg'];

async function readLocal() {
  for (const name of LOCAL_NAMES) {
    try {
      return await fs.readFile(path.join(process.cwd(), 'public', name));
    } catch {}
  }
  return null;
}

// رابط LOGO_URL ده رابط لوحة تحكم Cloudinary (res-console) وغالباً مش بيرد للسيرفر.
// بنفك الـ public id منه ونبني رابط التوصيل العام (res.cloudinary.com) كأول محاولة.
function candidateUrls() {
  const urls = [];
  try {
    const m = LOGO_URL.match(/res-console\.cloudinary\.com\/([^/]+)\/thumbnails\/transform\/v1\/image\/upload\/[^/]+\/v\d+\/([^/]+)/);
    if (m) {
      const cloud = m[1];
      const publicId = Buffer.from(decodeURIComponent(m[2]), 'base64').toString('utf8');
      if (publicId) urls.push(`https://res.cloudinary.com/${cloud}/image/upload/f_png,w_256,h_256,c_fit/${publicId}`);
    }
  } catch {}
  urls.push(LOGO_URL);
  return urls;
}

async function readRemote() {
  for (const url of candidateUrls()) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'image/png,image/*' } });
      const type = res.headers.get('content-type') || '';
      if (res.ok && type.startsWith('image/')) return Buffer.from(await res.arrayBuffer());
    } catch {}
  }
  return null;
}

// 'cover' = اللوجو يملأ الأيقونة كلها (ممكن يقص أطرافه لو عريض) | 'contain' = اللوجو كامل بمسافة فاضية
const ICON_FIT = 'cover';

export async function getLogoDataUrl(px) {
  const raw = (await readLocal()) || (await readRemote());
  if (!raw) return null;
  try {
    const { default: sharp } = await import('sharp');
    const { data, info } = await sharp(raw, { density: 300 })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const { width, height } = info;

    // 1) أي بكسل غامق (التيكست الأزرق الغامق) يتحول لأبيض، والشفافية زي ما هي
    // 2) نحسب حدود اللوجو الفعلية عشان نشيل أي مسافة فاضية حواليه
    let minX = width, minY = height, maxX = -1, maxY = -1;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const a = data[i + 3];
        if (a === 0) continue;
        const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
        if (lum < 100) {
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
        }
        if (a > 16) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0) return null;

    // نكبّر اللوجو لأقصى حجم جوه الأيقونة (من غير تشويه)
    const png = await sharp(data, { raw: { width, height, channels: 4 } })
      .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
      .resize(px, px, { fit: ICON_FIT, position: 'centre', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    return `data:image/png;base64,${png.toString('base64')}`;
  } catch {
    return null;
  }
}
