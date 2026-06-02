/** @type {import('next').NextConfig} */
// Static export for GitHub Pages. The CNAME (www.mirascapital.com) lives in
// public/ so it lands in the exported `out/` directory. Images are served
// unoptimized because Pages has no Next image server.
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  // Pin the workspace root — a stray parent lockfile otherwise confuses inference.
  turbopack: { root: __dirname },
}

module.exports = nextConfig
