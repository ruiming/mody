// Autocomplete name lists.
export const KNOWN_REQUEST_HEADERS = [
  'Accept', 'Accept-CH', 'Accept-CH-Lifetime', 'Accept-Encoding', 'Accept-Language', 'Accept-Patch',
  'Accept-Ranges', 'Access-Control-Request-Headers', 'Access-Control-Request-Method', 'Authorization',
  'Cache-Control', 'Connection', 'Content-DPR', 'Content-Encoding', 'Content-Length', 'Content-Type',
  'Cookie', 'Device-Memory', 'DNT', 'DPR', 'Date', 'Downlink', 'Expect', 'Forwarded', 'From', 'Host',
  'If-Match', 'If-Modified-Since', 'If-None-Match', 'If-Range', 'If-Unmodified-Since', 'Max-Forwards',
  'Origin', 'Pragma', 'Proxy-Authorization', 'Range', 'Referer', 'Save-Data', 'TE', 'Trailer',
  'Transfer-Encoding', 'Upgrade', 'Upgrade-Insecure-Requests', 'User-Agent', 'Via', 'Viewport-Width',
  'Warning', 'Width', 'X-Forwarded-For', 'X-Forwarded-Host', 'X-Forwarded-Proto',
  'Sec-CH-Prefers-Reduced-Motion', 'Sec-CH-UA', 'Sec-CH-UA-Arch', 'Sec-CH-UA-Bitness',
  'Sec-CH-UA-Full-Version', 'Sec-CH-UA-Full-Version-List', 'Sec-CH-UA-Mobile', 'Sec-CH-UA-Model',
  'Sec-CH-UA-Platform', 'Sec-CH-UA-Platform-Version', 'Sec-Fetch-Dest', 'Sec-Fetch-Mode',
  'Sec-Fetch-Site', 'Sec-Fetch-User', 'Sec-GPC', 'Sec-Purpose',
];

export const KNOWN_RESPONSE_HEADERS = [
  'Accept-Patch', 'Accept-Ranges', 'Access-Control-Allow-Credentials', 'Access-Control-Allow-Headers',
  'Access-Control-Allow-Methods', 'Access-Control-Allow-Origin', 'Access-Control-Expose-Headers',
  'Access-Control-Max-Age', 'Age', 'Allow', 'Alt-Svc', 'Connection', 'Content-Disposition',
  'Content-Encoding', 'Content-Language', 'Content-Length', 'Content-Location', 'Content-Range',
  'Content-Security-Policy', 'Content-Type', 'Date', 'ETag', 'Expires', 'Last-Modified', 'Link',
  'Location', 'Pragma', 'Proxy-Authenticate', 'Retry-After', 'Server', 'Set-Cookie',
  'Strict-Transport-Security', 'Timing-Allow-Origin', 'Tk', 'Trailer', 'Transfer-Encoding', 'Upgrade',
  'Vary', 'Via', 'WWW-Authenticate', 'Warning', 'X-Content-Type-Options', 'X-Frame-Options',
];

export const KNOWN_CSP_POLICIES = [
  'default-src', 'base-uri', 'child-src', 'connect-src', 'font-src', 'form-action', 'frame-ancestors',
  'frame-src', 'img-src', 'manifest-src', 'media-src', 'navigate-to', 'object-src', 'prefetch-src',
  'plugin-types', 'report-to', 'report-uri', 'require-sri-for', 'require-trusted-types-for', 'sandbox',
  'script-src', 'script-src-elem', 'script-src-attr', 'style-src', 'style-src-elem', 'style-src-attr',
  'trusted-types', 'worker-src', 'upgrade-insecure-requests', 'Sec-WebSocket-Accept',
];

export const KNOWN_REQUEST_HEADER_SET = new Set(KNOWN_REQUEST_HEADERS.map((h) => h.toLowerCase()));
export const KNOWN_RESPONSE_HEADER_SET = new Set(KNOWN_RESPONSE_HEADERS.map((h) => h.toLowerCase()));
