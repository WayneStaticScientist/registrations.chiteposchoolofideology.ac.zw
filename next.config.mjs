/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const apiOrigin =
      process.env.API_PROXY_TARGET ||
      process.env.NEXT_PUBLIC_API_ORIGIN ||
      "http://localhost:9991";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiOrigin.replace(/\/$/, "")}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
