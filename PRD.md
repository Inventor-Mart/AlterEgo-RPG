# Qubators AI Foundry Master PRD Bibles
## Project Portfolio Strategy
**Author:** Lead Product Architect & Developer  
**Platform Version:** 1.1.0  
**Last Updated:** October 9, 2026  
**Tech Stack Baseline:** Vite + React + TypeScript + Tailwind CSS + Capacitor Android Native Bridge + Supabase DB

---

## 📜 REVISION HISTORY
| Version | Date | Author | Description of Changes |
| :--- | :--- | :--- | :--- |
| **1.0.0** | Sept 17, 2026 | Lead Architect | Initial Approved Master PRD baseline for AlterEgo (`ALTEREGO-01`) & SceneSwap (`SCENESWAP-02`). |
| **1.1.0** | Oct 9, 2026 | Lead Architect | 1. Removed "AI" terminology from user-facing decoding states (renamed to "Decoding in Progress...").<br>2. Added **FR-3.1: Dynamic Evolutive RPG Avatar & Gear Specialization Engine** featuring evolutive avatars (Novice Initiate, Awakened Seeker, Kingdom Builder, Divine Sovereign) with dynamic gear loadouts.<br>3. Adopted Option 1 clean first screen with grand avatar reveal post-decoding. |
| **1.2.0** | Oct 9, 2026 | Lead Architect | Added **FR-3.2: 4-Week / 4-Chapter Purpose Campaign Architecture (The 1,000 XP Season)**. Solves rapid content exhaustion by pairing immediate Day-1 instant gratification (30-min quest = instant Level 2 + Rare gear) with a multi-week 30-day journey across Chapter 1 (The Awakening), Chapter 2 (The Forge), Chapter 3 (The Trial of Impact), and Chapter 4 (Sovereign Ascension). |
| **1.3.0** | Oct 9, 2026 | Lead Architect | 1. Added **FR-3.3: 7-Day Time-Lock Integration Engine** enforcing real-world behavioral pacing between chapters.<br>2. Fixed text truncation in Equipped Gear grid with interactive deep-dive modal inspector.<br>3. Added **FR-3.4: Post-30-Day Endgame Loop** (Prestige Ascension cycles, ongoing weekly quests, and Executive Purpose Dossier export).<br>4. Added **FR-4.0: Support Portal** routing direct inquiries to `martorefe@gmail.com`.<br>5. Added **FR-5.0: In-App Monetization (Sovereign Pass)** featuring Chapter Skip, Dossier Exports, and Pro Perks. |
| **1.4.0** | Oct 9, 2026 | Lead Architect | 1. Decoupled SceneSwap from AlterEgo Sovereign Pass entirely (SceneSwap subscription will be defined independently in Phase 2).<br>2. Expanded Sovereign Pass PRO with **Task Execution Copilot & Strategic Ghostwriter Engine**: provides on-demand tactical playbooks for physical tasks (organizing teams, logistics, delegation matrices, kickoff meetings) and written drafting (executive outreach emails, proposals, sprint agendas). |

---

# 🧭 PRODUCT REQUIREMENT DOCUMENT (PRD) — VERSION 1.3
## PROJECT CODE: **ALTEREGO-01**
## PRODUCT TITLE: **AlterEgo (The Purpose Archetype RPG)**

### 1. PRODUCT METADATA & OBJECTIVES
*   **Target Release Date:** October 12, 2026 (Demo Day)
*   **Target Platforms:** Android OS Native App (via Capacitor Native Bridge Layer) / Web SPA
*   **Core Problem:** Directional career anxiety, burnout, and lack of internal alignment between day-to-day hustle and higher purpose.
*   **Value Proposition:** Transforms subjective human aspirations through a dual-lens psychological system (**Japanese Ikigai Matrix** + **Timeless Biblical Leadership Archetypes**) into a dynamic, gamified RPG character sheet with evolving gear, level progression, and micro-quests.

---

### 2. DETAILED COMPONENT FUNCTIONAL REQUIREMENTS (FR)

