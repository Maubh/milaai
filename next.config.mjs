/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: new URL(".", import.meta.url).pathname,
  async redirects() {
    return [
      {
        source: "/onboarding/connect",
        destination: "/login/verify",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
