# Safhira - Safe Sexual Health Education Platform

**Empowering young Malaysian adults aged 18-25 with stigma-free sexual health education, anonymous testing resources, and culturally sensitive support to combat rising STI rates.**

<div align="center">
  <img src="public/logo.svg" alt="Safhira Logo" width="120" height="120">
</div>

## 🌟 About Safhira

Safhira is a comprehensive sexual health education platform specifically designed for Malaysian youth. Built with cultural sensitivity and modern web technologies, it provides accessible, stigma-free education about sexually transmitted infections (STIs) through an interactive and user-friendly experience.

### Key Features

- **📚 Educational Content**: Comprehensive STI information with symptoms, prevention, and treatment
- **🗺️ Interactive Prevalence Maps**: Visualize STI data across Malaysian states using choropleth maps
- **💬 AI Chat Support**: Get personalized guidance and answers to health questions
- **📊 Interactive Quizzes**: Test knowledge with gamified learning experiences
- **🏥 Resource Directory**: Find testing centers and healthcare resources
- **🎨 Culturally Sensitive Design**: Interface designed with Malaysian youth in mind
- **🌙 Dark/Light Theme**: Comfortable viewing in any environment

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui + Radix UI
- **Animations**: Framer Motion
- **Charts**: Recharts, React Simple Maps
- **Theme**: Next Themes with system preference support

### Backend & Database
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with type-safe operations
- **Authentication**: Custom session management
- **Migrations**: Drizzle Kit for schema management

### Development Tools
- **Package Manager**: pnpm
- **Linting**: ESLint with Next.js configuration
- **TypeScript**: Strict type checking
- **Build Tool**: Next.js with Turbo mode

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
│   ├── components/              # React components
│   │   ├── ui/                 # Shadcn/ui components
│   │   ├── landing/            # Landing page sections
│   │   ├── Header.tsx          # Navigation header
│   │   ├── Footer.tsx          # Site footer
│   │   ├── LearningModules.tsx # Educational content
│   │   ├── QuizSection.tsx     # Interactive quizzes
│   │   └── AIChat.tsx          # AI chat interface
│   ├── chat/                   # AI chat pages
│   │   ├── page.tsx           # Main chat interface
│   │   └── about/page.tsx     # Chat information
│   ├── stis/                   # STI information pages
│   │   ├── [sti]/page.tsx     # Dynamic STI pages
│   │   ├── prevalence/page.tsx # Prevalence maps
│   │   └── prevention/page.tsx # Prevention guides
│   ├── constants/              # App constants
│   │   └── sti-prevalence.ts  # STI data constants
│   ├── layout.tsx              # Root layout
│   ├── page.tsx               # Home page
│   └── globals.css            # Global styles
├── db/                          # Database layer
│   ├── schema.ts              # Database schema
│   ├── migrations/            # Migration files
│   ├── data/                  # Seed data
│   ├── seed-sti-data.ts      # STI state data seeder
│   └── seed-sti-info.ts      # STI information seeder
├── lib/                        # Utility functions
│   └── utils.ts              # Helper functions
├── public/                     # Static assets
│   ├── logo.svg              # Application logo
│   ├── landing-*.png         # Landing page images
│   └── *.svg                 # Illustrations
├── docs/                      # Documentation
├── CLAUDE.md                  # AI assistant instructions
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

- **`sti_state`**: STI prevalence data by Malaysian states
- **`sti_info`**: Comprehensive STI information including symptoms, transmission, and treatment

### Key Features

- **Type-safe queries** with Drizzle ORM
- **Automated migrations** with Drizzle Kit
- **Composite primary keys** for complex relationships
- **Indexed columns** for optimized queries

## 🎨 Design System

### Colors
- **Primary**: Teal variants (#0d9488, #14b8a6)
- **Secondary**: Pink variants (#ec4899, #f472b6)
- **Gradients**: 
  - Light: `from-pink-50 via-white to-teal-50`
  - Dark: `from-gray-900 via-gray-800 to-gray-900`

### Typography
- **Font Family**: Poppins (300, 400, 500, 600, 700)
- **Responsive Design**: Mobile-first approach
- **Component System**: Shadcn/ui with Radix primitives

## 🌐 Pages & Features

### 🏠 Landing Page (`/`)
- Hero section with call-to-action
- Stigma-breaking messaging
- Interactive prevalence section
- Feature highlights
- Educational modules navigation

### 💬 AI Chat (`/chat`)
- Interactive AI assistant for health questions
- Contextual responses about sexual health
- Anonymous and supportive environment

### 📊 STI Information (`/stis`)
- **Individual STI pages** (`/stis/[sti]`): Detailed information per STI
- **Prevalence maps** (`/stis/prevalence`): Interactive Malaysian state data
- **Prevention guides** (`/stis/prevention`): Comprehensive prevention strategies

### 📚 Educational Content
- Interactive learning modules
- Knowledge assessment quizzes
- Progress tracking
- Myth-busting sections

## 🔧 Configuration Files

- **`next.config.js`**: Next.js configuration
- **`tailwind.config.ts`**: Tailwind CSS customization
- **`drizzle.config.ts`**: Database configuration
- **`tsconfig.json`**: TypeScript configuration
- **`components.json`**: Shadcn/ui configuration

## 📈 Performance Optimizations

- **Server Components**: Minimized client-side JavaScript
- **Image Optimization**: Next.js Image component with WebP
- **Code Splitting**: Dynamic imports for non-critical components
- **Caching**: Optimized build outputs and static assets
- **Bundle Analysis**: Tree shaking and dead code elimination

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

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Malaysian Ministry of Health** for STI prevalence data
- **Radix UI** and **Shadcn/ui** for the component system
- **Vercel** for hosting and deployment
- **The open-source community** for the amazing tools and libraries

## 📞 Support

For questions, issues, or contributions:

- **GitHub Issues**: [Report bugs or request features](https://github.com/aircrushinOrg/safhira/issues)
- **Discussions**: [Join community discussions](https://github.com/aircrushinOrg/safhira/discussions)

---

<div align="center">
  <p><strong>Built with ❤️ for Malaysian youth sexual health education</strong></p>
  <p>🌟 <em>Breaking stigmas, building knowledge, creating safer communities</em> 🌟</p>
</div>