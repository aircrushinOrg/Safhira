# Safhira - Safe Sexual Health Education Platform

**Empowering young Malaysian adults aged 18-25 with stigma-free sexual health education, anonymous testing resources, and culturally sensitive support to combat rising STI rates.**

<div align="center">
  <img src="public/logo.svg" alt="Safhira Logo" width="120" height="120">
</div>

## 🌟 About Safhira

Safhira is a comprehensive sexual health education platform specifically designed for Malaysian youth. Built with cultural sensitivity and modern web technologies, it provides accessible, stigma-free education about sexually transmitted infections (STIs) through an interactive and user-friendly experience.

### ✨ Key Features

- **📚 Comprehensive STI Education**: Detailed information on symptoms, transmission, prevention, and treatment for major STIs
- **🗺️ Interactive Data Visualization**:
  - Choropleth maps visualizing STI prevalence across Malaysian states (2017-2022)
  - Real-time year slider with animated transitions
  - Color-coded intensity based on incidence rates
  - Hover tooltips with detailed state statistics
  - Zoom and pan functionality for detailed exploration
- **📈 Advanced Analytics**:
  - Time series charts showing STI trends over time
  - Statistical summaries (highest, lowest, average rates)
  - Multi-disease comparison capabilities
- **💬 AI-Powered Chat Assistant**:
  - Personalized guidance and answers to health questions
  - RAG (Retrieval-Augmented Generation) architecture
  - Web search integration for current information
  - Location-based healthcare provider recommendations
- **🎮 Interactive Learning**:
  - Gamified quiz system with myths vs facts
  - Leaderboard and scoring system
  - Tilted scroll interface for engaging content delivery
- **🎭 AI Chat Practice Simulator**:
  - Realistic conversation scenarios with AI-powered NPCs
  - Practice sexual health conversations in safe environment
  - Real-time confidence and risk scoring
  - Detailed performance reports and feedback
  - Interactive game environment built with Phaser.js
  - Optional speech-to-text capture for spoken practice responses
- **🏥 Healthcare Provider Directory**:
  - Searchable database of STI testing centers
  - Location-based filtering and distance calculation
  - Service-specific search (STI testing, PrEP, PEP)
- **🏠 Living Well Resources**:
  - Treatment adherence tracking tools
  - Lifestyle management guidance
  - Relationship communication support with AI-powered tone tuning
- **🛠️ Sexual Health Tools**:
  - Collection of practical sexual health utilities
  - Educational calculators and assessments
  - Interactive guidance tools
- **🎨 Modern Design System**:
  - Dark/light theme support
  - Responsive design for all devices
  - Accessibility-first approach
  - Smooth animations and transitions

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router and Server Components
- **Language**: TypeScript with strict type checking
- **Styling**: Tailwind CSS + Shadcn/ui + Radix UI components
- **Animations**: Framer Motion for smooth transitions
- **Charts**: Chart.js for time series, React Simple Maps for choropleth visualizations
- **Game Engine**: Phaser.js 3 for interactive conversation simulator
- **Document Generation**: docx library for report exports
- **Internationalization**: Next-intl for multi-language support
- **Theme**: Next Themes with system preference support
- **Icons**: Lucide React for consistent iconography
- **Fonts**: Poppins font family for modern typography

### Backend & Database
- **Database**: PostgreSQL (supports Vercel Postgres, Neon, local instances)
- **ORM**: Drizzle ORM with full type safety and relation queries
- **APIs**: RESTful APIs with Next.js API Routes
- **Migrations**: Drizzle Kit for automated schema versioning
- **Data Processing**: Server Actions for form handling and data mutations

### AI & External Services
- **AI Chat**: OpenAI integration for conversational AI
- **Web Search**: Tavily API for real-time information retrieval
- **Maps**: Google Maps API for location services and distance calculation

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
# Create a Postgres database on Vercel: https://vercel.com/postgres
DATABASE_URL=

# LLM
OPENAI_API_KEY=
OPENAI_BASE_URL=
TUNE_MODEL_NAME=
SCENARIO_MODEL_NAME=
REPORT_MODEL_NAME=

#email
RESEND_API_KEY=
RESEND_FROM=

# maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
   ```

   **Database Options:**
   - **Vercel Postgres**: Create at [Vercel Dashboard](https://vercel.com/dashboard)
   - **Neon**: Free tier at [neon.tech](https://neon.tech/)
   - **Local PostgreSQL**: Set up local instance
   
   **External Service Setup:**
   - **OpenAI**: Get API key from [OpenAI Platform](https://platform.openai.com/)
   - **Tavily**: Register at [Tavily](https://tavily.com/) for web search
   - **Google Maps**: Enable Maps JavaScript API at [Google Cloud Console](https://console.cloud.google.com/)

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
├── app/                              # Next.js App Router
│   ├── [locale]/                     # Internationalized routes
│   │   ├── chat/                     # AI chat pages with about section
│   │   ├── find-healthcare/          # Healthcare provider directory
│   │   ├── living-well-with-sti/     # Post-diagnosis support resources
│   │   ├── quiz/                     # Interactive learning quizzes
│   │   ├── stis/                     # STI information and data
│   │   ├── privacy-policy/           # Privacy policy page
│   │   ├── terms-of-use/            # Terms of service page
│   ├── actions/                      # Server actions for data operations
│   ├── api/                          # API routes
│   │   ├── ai-scenarios/            # AI conversation simulator APIs
│   │   │   └── session/             # Session management and chat streaming
│   │   ├── geocode/                 # Location coordinate lookup
│   │   ├── calculate-distances/     # Provider distance calculation
│   │   ├── leaderboard/             # Quiz scoring system
│   │   └── tone-tune/               # AI conversation assistance
│   ├── components/                   # Safhira UI components 
│   │   ├── ui/                      # Shadcn/ui design system components
│   │   ├── landing/                 # Homepage sections
│   │   ├── find-healthcare/         # Provider directory components
│   │   ├── quiz/                    # Interactive quiz components
│   │   ├── leaderboard/             # Leaderboard components
│   │   ├── simulator/               # Chat practice simulator components
│   │   │   ├── scenes/                    # Phaser game scenes
│   │   │   ├── utils/                     # Game utility functions
│   │   │   └── debugger/                  # Development debugging tools
│   ├── chat/                         # Direct chat routes (non-localized)
│   ├── stis/                         # Direct STI routes (non-localized)
│   ├── living-well-with-sti/         # Direct wellness routes
│   ├── quiz/                         # Direct quiz routes
│   ├── simulator/                    # AI chat practice simulator
│   │   ├── chat/                     # Chat practice sessions
│   │   ├── game/                     # Interactive game environment
│   │   ├── npc-list/                # NPC character directory
│   ├── tools/                        # Sexual health utility tools
│   ├── privacy-policy/               # Direct policy routes
│   ├── terms-of-use/                # Direct terms routes
│   ├── providers/                    # React context providers
│   ├── layout.tsx                    # Root layout with global providers
│   ├── page.tsx                      # Landing page
│   ├── not-found.tsx                # Global 404 error page
│   ├── sitemap.ts                    # SEO sitemap generation
│   ├── robots.ts                     # Search engine directives
│   ├── globals.css                   # Global Tailwind styles
│   └── db.ts                        # Database connection setup
├── db/                               # Database layer
│   ├── schema.ts                    # Drizzle schema definitions
│   └── migrations/                  # Auto-generated migration files
├── i18n/                            # Internationalization configuration
├── lib/                             # Utility functions
│   └── utils.ts                    # Helper functions and utilities
├── public/                          # Static assets
│   ├── landing-hero-*.png          # Hero section illustrations
│   ├── landing-my-map.json         # Malaysia GeoJSON data
│   ├── logo.svg                    # Application logo
│   └── *.svg                       # Various illustrations
├── types/                           # TypeScript type definitions
└── README.md                       # Project documentation
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

#### **Geographic & STI Data**
- **`state`** & **`state_translations`**: Malaysian states with multi-language support
  - Supports locale-specific state names (English, Malay, Chinese)
- **`prevalence`**: STI prevalence data by Malaysian states, years, and disease types
  - Composite primary key: (sti_id, state_id, prevalence_year)
  - Tracks cases and incidence rates per 100,000 population
  - Supports choropleth map visualizations and trend analysis
- **`sti`** & **`sti_translations`**: Comprehensive STI information database
  - Categorized by type (Bacterial/Viral/Parasitic), severity, and treatability
  - Treatment options and Malaysian-specific context
  - Multi-language support for all content

#### **STI Information Dictionary Tables**
- **`symptom`** & **`symptom_translations`**: STI symptoms dictionary
- **`transmission`** & **`transmission_translations`**: Transmission methods dictionary
- **`health_effect`** & **`health_effect_translations`**: Health effects dictionary
- **`prevention`** & **`prevention_translations`**: Prevention strategies dictionary
- **Junction Tables**: `sti_symptom`, `sti_transmission`, `sti_health_effect`, `sti_prevention`
  - Link STIs to their respective symptoms, transmission methods, health effects, and prevention strategies
  - Supports categorization (e.g., symptoms by gender: common, men, women, general)

#### **Healthcare Services**
- **`provider`**: Healthcare provider directory for STI services
  - Location data with coordinates for mapping and distance calculation
  - Service types (STI testing, PrEP, PEP, free screening)
  - Contact information and Google Places integration

#### **Interactive Learning**
- **`quiz_questions`** & **`quiz_question_translations`**: Quiz content for education
  - Myth vs fact statements with detailed explanations
  - Category-based organization with multi-language support
- **`quiz_results`**: Individual quiz attempt records
  - Links to leaderboard nicknames with scoring details
  - Performance tracking per quiz type
- **`quiz_leaderboard_stats`**: Aggregated leaderboard statistics
  - Best scores, average performance, and attempt counts per nickname
  - Quiz type categorization and timing data

#### **AI Chat Practice Simulator**
- **`ai_scenario_sessions`**: Conversation practice session management
  - Scenario configuration with learning objectives and supporting facts
  - NPC character definitions (persona, goals, tactics, boundaries)
  - Session state tracking with completion status
- **`ai_scenario_turns`**: Individual conversation turns
  - Sequential turn tracking with role identification (user/npc)
  - Complete conversation history per session
- **`ai_scenario_responses`**: AI-generated responses and assessments
  - Real-time scoring and performance analytics
  - Safety alerts and conversation completion tracking
  - Final reports with detailed feedback

#### **User Engagement**
- **`newsletter_subscriptions`**: Email subscription management
  - Unique email validation with subscription timestamps

### Technical Features

- **🌐 Internationalization**: Complete multi-language support with `locale` enum (en, ms, zh)
- **🔗 Relational Integrity**: Foreign key constraints with cascade operations
- **📊 Performance Optimization**: Strategic indexing on frequently queried columns
- **🎯 Type Safety**: Drizzle ORM with full TypeScript integration
- **🔄 Automated Migrations**: Version-controlled schema changes with Drizzle Kit
- **📍 Geospatial Support**: Coordinate storage for location-based provider search
- **📊 JSONB Storage**: Flexible data structures for complex objects (arrays, learning objectives, scores)
- **🔍 Advanced Indexing**: Composite primary keys and optimized query patterns

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
- **Animated Hero Section**: Dynamic slideshow highlighting key platform features
- **Breaking Stigma Section**: Anti-stigma messaging with supportive educational content
- **Prevalence Section**: Interactive STI data visualization for Malaysia
  - Choropleth map with state-by-state data (2017-2022)
  - Time series trends chart with disease comparison
  - Real-time statistics and demographic analysis
- **Features Section**: Platform capabilities and benefits overview
- **FAQ Section**: Common questions about sexual health and platform usage
- **Final Note Section**: Encouraging message and next steps

### 💬 AI Chat (`/chat`)
- **Interactive AI Assistant**: RAG-powered chatbot for health questions
- **About Page** (`/chat/about`): Technical architecture and benchmark results
- **Contextual Responses**: Evidence-based sexual health information
- **Web Search Integration**: Real-time information retrieval
- **Location Services**: Healthcare provider recommendations
- **Privacy-Focused Design**: Anonymous and secure conversations

### 📊 STI Information (`/stis`)
- **STI Directory**: Overview of major sexually transmitted infections
- **Individual STI Pages** (`/stis/[sti]`): Comprehensive information including:
  - Symptoms by gender and general presentation
  - Transmission methods and risk factors
  - Health effects and complications
  - Prevention strategies and treatment options
  - Malaysian-specific context and statistics
- **Prevalence Maps** (`/stis/prevalence`): Full-screen data visualization
  - Interactive choropleth map with zoom and pan
  - Multi-year comparison (2017-2022)
  - Disease-specific filtering and analysis
  - Statistical summaries and trends

### 🎮 Interactive Quiz (`/quiz`)
- **Gamified Learning**: Myth vs fact educational content
- **Tilted Scroll Interface**: Engaging visual presentation
- **Scoring System**: Performance tracking and feedback
- **Leaderboard**: Competitive learning with rankings
- **Progress Tracking**: Individual learning analytics

### 🏥 Find Healthcare (`/find-healthcare`)
- **Provider Search**: Comprehensive directory of STI testing centers
- **Location-Based Filtering**: Find nearby healthcare providers
- **Service-Specific Search**: Filter by STI testing, PrEP, PEP services
- **Distance Calculation**: Real-time travel distance and time
- **Detailed Provider Profiles**: Contact information, hours, services
- **Interactive Map Integration**: Visual location browsing

### 🏠 Living Well with STI (`/living-well-with-sti`)
- **Treatment Adherence** (`/treatment`): Medication tracking and reminders
- **Lifestyle Management** (`/lifestyle`): Health and wellness guidance
- **Relationship Support** (`/relationships`): Communication tools and advice
- **AI-Powered Tone Tuning**: Conversation assistance for difficult topics
- **Resource Bookmarking**: Save important information for later

### 🎭 AI Chat Practice Simulator (`/simulator`)
- **Interactive Scenarios**: Practice conversations about sexual health topics
- **Game Environment** (`/simulator/game`): Phaser.js-powered 2D interactive world
- **Chat Sessions** (`/simulator/chat`): AI-driven conversation practice
- **NPC Directory** (`/simulator/npc-list`): Browse available conversation partners
- **Real-time Scoring**: Confidence and risk assessment during conversations
- **Performance Analytics**: Detailed reports on conversation skills
- **Safe Learning Environment**: Practice difficult topics without judgment
- **Multi-language NPCs**: Conversations in English, Malay, and Chinese

### 📄 Legal & Privacy
- **Privacy Policy** (`/privacy-policy`): Comprehensive data handling transparency
- **Terms of Use** (`/terms-of-use`): Platform usage guidelines and responsibilities
- **Multi-language Support**: Available in English, Malay, and Chinese

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
