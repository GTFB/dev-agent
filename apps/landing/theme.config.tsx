import { DocsThemeConfig } from 'nextra-theme-docs'
import { ThemeToggle } from './components/ThemeToggle'

const config: DocsThemeConfig = {
  logo: <span>lnd-boilerplate</span>,
  navbar: {
    extraContent: <ThemeToggle />,
  },
  project: {
    link: 'https://github.com/GTFB/lnd-boilerplate',
  },
  docsRepositoryBase: 'https://github.com/GTFB/lnd-boilerplate',
  footer: {
    text: 'lnd-boilerplate - High-performance content platform starter kit',
  },
  useNextSeoProps() {
    return {
      titleTemplate: '%s – lnd-boilerplate'
    }
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="lnd-boilerplate" />
      <meta property="og:description" content="A starter kit for creating high-performance, interactive, and offline-capable content platforms" />
    </>
  )
}

export default config
