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
        destination: '/login',
        permanent: true,
      },
    ];
  },
}

export default nextConfig;
