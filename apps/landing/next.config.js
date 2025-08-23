const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx'
})

const { i18n } = require('./next-i18next.config.js')

module.exports = withNextra({
  // Next.js configuration
  reactStrictMode: true,
  swcMinify: true,
  
  // i18n configuration
  i18n,
  
  // Experimental features
  experimental: {
    appDir: false // Using pages directory for Nextra compatibility
  }
})
