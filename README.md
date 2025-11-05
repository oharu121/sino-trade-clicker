# 🚀 Sino Trade Article View Manager

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?style=for-the-badge&logo=tailwind-css)

**A premium, modern web application for managing article view counts with advanced UI/UX**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Architecture](#-architecture) • [UI Design](#-ui-design-system)

</div>

---

## ✨ Features

### 🎯 Core Functionality
- **Multi-Channel Support** - Manage articles across different channels (深談總經, 產業大勢, 川普專題)
- **Intelligent Article Search** - Real-time searchable dropdown with keyboard navigation
- **Automated View Boosting** - Configurable view count automation with interval control
- **Real-Time Progress Monitoring** - Live metrics, stats, and activity logging
- **Smart Caching** - In-memory article caching to reduce API calls

### 💎 Premium UI/UX
- **Glassmorphism Design** - Modern frosted glass effects with backdrop blur
- **Gradient System** - Beautiful color gradients throughout the interface
- **Smooth Animations** - Fade-in, slide-in, scale, and shimmer effects
- **Dark Mode** - Comprehensive dark theme with smooth transitions
- **Micro-Interactions** - Hover effects, scale transforms, and shadow glows
- **Responsive Design** - Mobile-first approach with optimized touch targets (44x44px minimum)

### ♿ Accessibility
- **WCAG 2.1 AA Compliant** - Full accessibility support
- **Keyboard Navigation** - Complete keyboard control for all interactions
- **Screen Reader Support** - Proper ARIA labels and semantic HTML
- **Focus Management** - Clear focus indicators and logical tab order

---

## 🛠 Tech Stack

### Frontend Framework
- **[Next.js 16.0.1](https://nextjs.org/)** - React framework with App Router
- **[React 19.2.0](https://react.dev/)** - UI library with latest features
- **[TypeScript 5.x](https://www.typescriptlang.org/)** - Type-safe development

### Styling & UI
- **[TailwindCSS 4.x](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Geist Font](https://vercel.com/font)** - Modern typography by Vercel
- **Custom CSS Animations** - Keyframe animations for smooth transitions

### Development Tools
- **ESLint** - Code linting and quality checks
- **PostCSS** - CSS processing and optimization
- **Turbopack** - Fast build system (Next.js 16+)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or compatible runtime
- npm, yarn, pnpm, or bun package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sino-trade-clicker
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

### Run Tests & Linting

```bash
npm test
npm run lint
```

---

## 📁 Project Architecture

```
sino-trade-clicker/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with fonts
│   ├── page.tsx                 # Main application page
│   ├── globals.css              # Global styles & animations
│   ├── error.tsx                # Error boundary
│   ├── not-found.tsx            # 404 page
│   └── api/                     # API routes
│       ├── articles/route.ts    # Fetch articles endpoint
│       └── boost-view/route.ts  # Boost view endpoint
├── components/                   # React components
│   ├── ui/                      # Base UI components
│   │   ├── Button.tsx           # Premium button with gradients
│   │   ├── Input.tsx            # Enhanced form input
│   │   ├── Select.tsx           # Searchable dropdown
│   │   ├── ProgressBar.tsx      # Animated progress bar
│   │   └── Skeleton.tsx         # Loading placeholders
│   ├── TabSelector.tsx          # Channel tab navigation
│   ├── ArticleSelector.tsx      # Article search & select
│   ├── BoostControls.tsx        # Boost configuration form
│   └── ProgressMonitor.tsx      # Real-time progress display
├── hooks/                        # Custom React hooks
│   ├── useBoostOperation.ts     # Boost operation state
│   ├── useArticles.ts           # Article fetching logic
│   └── useAutoFocus.ts          # Auto-focus management
├── lib/                          # Utilities & services
│   ├── constants.ts             # App constants & channels
│   ├── types.ts                 # TypeScript definitions
│   ├── articleService.ts        # API service layer
│   └── utils/                   # Utility functions
└── tests/                        # Test files
```

---

## 🎨 UI Design System

### Color Palette

#### Brand Colors
- **Primary Blue**: `#2563eb` → `#3b82f6`
- **Indigo Accent**: `#4f46e5` → `#6366f1`
- **Gradients**: Blue-to-indigo throughout

#### Semantic Colors
- **Success**: Emerald gradient (`#10b981` → `#059669`)
- **Warning**: Amber gradient (`#f59e0b` → `#d97706`)
- **Error**: Red-to-rose gradient (`#ef4444` → `#f43f5e`)

#### Neutral Palette
- **Slate**: Modern, warmer grays for better contrast
- **Dark Mode**: Optimized with adjusted brightness

### Typography
- **Headings**: Geist Sans, 5xl-6xl, extrabold weights
- **Body**: Geist Sans, base size, medium weights
- **Monospace**: Geist Mono for timestamps and code

### Shadows & Depth
- **6-Level System**: xs, sm, md, lg, xl, 2xl
- **Color-Matched Glows**: Shadows match component colors
- **Glass Effects**: Backdrop blur with transparency

### Animations
- **Fade In**: 500ms ease-out entrance
- **Slide In**: 400ms lateral entrance with stagger
- **Scale**: 300ms scale effect for emphasis
- **Shimmer**: 2s infinite progress animation
- **Hover Effects**: 200ms scale transforms (1.02x)

### Spacing Scale
- **Mobile-First**: Optimized touch targets (44-48px)
- **Consistent Gaps**: 2, 4, 6, 8, 12, 16 spacing units
- **Vertical Rhythm**: Balanced section spacing

---

## 🏗 Component Architecture

### Base UI Components (`components/ui/`)
Reusable, accessible building blocks:
- **Button**: 3 variants (primary, secondary, danger) with gradients
- **Input**: Validation, error states, dark mode support
- **Select**: Searchable dropdown with keyboard nav
- **ProgressBar**: 4 variants, animated shimmer effect
- **Skeleton**: Loading states with pulse animation

### Feature Components (`components/`)
Application-specific components:
- **TabSelector**: Channel switching with gradient highlights
- **ArticleSelector**: Article search with error handling
- **BoostControls**: Form controls with validation
- **ProgressMonitor**: Real-time stats, logs, and visualization

### State Management
- **React Hooks**: Custom hooks for logic separation
- **Local State**: Component-level state with useState
- **Caching**: In-memory cache for performance

---

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file for environment-specific configuration:
```env
NEXT_PUBLIC_API_URL=your_api_url_here
```

### TailwindCSS Configuration
Custom theme in `app/globals.css`:
- CSS Variables for colors
- Custom animations and keyframes
- Dark mode media queries
- Responsive breakpoints

---

## 📊 Performance

- **Build Time**: ~15s optimized production build
- **Bundle Size**: Optimized with Next.js 16 Turbopack
- **Rendering**: Static generation where possible
- **Caching**: Smart article caching reduces API load
- **Animations**: GPU-accelerated transforms

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is proprietary software developed for Sino Trade.

---

## 🙏 Acknowledgments

- **Next.js Team** - Amazing framework
- **Vercel** - Geist font family
- **TailwindCSS** - Utility-first CSS
- **React Community** - Ecosystem and tools

---

<div align="center">

**Built with ❤️ using Next.js, React, and TailwindCSS**

© 2025 Sino Trade. All rights reserved.

</div>
