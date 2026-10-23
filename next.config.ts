import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  devIndicators: false,
  outputFileTracingIncludes: {'/course-files/*':['./content/course-files/**/*']},
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Content-Security-Policy', value: "frame-ancestors 'self'; object-src 'none'; base-uri 'self'" },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    }, {
      source: '/api/:path*',
      headers: [{ key: 'Cache-Control', value: 'no-store' }],
    }, {
      source: '/answers/export',
      headers: [{ key: 'Content-Security-Policy', value: "sandbox; default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'" }],
    }, {
      source: '/practice-local-global.html',
      headers: [
        // The original user-authored HTML executes scripts only in an opaque sandbox.
        { key: 'Content-Security-Policy', value: "sandbox allow-scripts; default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: https:; connect-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'" },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
      ],
    }];
  },
};
export default nextConfig;
