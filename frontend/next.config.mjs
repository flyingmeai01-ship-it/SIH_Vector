/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['idb'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
  allowedDevOrigins: [
    '192.168.129.28', 
    '10.194.76.197'
  ]
};

export default nextConfig;
