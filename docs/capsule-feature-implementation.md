# Auto-Reflect & Share Capsules Implementation

## Overview
Implemented Feature #4 from the AI-Native Simulator Expansion PRD: "Auto-Reflect & Share Capsules". This feature generates story-like artefacts at session end that stitch highlights, tone graphs, and AI reflections into a shareable capsule.

## Implementation Details

### 1. Database Schema Updates
**File:** `db/schema.ts`

Added three new tables:

#### `aiScenarioCapsules`
- Stores shareable session summaries with secure tokens
- Fields:
  - `id`: Primary key
  - `sessionId`: References ai_scenario_sessions
  - `shareToken`: Unique 128-char token for secure sharing
  - `narrativeSummary`: AI-generated story-like narrative
  - `suggestedNextScenarios`: JSON array of recommended next scenarios
  - `toneMetrics`: JSON object with confidence, riskScore, notes
  - `expiresAt`: Expiration timestamp (default 30 days)
  - `viewCount`: Tracks how many times capsule was viewed
  - `createdAt`: Creation timestamp

#### `aiScenarioSnippets`
- Stores impactful dialogue turns with AI annotations
- Fields:
  - `id`: Primary key
  - `sessionId`: References ai_scenario_sessions
  - `turnIndex`: Turn number in conversation
  - `role`: 'player' or 'npc'
  - `content`: Exact dialogue text
  - `annotation`: AI-generated explanation of impact
  - `impactReason`: Brief label (e.g., "validated consent")
  - `createdAt`: Creation timestamp

### 2. API Endpoints

#### Smart Snippets Generation
**Endpoint:** `POST /api/ai-scenarios/session/[sessionId]/snippets`
- Analyzes conversation turns using AI
- Identifies 3-5 impactful dialogue moments
- Generates annotations explaining why each moment matters
- Stores snippets in database
- Returns array of snippets

**Endpoint:** `GET /api/ai-scenarios/session/[sessionId]/snippets`
- Retrieves stored snippets for a session
- Returns all snippets ordered by turn index

#### Capsule Creation & Sharing
**Endpoint:** `POST /api/ai-scenarios/session/[sessionId]/capsule`
- Creates a shareable capsule for completed session
- Auto-generates snippets if not already created
- Generates narrative summary using AI
- Suggests 3 next scenarios based on session performance
- Creates secure share token
- Returns capsule data with share URL
- Default expiry: 30 days

**Endpoint:** `GET /api/ai-scenarios/session/[sessionId]/capsule`
- Retrieves existing capsule for a session
- Checks expiration
- Returns capsule with share URL

#### Public Capsule Viewer
**Endpoint:** `GET /api/ai-scenarios/capsule/[shareToken]`
- Public endpoint for viewing shared capsules
- Increments view count
- Returns capsule data without exposing session internals
- Includes session info, narrative, snippets, metrics

### 3. UI Components

#### ChatFinalReportDialog Updates
**File:** `app/components/simulator/chat-practice/ChatFinalReportDialog.tsx`

Added features:
- **Share Button**: Creates capsule and generates secure share link
- **Smart Snippets Display**: Shows key conversation moments with AI annotations
- **Next Scenarios Suggestions**: Displays recommended follow-up scenarios
- **Copy Link Functionality**: One-click copy of share URL with visual feedback
- **Loading States**: Spinner animation while capsule is being generated
- **Error Handling**: User-friendly error messages

Visual enhancements:
- Purple gradient for snippets section with Sparkles icon
- Indigo gradient for next scenarios with ArrowRight icon
- Teal gradient for share link success message
- Individual snippet cards with impact reason badges
- Responsive layout for mobile and desktop

#### Public Capsule Viewer Page
**File:** `app/[locale]/simulator/capsule/[shareToken]/page.tsx`

Features:
- Beautiful card-based layout
- Session metadata display (scenario, NPC, completion date)
- Narrative summary prominently displayed
- Performance metrics visualization (confidence & risk scores)
- Key moments section with AI annotations
- Suggested next scenarios
- Expiration date notice
- Fully responsive design
- Dark mode support

### 4. Translations

Updated translation files for three languages:
- `messages/en.json` (English)
- `messages/ms.json` (Malay)
- `messages/zh.json` (Chinese)

New translation keys:
```json
{
  "dialog": {
    "sections": {
      "keyMoments": "Key Moments",
      "nextSteps": "Suggested Next Scenarios"
    },
    "share": "Share capsule",
    "sharing": "Creating capsule...",
    "copyLink": "Copy link",
    "linkCopied": "Link copied!",
    "capsuleCreated": "Your shareable capsule is ready!",
    "capsuleError": "Failed to create capsule. Please try again."
  }
}
```

