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

  env: {
    AUTH_SECRET: "+j3O32nVprgC2SuEbVVjJeeYaeAKV4qk1/qayd/bZos=",
    NEXTAUTH_URL: "http://bankings.vnrsoftware.vn",
  },

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
