/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: true, // Bật chế độ strict của React
  // webpack(config) {
  //   // Thêm các cấu hình Webpack nếu cần
  //   return config;
  // },
};

module.exports = {
  reactStrictMode: false,  // Tắt React Strict Mode

  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true, // permanent: true sẽ trả mã trạng thái 308, còn false sẽ trả 307
      },
    ];
  },
}

export default nextConfig;
