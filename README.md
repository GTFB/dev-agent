# lnd-boilerplate

A starter kit for creating **high-performance**, **interactive**, and **offline-capable** content platforms.

## 🚀 What is lnd-boilerplate?

`lnd-boilerplate` is a foundation for building websites where User Experience (UX), Developer Experience (DX), and performance are top priorities. The product implements an **Offline-First** philosophy, providing users with uninterrupted access to content regardless of network connection quality.

## ✨ Key Features

- **Next.js + Nextra** - Hybrid rendering (SSG/ISR) with file-based routing
- **TypeScript** - Full type safety across the entire application
- **Tailwind CSS + Shadcn/UI** - Utility-first CSS with composable components
- **PWA Support** - Progressive Web App with offline capabilities
- **Internationalization** - Multi-language support with RTL layouts
- **Search Integration** - Typesense-powered search with typo tolerance
- **Authentication** - Next-auth.js with OAuth providers
- **Content Management** - Git-based CMS with Sveltia

## 🏗️ Architecture

Built as a monorepo managed by **Turborepo** to ensure maximum code reusability:

```
/lnd-boilerplate/
├── apps/
│   └── landing/               # Main Next.js/Nextra application
├── packages/
│   ├── ui/                    # Design system and reusable components
│   └── utils/                 # Common utilities and hooks
└── dev/                       # Tooling (dev-agent subtree)
```

## 🚦 Getting Started

### Prerequisites

- **Node.js** 18.0.0 or higher
- **Bun** 1.0.0 or higher (recommended package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/GTFB/lnd-boilerplate.git
   cd lnd-boilerplate
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Start development server**
   ```bash
   bun run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

- [Technical Specification](./TECH_SPEC.md) - Detailed technical requirements
- [Getting Started](./apps/landing/pages/getting-started.mdx) - Setup and configuration
- [Features](./apps/landing/pages/features.mdx) - Detailed feature overview
- [Advanced](./apps/landing/pages/advanced.mdx) - Advanced usage and customization
- [API Reference](./apps/landing/pages/api.mdx) - Component and utility documentation

## 🛠️ Development

### Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build all packages and applications
- `bun run lint` - Run ESLint across all packages
- `bun run format` - Format code with Prettier
- `bun run test` - Run tests across all packages
- `bun run type-check` - Run TypeScript type checking

### Package Structure

- **`apps/landing`** - Main Next.js application with Nextra
- **`packages/ui`** - Reusable React components and design system
- **`packages/utils`** - Common utilities, hooks, and helper functions

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Run quality checks: `bun run lint && bun run type-check`
4. Commit your changes: `git commit -m "feat: add your feature"`
5. Push and create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Nextra](https://nextra.site/) - Documentation framework
- [Turborepo](https://turbo.build/) - Monorepo build system
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Shadcn/ui](https://ui.shadcn.com/) - Component library