#### 📦 FR-1.0: THE INTEGRATED DATA INTAKE MATRIX
*   **Description:** Single-screen responsive capture collecting the four distinct quadrants of Ikigai.
*   **UI Form Specifications:**
    *   `Field_01 (Passion):` Text Area input placeholder: *"What activities make you lose track of time? What brings you genuine joy?"* Max length: 500 characters.
    *   `Field_02 (Skill):` Text Area input placeholder: *"What are your natural talents, professional skills, or things others praise you for?"* Max length: 500 characters.
    *   `Field_03 (World_Need):` Text Area input placeholder: *"What real-world issues, local problems, or societal bugs do you desire to fix?"* Max length: 500 characters.
    *   `Field_04 (Monetization):` Text Area input placeholder: *"What career titles, freelance services, or businesses do you want to get paid for?"* Max length: 500 characters.
*   **Zero-Distraction Intake Experience (Option 1 Standard):**
    *   The intake screen maintains an uncluttered, distraction-free environment focused entirely on capturing the 4 Ikigai quadrants with full vertical breathing room.
    *   The user's specialized RPG Avatar is reserved for a celebratory grand unveiling upon clicking *"Decode My Divine Purpose"*, appearing prominently on the Character Sheet.
*   **Validation Rules:**
    *   All four fields must contain a minimum of 20 characters before the submission trigger lights up (`.trim().length >= 20`).
    *   Submission button shows disabled state (`opacity-50 pointer-events-none`) until validated.

#### 📦 FR-2.0: HYBRID DECODING ENGINE & DATA CONTRACT
*   **System Action:** Upon clicking **"Decode My Divine Purpose"**, the app triggers the decoding process.
*   **UI State:** During processing, the screen displays a celestial pulsing orb with the copy **"Decoding in Progress..."** (avoiding robotic "AI" naming).
*   **JSON Enforcement Schema:**
```json
{
  "decoded_purpose": "string (Max 150 characters synthesizing their career + ultimate impact statement)",
  "biblical_archetype": {
    "name": "string (e.g., Nehemiah, Joseph, Deborah, Bezalel, Daniel)",
    "context": "string (Max 200 characters explaining why their modern skills match this hero's ancient mission)"
  },
  "rpg_class": "string (A punchy gamified title combining faith & tech, e.g., Kingdom Architect, Grace Sentinel, Code Alchemist)",
  "anchor_verse": {
    "reference": "string (e.g., Ephesians 2:10)",
    "text": "string (The complete scripture text matching the reference)"
  },
  "weekly_quests": [
    {"id": 1, "task": "string (Actionable, micro-goal that can be completed in 30 minutes)", "points": 50},
    {"id": 2, "task": "string (Actionable goal relating to skill upgrading)", "points": 50},
    {"id": 3, "task": "string (Actionable goal relating to community or financial setup)", "points": 100}
  ]
}
```

#### 📦 FR-3.0: THE RPG SYSTEM & IDENTITY DASHBOARD
*   **State Rendering:** Unmounts form, reveals Character Sheet with smooth opacity transitions.
*   **Character Class Header:** Glassmorphic card displaying `rpg_class`, Level badge, and rank.
*   **The Blueprint Subcard:** Displays `decoded_purpose`, `biblical_archetype.name` & `context`, and `anchor_verse`.
*   **Quest Tracker List:** Renders 3 `weekly_quests`. Toggling plays an audio chime, triggers phone haptic vibration (`navigator.vibrate([30, 20, 30])`), and fills the XP Progress Bar.

#### 📦 FR-3.1: DYNAMIC EVOLUTIVE RPG AVATAR & GEAR ENGINE (NEW IN V1.1)
*   **Visual Portrait Representation:**
    *   Each character receives an evolving high-concept visual RPG avatar portrait representing their character specialization.
*   **Level & Gear Tiers:**
    *   **Level 1 — Novice Initiate (0–49 XP):**
        *   Avatar Style: Hooded disciple silhouette with subtle cosmic ambient mist.
        *   Equipped Gear: *Apprentice Linen Robes*, *Uncarved Stylus of Faith*.
    *   **Level 2 — Awakened Seeker (50–99 XP):**
        *   Avatar Style: Glowing runic mantle, engraved pauldrons, energized focus visor.
        *   Equipped Gear: *Cipher Breastplate*, *Compass of Ancient Wisdom*.
    *   **Level 3 — Kingdom Builder (100–199 XP):**
        *   Avatar Style: Ornate vanguard regalia, glowing circuit sigils, crowned diadem.
        *   Equipped Gear: *Vanguard Plate of Covenant*, *Architect's Scepter of Dominion*.
    *   **Level MAX — Divine Sovereign (200 XP):**
        *   Avatar Style: Radiant celestial seraphic wings, golden crown of dominion, celestial aura.
        *   Equipped Gear: *Celestial Robes of Dominion*, *Crown of Sovereign Favor*, *Aura of Zion*.
