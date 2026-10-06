import type { NextConfig } from "next";
const nextConfig: NextConfig = { devIndicators: false, outputFileTracingIncludes:{'/course-files/*':['./content/course-files/**/*']} };
export default nextConfig;
