### Epic 5 — Living With an STI: Long‑term Support and Practices (Acceptance Criteria)

This epic focuses on practical, day‑to‑day support for people living with an STI beyond initial diagnosis. It ensures the product delivers safe, private, accessible, and evidence‑based guidance that promotes well‑being and community health.

---

### Scope
- Includes: treatment adherence guidance, side‑effect management, positive‑living lifestyle content, partner notification guidance, safer sex practices, links to support resources.
- Excludes: real‑time clinical triage, emergency treatment, legal advice, and direct medical diagnosis.

---

### Global Acceptance Criteria (applies to all user stories)
- **Clinical accuracy**: Content is evidence‑based, medically reviewed, and includes update date and sources.
- **Safety disclaimers**: Clear non‑medical‑advice disclaimer and emergency instructions on every relevant page.
- **Privacy & data minimization**:
  - Default to local processing/storage. No personal health data leaves the device without informed, granular, revocable opt‑in.
  - User can export and delete their data at any time. Deletion is irreversible and clearly explained.
  - If analytics is enabled, events are de‑identified and purpose‑limited; off by default.
- **Security**: Any stored data is encrypted at rest and in transit (if synced). Follow least‑privilege and secure defaults.
- **Accessibility (WCAG 2.2 AA)**:
  - Fully keyboard accessible with visible focus, logical order, and proper semantics.
  - Sufficient color contrast; alt text for images; captions/transcripts for A/V.
  - Plain‑language reading level (roughly grade 6–8); expandable “Learn more” for advanced detail.
- **Internationalization**:
  - All user‑facing strings are externalized and translatable per `docs/i18n.md`. No locale‑specific content hardcoded.
  - Supports RTL languages and locale‑appropriate formatting (dates, times, numerals).
- **Performance**: Content screens reach LCP ≤ 2.5 s on a slow network; non‑essential media lazy‑loaded; text-first rendering.
- **Design & motion**: Uses calm, minimal motion; honors `prefers-reduced-motion`. No flashing/looping animations.
- **Content governance**: Shows last‑reviewed date, sources, and owner. Review cadence ≤ 6 months or on guideline change.
- **Consistency**: Tone is respectful, non‑stigmatizing, inclusive; consistent terminology across features.

---

### Definition of Done (epic‑level)
- Medical reviewer sign‑off recorded for all new/edited content.
- Accessibility QA passes (keyboard, screen reader smoke test, color contrast, captions/transcripts).
- i18n ready: keys externalized, pseudo‑locale tested; baseline translation requested for supported locales.
- Privacy review completed; data flows documented; analytics gated behind opt‑in.
- Usability tested with ≥ 5 target users; issues triaged and critical ones resolved.
- Test coverage includes core flows (unit/integration/e2e) and red‑flag routing logic.

---

### US 5.1 — Treatment Adherence and Side‑Effect Management
As a user with an STI, I want guidance on treatment adherence and managing side effects so that I can maintain my health effectively.

- **Functional AC**
  - Provides an adherence overview tailored to regimen type (e.g., single‑dose, daily course, multi‑drug), with clear step‑by‑step actions and do/don’t lists.
  - Side‑effects content separates “common/expected” vs “red‑flag/urgent” with clear callouts and actions.
  - Optional reminders: user can enable/disable, set times/days, snooze, and pause during specific periods. Timezone changes handled gracefully.
  - Dose tracking is optional and local: mark taken/missed; shows next‑dose time; explains safe catch‑up rules (no unsafe double‑dosing).
  - Provides practical tips to manage common side effects (e.g., nausea, dizziness) and when to contact a clinician.
  - Includes interaction cautions (e.g., alcohol, OTC meds) with clear “confirm with your clinician” guidance.

- **Given/When/Then**
  - Given reminders are off by default, when a user enables reminders, then they can schedule at least one time per day and choose days of week.
  - Given a dose is marked missed, when the user opens guidance, then they see regimen‑specific catch‑up instructions and any safety warnings.
  - Given a user selects a red‑flag symptom (e.g., severe rash, shortness of breath), when they confirm severity, then the app prominently advises urgent care and shows nearby resources.
  - Given reminders are enabled, when the device timezone changes, then future reminders occur at the user’s chosen local times.

