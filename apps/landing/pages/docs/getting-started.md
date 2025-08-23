---
layout: "docs"
title: "Getting Started"
description: "Quick start guide for lnd-boilerplate"
category: "Getting Started"
order: 1
---

# Getting Started

This guide will help you get up and running with lnd-boilerplate in minutes.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** 18.0 or later
- **Bun** 1.0 or later (recommended) or **npm** 8.0 or later
- **Git** for version control

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/lnd-boilerplate.git
   cd lnd-boilerplate
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.sample .env.local
   # Edit .env.local with your configuration
   ```

4. **Start the development server**
   ```bash
   bun run dev
   # or
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
lnd-boilerplate/
├── apps/
│   └── landing/          # Main Next.js application
│       ├── components/   # React components
│       ├── pages/        # Next.js pages
│       ├── styles/       # Global styles
│       └── lib/          # Utility libraries
├── packages/
│   ├── ui/              # Shared UI components
│   └── utils/           # Shared utilities
├── public/              # Static assets
│   └── admin/           # Sveltia CMS admin panel
└── dev/                 # Dev Agent CLI
```

## Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint
- `bun run type-check` - Run TypeScript type checking
- `bun run test` - Run tests
- `bun run test:coverage` - Run tests with coverage

## Next Steps

- [Component Development](/docs/components)
- [Content Management](/docs/cms)
- [Styling Guide](/docs/styling)
- [Deployment](/docs/deployment)

## Need Help?

- Check our [FAQ](/docs/faq)
- Join our [Discord community](https://discord.gg/lnd-boilerplate)
- Open an [issue on GitHub](https://github.com/your-username/lnd-boilerplate/issues)
