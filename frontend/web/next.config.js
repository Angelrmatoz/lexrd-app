module.exports = {
  reactStrictMode: true,
  output: "standalone",
  transpilePackages: ["@repo/ui"],
  async redirects() {
    return [
      {
        source: "/documentos-oficiales",
        destination: "/official-documents",
        permanent: true,
      },
    ];
  },
  webpack: (config, { dev }) => {
    // Configuración para que el Hot Reload funcione en Docker (Windows/Mac)
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Transform all direct `react-native` imports to `react-native-web`
      "react-native$": "react-native-web",
    };
    config.resolve.extensions = [
      ".web.js",
      ".web.jsx",
      ".web.ts",
      ".web.tsx",
      ...config.resolve.extensions,
    ];
    return config;
  },
};