- **Non‑Functional AC**
  - Reminder and tracking data stays on device unless the user explicitly opts into sync/export.
  - All inputs are operable by keyboard and accessible to screen readers; time pickers have accessible labels and formats.
  - Motion is minimal and respects reduced‑motion settings; no distracting animations.

- **Test Cases (examples)**
  - Enable, edit, and disable reminders; verify notifications and snooze behavior.
  - Missed‑dose flow shows correct guidance per regimen and blocks unsafe double‑dose suggestions.
  - Selecting a red‑flag triggers urgent guidance and resource links.

---

### US 5.2 — Positive‑Living Lifestyle Content
As a user with an STI, I want to know about the lifestyle of others living positively so that I can stay motivated to live well.

- **Functional AC**
  - Provides curated, medically reviewed stories/tips on living well with STIs (mental health, relationships, work, exercise, diet, coping with stigma).
  - Content includes practical, actionable steps and links to reputable resources and support organizations.
  - User can browse a list, open details, and optionally bookmark/save for offline reading (local only).
  - Content moderation policy is applied: harmful/stigmatizing submissions are blocked or removed; users can report content.
  - Sensitive topics are prefaced with clear content warnings and provide support links.

- **Given/When/Then**
  - Given the user opens Lifestyle, when they view the list, then items show title, short summary, and last‑reviewed date.
  - Given a user opens a story, when content contains sensitive topics, then a content warning is shown first with a continue option.
  - Given a user reports an item, when the report is submitted, then the item is hidden locally and sent to moderation without personal data.

- **Non‑Functional AC**
  - All media has alt text; A/V has captions/transcripts.
  - Reading level targets plain language; jargon is explained inline.
  - All text is translatable; no embedded text in images.

- **Test Cases (examples)**
  - Story list and detail render with metadata and sources.
  - Reporting hides content locally and queues a moderation event without PII.
  - Bookmarks persist locally and can be cleared in one action.

---

### US 5.3 — Partner Notification and Safer Sex Practices
As a user, I want to learn about partner notification and safer sex practices so that I can protect others while maintaining relationships.

- **Functional AC**
  - Provides guidance on disclosure best practices, respectful scripts, and tips for timing/setting.
  - Offers safer sex checklists tailored by STI type (e.g., condom/dental dam use, treatment windows, re‑testing intervals). U=U and viral‑load guidance included where applicable.
  - Provides message templates the user can customize and copy; messages are not stored by default.
  - Localized clinic/testing resource links are shown when a user shares approximate location or selects a region; generic resources are shown otherwise.
  - Notes legal considerations vary by jurisdiction and links to reputable legal/advocacy resources; avoids providing legal advice.

- **Given/When/Then**
  - Given the user opens Partner Notification, when they select a template, then they can edit and copy the message without saving it.
  - Given the user enables location, when they view resources, then nearby clinic/testing links are shown; otherwise, a generic national/international list appears.
  - Given an STI type is selected, when viewing safer sex practices, then the checklist reflects that STI’s recommended protection and retesting timelines.

- **Non‑Functional AC**
  - No partner identifiers are stored unless the user explicitly saves them; default is ephemeral/local‑only.
  - Checklists and templates are fully accessible and translatable; copy actions are keyboard operable and announced to screen readers.

- **Test Cases (examples)**
  - Copy‑template flow does not persist message content after navigation away.
  - Location‑off path shows generic resources; location‑on path shows localized resources.
  - STI‑specific checklists update content accurately when type changes.

---

### Analytics (opt‑in only)
- Track high‑level events: reminder enabled/disabled, dose marked, story viewed/bookmarked, template copied, resource link opened.
- Do not log PHI or free‑text message contents; aggregate only.

---

### Risks & Mitigations
- Stigma and emotional harm → content warnings, supportive tone, prominent help resources.
- Jurisdictional variability → frame as general guidance; link to reputable local resources; avoid legal advice.
- Misinterpretation of clinical info → clear sources, review dates, and prompts to consult clinicians for personal advice. 