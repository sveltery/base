import type { PageServerLoad } from './$types';

// Deliver CSP through the real local HTTP server. Synthetic response fulfillment
// loses Chromium's local address-space classification and breaks Vite HMR.
export const load: PageServerLoad = ({ url, setHeaders }) => {
  if (url.searchParams.get('csp') === 'nonce') {
    setHeaders({
      'content-security-policy':
        "style-src 'self' 'nonce-csp-nonce'; style-src-attr 'unsafe-inline'",
    });
  }
  return {};
};
