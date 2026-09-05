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
    '10.194.76.197',
    '10.11.206.197',
    '192.168.42.1'
  ]
};

export default nextConfig;