*   **Gear Equipment Loadout Grid:**
    *   Displays 4 equipment slots: **Crown/Helm**, **Robes/Armor**, **Catalyst/Weapon**, and **Relic/Aura**.
    *   Equipment automatically unlocks and equips as quests are checked and XP thresholds are crossed.

#### 📦 FR-3.2: 4-WEEK / 4-CHAPTER PURPOSE CAMPAIGN ARCHITECTURE (THE 1,000 XP SEASON)
*   **Dual Progression Loop:**
    *   **Instant Gratification (Day 1):** Completing Quest 1 (a 30-minute micro-goal) yields instant dopamine: +50 XP, sound chime, haptic pulse, Level 2 rank promotion, and equips the *Rare Circlet of Focus*.
    *   **30-Day Anti-Exhaustion Campaign:** The app does not end after 3 quests. Instead, the journey expands across 4 narrative chapters totaling **1,000 Seasonal XP**:
*   **Chapter Breakdown:**
    *   **Chapter 1 (Week 1 — Cap: 250 XP): The Awakening:** Foundational alignment, daily habits, and purpose grounding. (Unlocks Rare Tier Gear).
    *   **Chapter 2 (Week 2 — Cap: 500 XP): The Forge of Craft:** Deep technical sprints, building the primary prototype or service package. (Unlocks Epic Vanguard Armor & Compass).
    *   **Chapter 3 (Week 3 — Cap: 750 XP): The Trial of Impact:** Public release, customer conversations, and community deployment. (Unlocks Epic Scepter of Dominion).
    *   **Chapter 4 (Week 4 — Cap: 1,000 XP): Sovereign Dominion:** High-leverage monetization, sustainable operational rhythms, and final celestial ascension. (Unlocks Celestial Seraphic Wings, Crown of Favor, and Divine Sovereign status).
*   **Chapter Milestone Transition:**
    *   Completing all 3 quests in a chapter triggers a milestone badge and unlocks the **"Advance to Next Chapter"** action, querying the engine to generate progressive, higher-stakes quests tailored to their evolving mastery.

#### 📦 FR-3.3: 7-DAY TIME-LOCK INTEGRATION ENGINE
*   **Behavioral Pacing Mechanism:**
    *   To ground cognitive retention and ensure genuine life transformation rather than binge consumption, each Chapter requires a **7-Day Integration Period** from its activation timestamp.
    *   **Live Countdown Indicator:** If a user completes their chapter quests early, the system displays a live integration timer (*"Chapter 2 Unlocks in: 4d 18h"*).
    *   **Integration Reflection Guidance:** Provides prompts reminding users to practice their new habits in the physical world during the waiting window.
    *   **Sovereign Pass / Demo Bypass:** Sovereign Pass (Pro) holders or testing mode users can instantly bypass the timer using the *"Instant Fast-Forward"* key.

#### 📦 FR-3.4: POST-30-DAY ENDGAME ARCHITECTURE (THE PRESTIGE LOOP)
*   **Problem:** Avoiding player churn or emptiness once the 30-day journey is conquered.
*   **Endgame Loops:**
    1.  **Prestige Cycles (Season 2+):** Users can reset with their ascended gear and choose an evolved Master Specialization (e.g. *Kingdom Diplomat*, *Zion Venture Catalyst*, *Global Guildmaster*) earning Prestige Badges (★ Prestige I, ★★ Prestige II) and gilded skins.
    2.  **Sovereign Weekly Recalibration:** Unlocks continuous weekly high-leverage quests generated weekly by the AI engine based on current career challenges.
    3.  **Executive Purpose Dossier Export:** Generates an executive, print-ready Purpose Portfolio document summarizing their 30-day journey, Biblical archetype synthesis, equipped gear, and verified milestones for pitch decks, LinkedIn profiles, or personal review.

