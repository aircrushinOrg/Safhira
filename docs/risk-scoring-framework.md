# Risk Scoring Framework

## Overview

This document describes the AI-based risk scoring system used in the STI awareness simulation scenarios. The risk score evaluates how well players can identify manipulation, set boundaries, and protect themselves in potentially coercive situations.

## Scoring System

### Risk Score Range: 0-100

- **0-30 (LOW RISK)**: Player demonstrated strong refusal skills and safety awareness
- **31-60 (MEDIUM RISK)**: Player showed some skills but has gaps in protection
- **61-100 (HIGH RISK)**: Player is vulnerable; failed to set boundaries or recognize danger

### Important Note: Inverted Scoring

The risk score is **inverted** - higher scores indicate **higher vulnerability** and **greater risk exposure**.

## Evaluation Dimensions

### 1. Recognition of Manipulation (0-25 points)

Evaluates the player's ability to identify coercive or manipulative tactics.

| Points | Description |
|--------|-------------|
| 0-8    | Failed to identify any manipulative tactics; accepted coercive framing |
| 9-16   | Showed some awareness but didn't name specific tactics |
| 17-25  | Clearly identified manipulation (flattery, pressure, misinformation, etc.) |

**Examples of manipulation to recognize:**
- Flattery and compliments used to lower guard
- Social pressure ("Everyone is doing it")
- Misinformation about consent
- Urgency tactics ("We need to decide now")
- Secrecy requests ("Don't tell anyone")

### 2. Boundary Setting (0-30 points)

Assesses how clearly and firmly the player sets personal boundaries.

| Points | Description |
|--------|-------------|
| 0-10   | Agreed to risky behavior; no boundaries set |
| 11-20  | Hesitant or unclear boundaries; gave mixed signals |
| 21-30  | Firm, clear, direct refusal or boundary statement |

**Examples:**
- ❌ Low score: "Maybe...", "I don't know...", "If you really want to..."
- ⚠️ Medium score: "I'm not sure if that's a good idea..."
- ✅ High score: "No, I'm not comfortable with that.", "That's not happening."

### 3. Communication Effectiveness (0-25 points)

Measures assertiveness, confidence, and clarity in communication.

| Points | Description |
|--------|-------------|
| 0-8    | Apologetic, vague, or people-pleasing responses |
| 9-16   | Somewhat clear but lacked confidence or directness |
| 17-25  | Assertive, confident, and unambiguous communication |

**Key indicators:**
- Directness (avoiding hedging language)
- Confidence (no over-apologizing)
- Clarity (unambiguous meaning)
- Assertiveness (standing firm when challenged)

### 4. Safety Awareness & Help-Seeking (0-20 points)

Evaluates awareness of support resources and willingness to seek help.

| Points | Description |
|--------|-------------|
| 0-6    | No mention of seeking help or involving trusted adults |
| 7-13   | Acknowledged need for support but didn't commit to action |
| 14-20  | Actively mentioned seeking help, telling trusted adults, or leaving situation |

**Positive indicators:**
- Mentions talking to parents, teachers, or counselors
- References healthcare providers or helplines
- Suggests leaving the situation
- Plans to tell someone trustworthy

## Risk Score Calculation

### Step 1: Award Points

Evaluate the player's latest responses across all four dimensions and award points according to the rubrics above.

### Step 2: Calculate Total

Sum all points from the four dimensions:
```
Total Points = Recognition (0-25) + Boundaries (0-30) + Communication (0-25) + Safety (0-20)
Maximum possible: 100 points
```

### Step 3: Invert Score

Calculate the final risk score by inverting:
```
Risk Score = 100 - Total Points
```

**Why invert?** The system awards points for protective skills, but the final "risk score" should reflect vulnerability. A player who earns 80 points (highly skilled) should have a risk score of 20 (low risk).

## Confidence Score (0-100)

The confidence score indicates how certain the AI is about its assessment.

**Factors that increase confidence:**
- Clear, unambiguous player responses
- Consistent behavior across multiple turns
- Longer conversation history (more data points)
- Direct statements about intentions

**Factors that decrease confidence:**
- Vague or contradictory responses
- Very short conversation (< 3 turns)
- Ambiguous language
- First-time assessment

## Notes Field

The AI must provide 2-3 sentences explaining:

1. **Which dimension(s) drove the score** - Be specific about what the player did or didn't do
2. **Concrete examples** - Quote or paraphrase actual player responses
3. **Actionable feedback** - What went well and what needs improvement

### Good Example
```json
{
  "confidence": 85,
  "riskScore": 45,
  "notes": "Player clearly identified the pressure tactic ('You're using urgency to push me') earning high marks for recognition. However, their boundary was hesitant ('Maybe we should wait?') rather than firm, and they didn't mention seeking advice from trusted adults, resulting in moderate risk."
}
```

### Bad Example (Too Vague)
```json
{
  "confidence": 50,
  "riskScore": 60,
  "notes": "Not great."
}
```

## Implementation Details

### Frequency

Risk assessments are triggered:
- Every 3 player turns (configurable via `SUMMARY_INTERVAL`)
- When explicitly requested via API (`forceAssessment: true`)
- At conversation end for final scoring

### AI Model

The scoring is performed by an AI model (default: Grok-4-fast) that receives:
- Complete conversation history
- Scenario learning objectives
- NPC tactics and goals
- Detailed scoring rubrics (this framework)

### Storage

Scores are stored in the database:
- `aiScenarioSessions.lastScore` - Most recent risk score
- `aiScenarioResponses.score` - Detailed score object for each assessment

## Educational Purpose

This scoring system serves multiple educational goals:

1. **Awareness**: Helps players understand their vulnerability level
2. **Feedback**: Provides specific, actionable guidance for improvement
3. **Practice**: Allows safe experimentation with different responses
4. **Progress Tracking**: Shows improvement over multiple sessions

## Alignment with Risk Level

The risk score should align with the summary's `riskLevel` field:

| Risk Score | Risk Level | Interpretation |
|-----------|------------|----------------|
| 0-30      | low        | Strong protective skills demonstrated |
| 31-60     | medium     | Some skills present but inconsistent or incomplete |
| 61-100    | high       | Significant gaps in self-protection abilities |

## Related Documentation

- [AI Simulation Storage](./ai-simulation-storage.md) - Database schema
- [Security Guidelines](./security/) - Safety considerations

