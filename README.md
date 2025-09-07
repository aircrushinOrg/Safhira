# Safhira - Safe Sexual Health Education Platform

**Empowering young Malaysian adults aged 18-25 with stigma-free sexual health education, anonymous testing resources, and culturally sensitive support to combat rising STI rates.**

<div align="center">
  <img src="public/logo.svg" alt="Safhira Logo" width="120" height="120">
</div>

## 🌟 About Safhira

Safhira is a comprehensive sexual health education platform specifically designed for Malaysian youth. Built with cultural sensitivity and modern web technologies, it provides accessible, stigma-free education about sexually transmitted infections (STIs) through an interactive and user-friendly experience.

### Key Features

- **📚 Educational Content**: Comprehensive STI information with symptoms, prevention, and treatment
- **🗺️ Interactive Prevalence Maps**: 
  - Choropleth maps visualizing STI data across Malaysian states (2017-2022)
  - Real-time year slider with animated transitions
  - Color-coded intensity based on incidence rates
  - Hover tooltips with detailed state statistics
  - Zoom and pan functionality for detailed exploration
- **📈 Data Visualization**: 
  - Time series charts showing STI trends over time
  - Statistical summaries (highest, lowest, average rates)
  - Multi-disease comparison capabilities
- **💬 AI Chat Support**: Get personalized guidance and answers to health questions
- **📊 Interactive Quizzes (Under Development)**: Test knowledge with gamified learning experiences
- **🏥 Resource Directory (Under Development)**: Find testing centers and healthcare resources
- **🎨 Culturally Sensitive Design**: Interface designed with Malaysian youth in mind
- **🌙 Dark/Light Theme**: Comfortable viewing in any environment
- **📱 Responsive Design**: Optimized for mobile and desktop experiences
- **♿ Accessibility**: Built with inclusive design principles

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router and Server Components
- **Language**: TypeScript with strict type checking
- **Styling**: Tailwind CSS + Shadcn/ui + Radix UI components
- **Animations**: Framer Motion for smooth transitions
- **Charts**: Recharts for time series, React Simple Maps for choropleth visualizations
- **Theme**: Next Themes with system preference support
- **Icons**: Lucide React for consistent iconography
- **Fonts**: Geist font family for modern typography

### Backend & Database
- **Database**: PostgreSQL (supports Vercel Postgres, Neon, local instances)
- **ORM**: Drizzle ORM with full type safety and relation queries
- **Authentication**: Custom session management with expiration tracking
- **Migrations**: Drizzle Kit for automated schema versioning
- **Data Processing**: Server Actions for form handling and data mutations

