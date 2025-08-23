### **Technical Specification: lnd-boilerplate**

### **1. Introduction**

#### **1.1. Purpose**
This document defines the architectural, functional, and non-functional requirements for the **lnd-boilerplate** software product. It is a starter kit for creating high-performance, interactive, and offline-capable content platforms.

#### **1.2. Product Philosophy**
`lnd-boilerplate` is a foundation for building websites where User Experience (UX), Developer Experience (DX), and performance are top priorities. The product implements an **Offline-First** philosophy, providing users with uninterrupted access to content regardless of network connection quality.

### **2. Technology Stack**

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Development Environment** | Bun, Cursor, GitHub | Ensuring a high-performance local development workflow and version control. |
| **Tooling** | `dev-agent` (subtree) | Standardizing and automating Git processes and task management. |
| **Framework** | Next.js, Nextra | Hybrid rendering (SSG/ISR), file-based routing, and optimization for MDX content. |
| **UI & Styling** | Tailwind CSS, Shadcn/UI | A utility-first CSS framework and a composable, customizable component library. |
| **Animation & Icons** | Framer Motion, lucide-react | Declarative animations and a vast set of lightweight, customizable SVG icons. |
| **Content Management** | Sveltia CMS (Git-based) | A UI for managing MDX content that commits directly to the Git repository. |
| **Authentication** | Next-auth.js | Session management, authentication via OAuth, and other providers. |
| **Server State Management**| @tanstack/react-query | Caching, background synchronization, and management of server-side data. |
| **PWA & Offline** | `next-pwa`, Dexie.js | Transforming the site into a Progressive Web App and managing the local IndexedDB database. |
| **Search** | Typesense | A high-performance, fault-tolerant search engine with typo tolerance. |
| **Interactivity** | Giscus, React Email | A comment system based on GitHub Discussions and creating email templates with React. |
| **Dashboards** | Tremor | A component library for rapidly building informative dashboards. |
| **Observability** | GlitchTip, Plausible | Real-time error tracking and privacy-focused web analytics. |

### **3. Architecture and File Structure**

The project is built as a monorepo managed by Turborepo to ensure maximum code reusability.

```
/lnd-boilerplate/
├── apps/
│   └── landing/               # The main Next.js/Nextra application
│       ├── components/        # Landing-specific React components
│       ├── lib/               # Client-side utilities, Dexie DB instance, React Query client
│       ├── public/            # Static assets for the PWA (icons, manifest.webmanifest)
│       ├── pages/             # All routing and content
│       │   ├── api/           # API Routes (Next-auth, Typesense sync)
│       │   ├── _meta.json     # Nextra sidebar configuration
│       │   ├── index.mdx      # Homepage
│       │   ├── blog/          # Blog section (example)
│       │   └── docs/          # Docs section (example)
│       ├── styles/            # Global styles (tailwind.css, globals.css)
│       └── theme.config.tsx   # Nextra theme configuration (logo, footer, i18n menu)
│
├── dev/                       # Tooling (dev-agent subtree)
│
├── packages/                  # Reusable libraries
│   ├── ui/                    # Design System
│   │   └── src/
│   │       ├── components/    # Base Shadcn components (Button, Card, etc.)
│   │       └── marketing/     # High-level blocks (Hero, Features, CTA)
│   └── utils/                 # Common utilities (formatters, hooks)
│
└── public/                    # Global public folder
    ├── admin/                 # Static files for the Sveltia CMS admin panel
    └── locales/               # Localization files (en/common.json, es/common.json)
```

### **4. Key Functional Requirements**

#### **4.1. Internationalization (i18n)**
*   Support for multiple languages via `next-i18next` or an equivalent library.
*   All UI strings must be externalized into localization files (e.g., `public/locales/en/common.json`).
*   Automatic support for RTL (Right-to-Left) layouts for languages like Arabic.
*   Content localization in `.mdx` files via file structure (e.g., `pages/blog/my-post.en.mdx`, `pages/blog/my-post.es.mdx`).

#### **4.2. PWA & Offline Mode**
*   The site must be installable on devices (PWA).
*   **App Shell Caching:** The application shell (HTML, CSS, JS) must be cached by a Service Worker for instant loading in offline mode.
*   **Content Caching:** Pages and their data (text, images) visited by the user must be saved to IndexedDB (via Dexie) for offline reading.
*   **Background Sync:** Actions performed offline (e.g., submitting a comment) must be saved locally and sent to the server when the connection is restored.

#### **4.3. Search**
*   Integration with Typesense for instant search across all site content.
*   The search must support typo tolerance, faceted search, and custom relevance.
*   The search UI should be implemented as a modal window or a dedicated page.

#### **4.4. Design System**
*   **Theming:** Support for light and dark themes with a user-facing toggle.
*   **Reusable Blocks:** The `packages/ui/marketing` directory must contain ready-to-use, customizable React components for common sections (`<HeroBlock />`, `<FeatureGrid />`, `<CallToAction />`).
*   **Relational Content:** Implement the ability to link entities (e.g., "author" and "post") through MDX frontmatter and Sveltia CMS configurations.

### **5. Non-Functional Requirements**

*   **Performance:** The target Google Lighthouse score must be 95 or higher across all categories.
*   **Accessibility (a11y):** Compliance with WCAG 2.1 standards. All interactive components must be keyboard-accessible.
*   **SEO:** Automatic generation of `sitemap.xml`, `robots.txt`, and out-of-the-box support for Open Graph / Twitter Cards.

### **6. Build and Initialization Plan**

The project will be built in stages, from foundation to advanced features.

#### **Phase 1: Foundation and Structure**
1.  **Monorepo Initialization:** Set up Turborepo with Bun Workspaces.
2.  **Structure Creation:** Create all folders and base configuration files according to the schema.
3.  **Tooling Setup:** Integrate `dev-agent` as a subtree. Configure ESLint, Prettier, and Husky.
4.  **Base Application:** Initialize the `apps/landing` application with Next.js and Nextra. Achieve a successful build and run.

#### **Phase 2: Design System and Content**
1.  **UI Setup:** Integrate Tailwind CSS. Install `lucide-react`. Begin populating `packages/ui` with base Shadcn components.
2.  **Theming:** Implement the light/dark theme switcher.
3.  **CMS Integration:** Configure Sveltia CMS to manage content in `pages/blog`.
4.  **Marketing Blocks Development:** Create the first components in `packages/ui/marketing`.

#### **Phase 3: Advanced Features**
1.  **Internationalization (i18n):** Configure the localization library and add RTL support.
2.  **Search:** Deploy a Typesense instance. Implement the indexing script and the search UI.
3.  **Authentication:** Configure `Next-auth.js` with one or two providers.
4.  **Community:** Integrate Giscus into blog pages.

#### **Phase 4: Offline Mode and PWA**
1.  **PWA Setup:** Integrate `next-pwa` to generate the Service Worker and App Manifest.
2.  **Dexie Setup:** Initialize the local database.
3.  **React Query Integration:** Configure `QueryClient` and create custom hooks that use Dexie as a persistent cache layer.
4.  **Offline Testing:** Conduct thorough testing of all offline scenarios.

#### **Phase 5: Observability and CI/CD**
1.  **Monitoring Integration:** Add GlitchTip and Plausible to the application.
2.  **CI/CD Setup:** Create a workflow in `.github/workflows/` for automated testing, building, and deployment to Vercel/Netlify.