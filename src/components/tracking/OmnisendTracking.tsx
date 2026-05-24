"use client";

import Script from "next/script";

interface OmnisendTrackingProps {
  brandId: string;
}

export function OmnisendTracking({ brandId }: OmnisendTrackingProps) {
  if (!brandId) return null;

  return (
    <Script id="omnisend-tracking" strategy="lazyOnload">
      {`
        window.omnisend = window.omnisend || [];
        omnisend.push(["accountID", "${brandId}"]);
        omnisend.push(["track", "$pageViewed"]);
        !function(){var e=document.createElement("script");e.type="text/javascript",e.async=!0,e.src="https://omnisnippet1.com/inshop/launcher-v2.js";var t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t)}();
      `}
    </Script>
  );
}
