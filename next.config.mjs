/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      // 登記簿謄本の画像アップロード用に上限を拡大
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
