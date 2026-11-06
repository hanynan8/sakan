// app/apple-icon.jsx — أيقونة الموبايل (apple touch icon): اللوجو بخلفية شفافة
import { ImageResponse } from 'next/og';
import { getLogoDataUrl } from '@/lib/icon-logo';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default async function AppleIcon() {
  const logo = await getLogoDataUrl(180);
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} width={180} height={180} alt="" />
        ) : (
          <div style={{ fontSize: 110, fontWeight: 900, color: '#111' }}>س</div>
        )}
      </div>
    ),
    { ...size }
  );
}