## AI Integration

### Smart Snippets Analysis
Uses OpenAI API to:
- Analyze conversation history
- Identify impactful player responses
- Focus on moments showing:
  - Consent validation and boundaries
  - Empathy and active listening
  - Misinformation correction
  - Difficult moment navigation
  - Risky choices needing coaching
  - Growth and learning

### Narrative Synthesis
Uses OpenAI API to:
- Create story-like summaries (2-3 paragraphs)
- Explain why the scenario mattered
- Highlight learner responses and growth
- Acknowledge areas for improvement
- Provide encouraging next steps
- Written in warm, coaching tone

### Scenario Recommendations
AI suggests 3 relevant next scenarios based on:
- Current session performance
- Risk score trends
- Areas for growth identified
- Learning objectives covered

## Security Features

1. **Secure Share Tokens**: 256-bit random tokens (base64url encoded)
2. **Expiration**: Default 30-day expiry for all capsules
3. **View Tracking**: Monitors capsule access without exposing session data
4. **Data Privacy**: Public view doesn't expose raw conversation transcripts
5. **Session Isolation**: Capsules linked to sessions via secure foreign keys

## User Flow

### Creating a Capsule
1. User completes a conversation simulation
2. Final report dialog opens
3. User clicks "Share capsule" button
4. System generates:
   - Smart snippets (if not already created)
   - Narrative summary
   - Next scenario suggestions
   - Secure share token
5. Share URL appears with copy button
6. Key moments and suggestions display in dialog

### Viewing a Shared Capsule
1. Someone opens share URL
2. System validates token and expiration
3. Increments view count
4. Displays beautiful capsule page with:
   - Session metadata
   - Narrative journey
   - Performance metrics
   - Key moments with annotations
   - Suggested next scenarios
   - Expiration notice

## Technical Highlights

- **Progressive Enhancement**: Snippets generated on-demand or during capsule creation
- **Caching**: Snippets and capsules stored in database to avoid regeneration
- **Error Recovery**: Graceful handling of AI API failures
- **Responsive Design**: Works seamlessly on mobile and desktop
- **Accessibility**: Proper ARIA labels and semantic HTML
- **Dark Mode**: Full dark mode support throughout
- **i18n Ready**: All strings internationalized for multi-language support

## Database Migration

Schema changes applied via:
```bash
pnpm db:push
```

New tables created:
- `ai_scenario_capsules`
- `ai_scenario_snippets`

Indexes created for:
- Share token lookups (unique)
- Session ID queries
- Expiration checks
- Turn index ordering

## Success Metrics (as per PRD)

The implementation enables tracking of:
- **60% capsule export goal**: API tracks all capsule creations
- **40% note-taking reduction**: Facilitators can use capsules instead of manual notes
- **Narrative quality**: AI generates personalized, contextual summaries
- **Next steps alignment**: Closes loop back to director with scenario suggestions

## Files Created/Modified

### Created:
- `app/api/ai-scenarios/session/[sessionId]/snippets/route.ts`
- `app/api/ai-scenarios/session/[sessionId]/capsule/route.ts`
- `app/api/ai-scenarios/capsule/[shareToken]/route.ts`
- `app/[locale]/simulator/capsule/[shareToken]/page.tsx`
- `docs/capsule-feature-implementation.md`

### Modified:
- `db/schema.ts` (added capsule and snippet tables)
- `app/components/simulator/chat-practice/ChatFinalReportDialog.tsx` (added share UI)
- `app/components/simulator/ChatPractice.tsx` (pass sessionId to dialog)
- `messages/en.json` (added translations)
- `messages/ms.json` (added translations)
- `messages/zh.json` (added translations)

## Future Enhancements

Potential improvements for later:
1. **Facilitator Dashboard**: View all capsules for cohort management
2. **Custom Expiry**: Allow users to set capsule expiration
3. **Capsule Analytics**: Track which snippets resonate most
4. **Social Sharing**: Add direct sharing to platforms
5. **PDF Export**: Generate PDF version of capsules
6. **Capsule Templates**: Custom designs for different scenarios
7. **Offline Mode**: Cache capsules for offline viewing

## Conclusion

The Auto-Reflect & Share Capsules feature successfully implements all four core capabilities from the PRD:
✅ Narrative synthesis with AI-generated story-like summaries
✅ Smart snippets with auto-selected impactful dialogue turns
✅ Capsule export with secure share links and expiry
✅ Progress alignment with AI-suggested next scenarios

The feature is production-ready and fully integrated with the existing simulator infrastructure.