### Development Tools
- **Package Manager**: pnpm for fast, efficient dependency management
- **Linting**: ESLint with Next.js and TypeScript configurations
- **Build Tool**: Next.js with Turbo mode for faster development
- **Code Quality**: Class Variance Authority for component variants
- **Development**: Sharp for optimized image processing

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- pnpm package manager
- PostgreSQL database (local or cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aircrushinOrg/safhira.git
   cd safhira
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment setup**
   
   Create a `.env.local` file:
   ```env
   DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require"
   ```

   **Database Options:**
   - **Vercel Postgres**: Create at [Vercel Dashboard](https://vercel.com/dashboard)
   - **Neon**: Free tier at [neon.tech](https://neon.tech/)
   - **Local PostgreSQL**: Set up local instance

4. **Database setup**
   ```bash
   # Generate migration files
   pnpm db:generate
   
   # Push schema to database
   pnpm db:push
   
   # Seed STI data (optional)
   pnpm db:studio  # Open Drizzle Studio to inspect
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
safhira/
├── app/                          # Next.js App Router
│   ├── actions/                # Server actions
│   ├── components/              # React components
│   │   ├── ui/                 # Shadcn/ui components
│   │   ├── landing/            # Landing page components
│   │   │   ├── BreakingStigmaSection.tsx # Anti-stigma messaging
│   │   │   ├── FeaturesSection.tsx      # Feature highlights
│   │   │   ├── FinalNoteSection.tsx     # Closing message
│   │   │   ├── HeroSection.tsx          # Main hero section
│   │   │   ├── PrevalenceSection.tsx    # STI data visualization
│   │   │   ├── STIChoroplethChart.tsx   # Interactive Malaysia map
│   │   │   └── STITrendsChart.tsx       # Time series charts
│   │   ├── Header.tsx          # Navigation header with mobile menu
│   │   ├── Footer.tsx          # Site footer
│   │   ├── AIChat.tsx          # AI chat interface
│   │   ├── LearningModules.tsx # Educational content (Under Development)
│   │   ├── QuizSection.tsx     # Interactive quizzes (Under Development)
│   │   ├── ResourcesSection.tsx # Healthcare resources (Under Development)
│   │   └── ThemeToggle.tsx     # Dark/light mode toggle
│   ├── chat/                   # AI chat pages
│   ├── stis/                   # STI information pages
│   │   ├── [sti]/page.tsx     # Dynamic STI detail pages
│   │   └── prevalence/page.tsx # Interactive prevalence maps
│   ├── providers/              # React context providers
│   ├── privacy-policy/         # Privacy policy page (Under Development)
│   ├── terms-of-use/          # Terms of use page (Under Development)
│   ├── rights/                # User rights page (Under Development)
│   ├── layout.tsx              # Root layout with theme provider
│   ├── page.tsx               # Landing page
│   ├── not-found.tsx          # 404 error page
│   ├── sitemap.ts             # SEO sitemap
│   ├── robots.ts              # SEO robots.txt
│   ├── globals.css            # Global Tailwind styles
│   └── db.ts                  # Database connection
├── constants/                   # App constants
│   └── sti-prevalence.ts      # STI types and state data
├── db/                          # Database layer
│   ├── schema.ts              # Drizzle schema definitions
│   └── migrations/            # Auto-generated migration files
├── lib/                        # Utility functions
│   └── utils.ts              # Tailwind utilities and helpers
├── public/                     # Static assets
│   ├── landing-hero-*.png    # Hero section images
│   ├── landing-my-map.json   # Malaysia GeoJSON data
│   └── *.svg                 # Various illustrations
└── README.md                 # This file
```

## 🎯 Development Commands

```bash
# Development
pnpm dev              # Start development server with turbo mode
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Database Operations
pnpm db:generate      # Generate Drizzle migration files
pnpm db:migrate       # Run database migrations
pnpm db:push          # Push schema changes directly to database
pnpm db:studio        # Open Drizzle Studio for database inspection
```

## 🗃️ Database Schema

### Core Tables

- **`sti_state`**: STI incidence data by Malaysian states, years, and disease types
  - Primary key: (date, state, disease)
  - Tracks cases and incidence rates per 100,000 population
  - Indexed on date, state, and disease for optimized queries
- **`sti_info`**: Comprehensive STI information database
  - Detailed symptoms, transmission methods, prevention strategies
  - Treatment options and Malaysian-specific context
  - Categorized by type (Bacterial/Viral/Parasitic) and severity

### Key Features

- **Type-safe queries** with Drizzle ORM
- **Automated migrations** with Drizzle Kit
- **Composite primary keys** for complex relationships
- **Strategic indexing** for optimized data retrieval
- **JSON-stored arrays** for flexible symptom and prevention data

## 🎨 Design System

### Colors
- **Primary**: Teal variants (#0d9488, #14b8a6)
- **Secondary**: Pink variants (#ec4899, #f472b6)

### Typography
- **Font Family**: Poppins (300, 400, 500, 600, 700)
- **Responsive Design**: Mobile-first approach
- **Component System**: Shadcn/ui with Radix primitives

## 🌐 Pages & Features

### 🏠 Landing Page (`/`)
- **Hero Section**: Animated imagery with feature highlights and call-to-action
- **Breaking Stigma Section**: Anti-stigma messaging with supportive tone
- **Prevalence Section**: Interactive STI data visualization for Malaysia
  - Choropleth map with state-by-state data (2017-2022)
  - Time series trends chart
  - Real-time statistics and comparisons
- **Features Section**: Platform capabilities overview
- **Final Note Section**: Encouraging closing message

### 💬 AI Chat (`/chat`)
- Interactive AI assistant for health questions
- Contextual responses about sexual health
- Anonymous and supportive environment
- Privacy-focused design

### 📊 STI Information (`/stis`)
- **Individual STI pages** (`/stis/[sti]`): Detailed information per STI including symptoms, transmission, treatment
- **Prevalence maps** (`/stis/prevalence`): Full-screen interactive visualization
  - Malaysian state data with zoom functionality
  - Multi-year comparison (2017-2022)
  - Disease-specific filtering (HIV, AIDS, Gonorrhea, Syphilis, Chancroid)
  - Statistical analysis tools

### 📚 Educational Content (Under Development)
- Interactive learning modules with cultural sensitivity
- Knowledge assessment quizzes
- Myth-busting sections
- Resource directory for healthcare access

### 📄 Legal & Privacy (Under Development)
- **Privacy Policy** (`/privacy-policy`): Data handling transparency
- **Terms of Use** (`/terms-of-use`): Platform usage guidelines
- **User Rights** (`/rights`): User empowerment and rights information

## 🔧 Configuration Files

- **`next.config.js`**: Next.js configuration
- **`tailwind.config.ts`**: Tailwind CSS customization
- **`drizzle.config.ts`**: Database configuration
- **`tsconfig.json`**: TypeScript configuration
- **`components.json`**: Shadcn/ui configuration

## 🤝 Contributing

We welcome contributions to improve Safhira! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Use TypeScript for all new code
- Follow the existing code style and conventions
- Write descriptive commit messages
- Test your changes thoroughly
- Update documentation as needed

<div align="center">
  <p><strong>Built with ❤️ for Malaysian youth sexual health education</strong></p>
  <p>🌟 <em>Breaking stigmas, building knowledge, creating safer communities</em> 🌟</p>
</div>