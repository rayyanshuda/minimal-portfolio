import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/projects/beginner-cybertruck-jeep-design",
        destination: "/blog/3d-modelling/cybertruck-jeep",
        permanent: true,
      },
      {
        source: "/projects/gumball-machine-design",
        destination: "/blog/3d-modelling/gumball-machine",
        permanent: true,
      },
      {
        source: "/blog/my-machine-learning-journey",
        destination: "/blog/machine-learning",
        permanent: true,
      },
      {
        source: "/blog/my-machine-learning-journey/:slug",
        destination: "/blog/machine-learning/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
