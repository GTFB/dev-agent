const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx'
})

module.exports = withNextra({
  // Next.js configuration
  reactStrictMode: true,
  swcMinify: true,
  
  // Experimental features
  experimental: {
    appDir: false // Using pages directory for Nextra compatibility
  }
})
