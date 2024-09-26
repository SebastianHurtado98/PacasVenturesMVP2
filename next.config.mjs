/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.wixstatic.com',
            }
        ]
    }
};

export default nextConfig;
