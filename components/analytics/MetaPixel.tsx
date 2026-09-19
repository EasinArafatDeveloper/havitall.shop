'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { FB_PIXEL_IDS, pageview } from '@/lib/fbpixel';

export default function MetaPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    pageview();
  }, [pathname, searchParams]);

  return (
    <>
      <Script
        id="meta-pixel-base"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            ${FB_PIXEL_IDS.map((id) => `fbq('init', '${id}');`).join('\n            ')}
          `,
        }}
      />
      <noscript>
        {FB_PIXEL_IDS.map((id) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={id}
            height={1}
            width={1}
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`}
            alt=""
          />
        ))}
      </noscript>
    </>
  );
}
