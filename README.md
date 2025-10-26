# 🚀 Multi-User Blogging Platform

A modern, full-stack blogging platform built with **Next.js 15**, **tRPC**, **PostgreSQL**, **Drizzle ORM**, and **TypeScript**.  
It features a clean, responsive UI, Markdown support, category management, and an intuitive admin dashboard.

🟢 **Live Demo:** [https://blogging-platform-umber-omega.vercel.app](https://blogging-platform-umber-omega.vercel.app)

---

## ✨ Key Features

### 📝 Blogging
- 🖊️ **Full CRUD** — Create, edit, and delete blog posts  
- 🏷️ **Category Management** — Assign and organize posts into multiple categories  
- 💾 **Draft & Publish** — Save drafts, publish when ready  
- 🧾 **Markdown Editor** — Write and preview posts with Markdown  
- 🖼️ **Cover Images** — Upload and display post thumbnails  
- 🔍 **Category Filtering** — Filter posts by category on the blog page  
- 🔍 **Server-Side Search** — Real-time search across titles, content, and authors (paginated)  
- 📄 **Real Pagination** — Browse posts across multiple pages with accurate total counts  
- ⚡ **Instant Updates** — Type-safe, real-time API via tRPC  

### 🎨 Design
- 🌈 Clean, modern interface using **Tailwind CSS v4** and **shadcn/ui**  
- 🌙 **Dark Mode** — Toggle between light and dark themes (via next-themes)  
- 📱 Fully responsive — Works seamlessly on desktop, tablet, and mobile  
- 🧭 Intuitive navigation and dashboard  
- 🧩 Reusable, modular components  

### 🔍 SEO & Metadata
- 🏷️ **OpenGraph & Twitter Cards** — Every post includes social sharing metadata  
- 🔗 **Canonical URLs** — Avoid duplicate content indexing  
- 🏷️ **Article Tags** — Per-post category metadata for better discovery  

### 👨‍💻 Developer Experience
- 💎 Type-safe database queries with **Drizzle ORM**  
- 🛡️ Validation powered by **Zod**  
- 🚀 Hot reload with **Turbopack**  
- 📦 Consistent formatting (Prettier) and linting (ESLint)  
- 🪝 Git hooks with **Husky** and **lint-staged**  

---

## 🛠️ Tech Stack

**Frontend**
- [Next.js 15](https://nextjs.org/) — React framework (App Router)  
- [React 19](https://react.dev/)  
- [Tailwind CSS v4](https://tailwindcss.com/)  
- [shadcn/ui](https://ui.shadcn.com/) — Accessible UI components  
- [Lucide Icons](https://lucide.dev/)  
- [React Markdown](https://github.com/remarkjs/react-markdown)  

**Backend**
- [tRPC 11.6](https://trpc.io/) — End-to-end type-safe APIs  
- [Zod](https://zod.dev/) — Input validation  
- [Next.js API Routes](https://nextjs.org/docs/app/api-reference/file-conventions/route)  

**Database**
- [PostgreSQL](https://www.postgresql.org/) — Relational database  
- [Neon](https://neon.tech/) — Serverless PostgreSQL hosting  
- [Drizzle ORM](https://orm.drizzle.team/) — Type-safe ORM  
- [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview) — Migrations  

**State & Data**
- [TanStack Query 5](https://tanstack.com/query) — Data fetching and caching (integrated via tRPC)  
- [Zustand](https://github.com/pmndrs/zustand) — Client-side UI state management (persisted preferences)  
- [SuperJSON](https://github.com/blitz-js/superjson) — Serialization  

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/DARSHAN2224/blogging-platform.git
cd blogging-platform
```

### 2️⃣ Install Dependencies
```bash
pnpm install
```

### 3️⃣ Environment Setup
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
DATABASE_URL="postgresql://user:password@ep-xxxxx.region.aws.neon.tech/dbname?sslmode=require"
```

### 4️⃣ Run Database Migrations
```bash
pnpm db:migrate
```

### 5️⃣ (Optional) Seed Database
```bash
pnpm db:seed
```

### 6️⃣ Start the Development Server
```bash
pnpm dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📁 Project Structure

```bash
src/
├── app/
│   ├── blog/               # Blog listing & individual posts
│   ├── dashboard/          # Admin dashboard
│   ├── api/trpc/           # tRPC API handler
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── server/
│   ├── api/
│   │   ├── routers/
│   │   │   ├── post.ts     # Post CRUD routes
│   │   │   └── category.ts # Category CRUD routes
│   │   └── trpc.ts         # tRPC configuration
│   ├── db/
│   │   ├── schema.ts       # Database schema
│   │   ├── migrate.ts      # Migration runner
│   │   ├── seed.ts         # Seeder
│   │   └── index.ts        # DB connection
│   └── utils/slugify.ts    # Slug generator
├── components/             # UI components
├── lib/                    # tRPC client & helpers
└── types/                  # TypeScript definitions
```

---

## 🧭 tRPC Router Overview

The API layer is structured with clear, type-safe routers using tRPC and Zod validation.

- `src/server/api/routers/post.ts`
  - Queries:
    - `getAll({ published?, categoryIds?, search?, page?, limit? })` — list posts; filter by published, categories, and search (title/content/author); paginated (returns `{items,total,page,limit}`)
    - `getRecent({ limit?, published? })` — latest posts for homepage/sidebars; includes `author`
    - `getBySlug({ slug })` — fetch a single post by slug with categories
    - `getById({ id })` — fetch a single post by id with categories and `categoryIds`
    - `getCounts()` — returns `{total, published, draft}` — dashboard-wide exact counts
  - Mutations:
    - `create({ title, content, author?, published, categoryIds?, coverImageUrl? })`
    - `update({ id, title?, content?, author?, published?, categoryIds?, coverImageUrl? })`
    - `delete({ id })`
    - `togglePublished({ id })`

- `src/server/api/routers/category.ts`
  - Queries:
    - `getAll()` — list categories
    - `getBySlug({ slug })` — fetch category by slug
    - `getById({ id })` — fetch category by id
    - `getByPostId({ postId })` — list categories for a given post
  - Mutations:
    - `create({ name, description? })`
    - `update({ id, name?, description? })`
    - `delete({ id })`

Routers are composed in `src/server/api/root.ts` and exposed via the Next.js route handler in `src/app/api/trpc/[trpc]/route.ts`. Client hooks are created in `src/lib/trpc/client.ts` and used across the app for type-safe queries and mutations.

---

##  Scripts

```bash
pnpm dev          # Run in development
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Lint code
pnpm format       # Format with Prettier
pnpm db:migrate   # Run migrations
pnpm db:seed      # Seed database
```

---

## 🌐 Deployment

**Platform:** [Vercel](https://vercel.com)  
**Live URL:** [https://blogging-platform-umber-omega.vercel.app](https://blogging-platform-umber-omega.vercel.app)

### Deploy Steps
1. Push the repo to GitHub  
2. Import the project into Vercel  
3. Add the environment variable:
   ```env
   DATABASE_URL="your-neon-connection-string"
   ```
4. Click **Deploy** 🎉  

---

## ✅ Features Implemented

### Priority 1 - Core Requirements (Must Have)
- ✅ Blog post CRUD operations (create, read, update, delete)
- ✅ Category CRUD operations  
- ✅ Assign one or more categories to posts
- ✅ Blog listing page showing all posts
- ✅ Individual post view page
- ✅ Category filtering on listing page
- ✅ Basic responsive navigation
- ✅ Clean, professional UI using Tailwind CSS v4 and shadcn/ui

### Priority 2 - Expected Features (Should Have)
- ✅ Dashboard page for managing posts
- ✅ Draft vs Published post status
- ✅ Loading and error states
- ✅ Mobile-responsive design
- ✅ Content editor (Markdown support with preview)

### Priority 3 - Bonus Features (Nice to Have)
- ✅ Search functionality for posts (server-side, paginated)
- ✅ Post statistics (word count, reading time)
- ✅ Dark mode support
- ✅ Image upload for posts (cover images)
- ✅ SEO meta tags (OpenGraph, Twitter cards, canonical URLs, article tags)
- ✅ Pagination (real server-side pagination with accurate counts)

### Additional Features
- ✅ Multi-category filtering with searchable UI
- ✅ Recent posts sidebar
- ✅ Dashboard with accurate post counts (total, published, draft)
- ✅ Author attribution per post
- ✅ Slug generation for posts and categories
- ✅ Type-safe end-to-end API with tRPC and Zod validation

---

## 🎯 Trade-offs & Decisions

### Technology Choices
- **Markdown over Rich Text Editor**: Chose markdown for faster implementation and better developer experience. Saves 2-3 hours while still providing full formatting capabilities.
- **shadcn/ui Component Library**: Used pre-built accessible components to accelerate UI development by 3-4 hours while maintaining quality.
- **Neon PostgreSQL**: Serverless PostgreSQL hosting eliminates infrastructure setup, saving ~1 hour.
- **No Authentication**: Per assessment requirements, focused on core blogging features rather than auth system.

### Architecture Decisions
- **tRPC for API Layer**: End-to-end type safety eliminates API contract mismatches and provides excellent DX.
  - **Custom Middleware**: Implemented logging middleware for request monitoring and sanitization middleware for input trimming.
- **Drizzle ORM**: Type-safe database queries with excellent TypeScript integration; lighter than Prisma.
- **TanStack Query via tRPC**: Automatic caching and optimistic updates for better UX without manual state management.
  - **Optimistic Updates**: Implemented on all mutations (create/update/delete/toggle) for instant UI feedback with automatic rollback on errors.
- **Server-Side Search & Pagination**: Implemented for scalability; handles large datasets efficiently.
- **Many-to-Many Categories**: Posts can have multiple categories for flexible content organization.
- **Zustand for UI State**: Small, persistent store for client-side UI preferences (editor preview toggle, layout preferences); complements React Query's server state management.

### Performance Considerations
- **Database Indexing**: Slugs are used for SEO-friendly URLs and fast lookups.
- **Pagination**: Server-side pagination with configurable limits prevents loading all posts at once.
- **React Query Caching**: tRPC integration provides automatic caching and background refetching.
- **Optimistic Updates**: Immediate UI feedback on mutations (create/update/delete/toggle) with automatic error rollback.
- **React.memo**: Memoized expensive components (`CategoryFilter`, `MainLayout`) to reduce unnecessary re-renders.
- **Minimal `any` Usage**: Type-safe codebase with narrow type casts only where required by Drizzle's query builder.

---

## ⏱️ Time Spent

**Total Development Time**: ~14 hours

- Day 1-2 (4h): Project setup, database schema, tRPC routers, core CRUD operations
- Day 3-4 (5h): Frontend pages (blog listing, post view, forms), category management, filtering
- Day 5-6 (3h): Dashboard, published/draft status, loading states, mobile responsiveness
- Day 7 (2h): Enhancements (dark mode, SEO tags, server-side search, pagination, optimistic updates), deployment, documentation

---

## 🆕 Recent Upgrades (Oct 2025)

### Core Features
- ✅ **Server-side search** — Search posts by title, content, or author across all pages with pagination
- ✅ **Real pagination** — Frontend pagination controls with accurate total counts, server-side filtering
- ✅ **Dashboard counts** — Dashboard displays exact total, published, and draft post counts
- ✅ **Optimistic updates** — Immediate UI feedback on all mutations (create/update/delete/toggle) with automatic error rollback
- ✅ **tRPC middleware** — Custom logging and input sanitization middleware for request monitoring and validation
- ✅ **Dark mode** — Light/dark theme toggle integrated via next-themes
- ✅ **SEO enhancements** — OpenGraph, Twitter cards, canonical URLs, and per-post category tags
- ✅ **Multi-category filter** — Select multiple categories, searchable UI
- ✅ **Recent blogs sidebar** — Shows latest published posts
- ✅ **Enhanced API** — Author field included in all post queries

### Code Quality & Performance
- ✅ **Zustand store** — Persistent UI preferences (editor preview toggle, layout settings) in `src/store/uiStore.ts`
- ✅ **React.memo** — Memoized `CategoryFilter` and `MainLayout` components for optimal rendering
- ✅ **Type safety improvements** — Reduced `any` usage across codebase; added strict typing to all client components
- ✅ **Type-safe interfaces** — Centralized TypeScript definitions in `src/types/index.ts`
- ✅ **Clean build** — Zero TypeScript/ESLint errors; production build passes with only Next.js image optimization warnings

These changes align with the assessment requirements and design specifications.

---

## 🤝 Contributing

Contributions are always welcome!  
Please open an issue or submit a pull request if you’d like to help improve the project.

---

## 📝 License

This project is licensed under the **MIT License**.

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)  
- Components from [shadcn/ui](https://ui.shadcn.com/)  
- Database hosted on [Neon](https://neon.tech/)  
- Icons by [Lucide](https://lucide.dev/)

---

<div align="center">
  <b>Made with ❤️ using Next.js 15 + tRPC + Drizzle ORM</b><br/>
  ⭐ Star this repo • 🐛 Report Bug • ✨ Request Feature
</div>
