const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx'
})

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

const { i18n } = require('./next-i18next.config.js')

module.exports = withPWA(withNextra({
  // Next.js configuration
  reactStrictMode: true,
  swcMinify: true,
  
  // i18n configuration
  i18n,
  
  // Experimental features
  experimental: {
    appDir: false // Using pages directory for Nextra compatibility
  }
}))
