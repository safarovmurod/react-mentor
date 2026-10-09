import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  devIndicators: false,
  outputFileTracingIncludes: {'/course-files/*':['./content/course-files/**/*']},
  async headers() {
    return [{
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