#### 📦 FR-4.0: USER SUPPORT & DIRECT COMMUNICATIONS PORTAL
*   **Dedicated Support Gateway:**
    *   In-app access button in the header/settings dialog linking directly to **`martorefe@gmail.com`**.
    *   **In-App Support Modal:** Users can draft feedback, feature requests, or report issues directly inside the app, with pre-filled device & character metadata, opening their native email client via `mailto:martorefe@gmail.com?subject=AlterEgo%20Support%20Request`.

#### 📦 FR-5.0: IN-APP MONETIZATION ARCHITECTURE (THE SOVEREIGN PASS PRO)
*   **Business Model & Value Proposition:**
    *   A premium tier (**"AlterEgo Sovereign Pass"**) unlocking accelerated growth, executive tooling, and bespoke assets. Note: SceneSwap retains a separate, independent subscription model to be specified in Phase 2.
*   **Pro Feature Matrix:**
    *   ⚡ **Time-Lock Fast-Forward:** Skip the mandatory 7-day waiting periods between chapters to progress at your own pace.
    *   🧠 **Task Execution Copilot & Strategic Ghostwriter (NEW):** On-demand AI copilot for every weekly quest providing:
        *   *Physical & Operational Task Playbooks:* Step-by-step guidance for organizing real-world actions (e.g. assembling a team, finding venues, delegating responsibilities, running high-stakes meetings).
        *   *Executive Writing & Drafts:* Ready-to-copy written drafts (outreach emails, proposals, sprint agendas, announcement letters).
    *   👑 **Mythic Celestial Gear Skins:** Exclusive radiant gold & obsidian colorways for your RPG Avatar and gear cards.
    *   📜 **Executive Purpose Dossier (PDF/Text):** Formatted export summarizing their 4-week achievements, Ikigai breakdown, and Scripture anchor.
    *   🤝 **Direct Advisory Concierge:** Priority email support channel (`martorefe@gmail.com`) and 1-on-1 purpose advisory booking link.
*   **Pricing Tiers:**
    *   Monthly Sovereign Pass: `$9.99 / month` (or `₦7,500 / month`).
    *   Lifetime Founder Pass: `$49.00` one-time payment.

---

### 3. SCHEMAS & DATABASE STRUCTURE (SUPABASE)
*   Table `profiles`: `id`, `email`, `created_at`, `current_xp`
*   Table `character_blueprints`: `id`, `user_id`, `raw_passions`, `raw_skills`, `purpose_statement`, `rpg_class`, `quests_json`

---

### 4. EDGE CASES & STRESS MITIGATION
*   **EC-1.1: 8000ms Timeout:** Display user-friendly error card: *"The heavens are busy writing your scroll. Please verify your internet connection and try again."*
*   **EC-1.2: Empty Fields Bypass:** Sanitizes input (`.trim()`). Minimum 20 characters per field enforced.

---

# 🎬 PRODUCT REQUIREMENT DOCUMENT (PRD) — VERSION 1.1
## PROJECT CODE: **SCENESWAP-02**
## PRODUCT TITLE: **SceneSwap (Interactive Multi-Branch Party Script Engine)**

### 1. PRODUCT METADATA & OBJECTIVES
*   **Target Release Date:** October 12, 2026 (Demo Day)
*   **Core Problem:** Predictable party games lacking spontaneity, laughter, and high-replay social loops.
*   **Value Proposition:** Turns any hangout into an interactive film set where friends star in personalized, branching scripts across localized genres (Nollywood Drama, Sci-Fi Survival) with teleprompter navigation and group choice voting.

### 2. DETAILED FUNCTIONAL REQUIREMENTS (FR)
*   **FR-1.0 Party Lobby Engine:** Tag input box (`[Tunde x]`, `[Sarah x]`, 2-5 players, max 12 characters each), genre dropdown.
*   **FR-2.0 Multimodal Dual-Model Pipeline:** Chapter 1 generation with `setting_description`, `audio_cue`, structured `script_lines` (player, direction, dialogue), and `plot_choices` (options A, B, C).
*   **FR-3.0 Graphic-Novel Teleprompter View:** One-line-at-a-time chat bubble interface with tap-to-advance navigation, followed by the Choice Matrix Voting Hub branching into subsequent chapters.
