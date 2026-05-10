import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/projects/beginner-cybertruck-jeep-design",
        destination: "/blog/3d-modelling",
        permanent: true,
      },
      {
        source: "/projects/gumball-machine-design",
        destination: "/blog/3d-modelling",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
