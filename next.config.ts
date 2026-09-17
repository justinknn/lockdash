import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // These ship native bindings / wasm binaries that must be `require()`d
  // from node_modules at runtime rather than bundled — bundling breaks their
  // internal `__dirname`-relative asset loading (e.g. harfbuzzjs's hb.wasm).
  serverExternalPackages: ['@resvg/resvg-js', 'satori', 'harfbuzzjs', 'yoga-layout'],
};

export default nextConfig;
