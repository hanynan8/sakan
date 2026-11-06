// app/icon.jsx — أيقونة الموقع (favicon): اللوجو بخلفية شفافة وتيكست فاتح
import { ImageResponse } from 'next/og';
import { getLogoDataUrl } from '@/lib/icon-logo';

export const size = { width: 256, height: 256 };
export const contentType = 'image/png';

export default async function Icon() {
  const logo = await getLogoDataUrl(256);
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
          <img src={logo} width={256} height={256} alt="" />
        ) : (
          <div style={{ fontSize: 80, fontWeight: 900, color: '#111' }}>س</div>
        )}
      </div>
    ),
    { ...size }
  );
}
