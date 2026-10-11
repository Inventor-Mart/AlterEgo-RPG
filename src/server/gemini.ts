import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

export interface BiblicalArchetype {
  name: string;
  context: string;
}

export interface AnchorVerse {
  reference: string;
  text: string;
}

export interface WeeklyQuest {
  id: number;
  task: string;
  points: number;
}

export interface AlterEgoResult {
  decoded_purpose: string;
  biblical_archetype: BiblicalArchetype;
  rpg_class: string;
  anchor_verse: AnchorVerse;
  weekly_quests: WeeklyQuest[];
}

export interface SceneSwapResult {
  title: string;
  genre: string;
  logline: string;
  setting: string;
  cast: { player: string; role: string; archetype: string; motivation: string }[];
  script: { speaker: string; stageDirection?: string; line: string }[];
  directorsNote: string;
}

export interface SceneSwapCastMember {
  player: string;
  role: string;
  archetype: string;
  motivation: string;
  secret?: string;
}

export interface SceneSwapScriptLine {
  speaker: string;
  direction?: string;
  line: string;
}

export interface SceneSwapPlotChoice {
  id: 'A' | 'B' | 'C';
  label: string;
  description: string;
  consequence_hint: string;
}

export interface SceneSwapChapterResult {
  chapter_number: number;
  chapter_title: string;
  genre: string;
  tone: string;
  setting_description: string;
  audio_cue: string;
  cast: SceneSwapCastMember[];
  script_lines: SceneSwapScriptLine[];
  plot_choices: SceneSwapPlotChoice[];
  is_finale: boolean;
  finale_summary?: string;
}

export interface SceneSwapChapterInputs {
  players: string[];
  genre: string;
  tone?: string;
  wildcardHook?: string;
  chapterNumber: number;
  chosenChoice?: {
    id: string;
    label: string;
    description: string;
  };
  priorChaptersSummary?: Array<{
    chapterNumber: number;
    title: string;
    chosenChoiceLabel?: string;
  }>;
}

export interface ChapterQuestsResult {
  chapter: number;
  chapter_title: string;
  focus: string;
  quests: WeeklyQuest[];
}

export interface TaskCopilotResult {
  task_type: string;
  summary: string;
  execution_steps: string[];
  physical_checklist?: string[];
  draft_template: string;
  leadership_tip: string;
}

export async function generateTaskCopilot(inputs: {
  task: string;
  rpg_class: string;
  decoded_purpose: string;
}): Promise<TaskCopilotResult> {
  const ai = getGeminiClient();
  if (!ai) {
    return getFallbackTaskCopilot(inputs);
  }

  try {
    const prompt = `You are the AlterEgo Pro Task Copilot & Strategic Ghostwriter in Midnight Studio.
The user holds the Sovereign Pass. They are a "${inputs.rpg_class}" with the Divine Purpose: "${inputs.decoded_purpose}".
They need an actionable operational playbook and ready-to-use written draft for this task:
"${inputs.task}"

CRITICAL INSTRUCTIONS:
1. task_type: Classify this task as "Physical & Organizational Playbook" (if it involves people, teams, meetings, venues, logistics), "Drafting & Written Strategy" (if it involves writing, proposals, emails, outlines), or "Operational Sprint".
2. summary: A punchy 1-2 sentence executive breakdown of how to conquer this task with excellence.
3. execution_steps: A list of 4 concrete, sequential actions they must take in the real world (e.g. setting up a team, establishing communication channels, scheduling physical or virtual sessions, assigning roles, running the agenda).
4. physical_checklist: A list of 3-4 tangible logistical items/roles (e.g. "Team Roles: Coordinator, Tech Lead, Scribe", "Logistics: Calendar invite + shared Notion/Doc + meeting room", "Deliverable: Signed charter or agreed roadmap").
5. draft_template: A complete, ready-to-send written draft tailored to their task (e.g., outreach email to recruit team members, WhatsApp blast, meeting agenda, project proposal, or agreement memo). Include placeholders like [Name], [Date], [Link].
6. leadership_tip: A profound wisdom principle on human coordination, delegation, and kingdom stewardship.`;

    const apiCallPromise = ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an elite operational executive copilot and ghostwriter. Provide structured, highly tactical, real-world advice and copy-pasteable written drafts. Respond ONLY with valid JSON.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            task_type: { type: Type.STRING },
            summary: { type: Type.STRING },
            execution_steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            physical_checklist: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            draft_template: { type: Type.STRING },
            leadership_tip: { type: Type.STRING },
          },
          required: ['task_type', 'summary', 'execution_steps', 'physical_checklist', 'draft_template', 'leadership_tip'],
        },
      },
    });

    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 25000);
    });

    const response = await Promise.race([apiCallPromise, timeoutPromise]);
    if (!response) {
      return getFallbackTaskCopilot(inputs);
    }

    const text = response.text;
    if (text) {
      return JSON.parse(text) as TaskCopilotResult;
    }
    return getFallbackTaskCopilot(inputs);
  } catch (error) {
    console.error('Task copilot generation error:', error);
    return getFallbackTaskCopilot(inputs);
  }
}

function getFallbackTaskCopilot(inputs: {
  task: string;
  rpg_class: string;
  decoded_purpose: string;
}): TaskCopilotResult {
  const isPhysical = /team|organize|recruit|meet|call|physical|people|venue|workshop|setup|host/i.test(inputs.task);

  if (isPhysical) {
    return {
      task_type: 'Physical & Organizational Playbook',
      summary: `Assemble your core circle, assign discrete operational roles, and ground "${inputs.task}" in clear real-world logistics.`,
      execution_steps: [
        'Step 1 (Role Architecture): Define the 3 indispensable roles needed (e.g. Lead Catalyst, Operations Coordinator, Documentation Scribe).',
        'Step 2 (Targeted Outreach): Send the personalized collaboration draft to 3-4 vetted peers with high alignment to your vision.',
        'Step 3 (Kickoff Logistics): Secure a dedicated physical space or calendar block (45 mins max); circulate the 3-point agenda in advance.',
        'Step 4 (Delegation & Charter): In the meeting, assign single-owner responsibilities, establish a shared channel (WhatsApp/Slack), and fix the first weekly check-in.',
      ],
      physical_checklist: [
        'Team Composition: 3-5 core contributors max to maintain high velocity',
        'Physical Logistics: Quiet room or coffee space, whiteboarding materials/notepad, shared Google Drive folder',
        'Cadence: 30-min weekly standing sync with documented action items',
      ],
      draft_template: `Subject: Invitation to Build: Team Kickoff for [Initiative Name]\n\nHi [Name],\n\nI am currently mobilizing a focused team to execute a vital milestone: "${inputs.task}".\n\nGiven your exceptional skill in [Their Strength] and our shared conviction, I would be honored to have you as a foundational partner on this initiative.\n\nOur immediate goal is straightforward:\n1. Establish clear roles & boundaries\n2. Launch our initial 14-day operational sprint\n3. Deliver tangible impact without burnout\n\nCould we meet this [Day] at [Time] for 30 minutes to review the blueprint?\n\nIn purpose,\n[Your Name]\n${inputs.rpg_class}`,
      leadership_tip: 'Nehemiah rebuilt the walls of Jerusalem not by laying every brick himself, but by assigning families to the portion directly in front of their homes. Delegation with personal ownership creates unstoppable momentum.',
    };
  }

  return {
    task_type: 'Drafting & Written Strategy',
    summary: `Execute "${inputs.task}" with precision by deploying an authoritative, high-clarity written narrative.`,
    execution_steps: [
      'Step 1 (Core Thesis): Isolate the single most compelling hook and call-to-action for this deliverable.',
      'Step 2 (Draft Customization): Tailor the template below with your specific metrics, dates, and organizational credentials.',
      'Step 3 (Review & Refinement): Read aloud to strip out fluff, ensuring every paragraph advances the core objective.',
      'Step 4 (Dispatch & Tracking): Send via your primary channel and set a calendar reminder for follow-up within 72 hours.',
    ],
    physical_checklist: [
      'Document Format: Clean markdown or formatted Google Doc with executive styling',
      'Channels: Direct email or executive message with a 1-sentence subject line',
      'Follow-Up Protocol: 3-day quiet window before gentle value-add reminder',
    ],
    draft_template: `Subject: Strategic Proposal: ${inputs.task.slice(0, 45)}...\n\nDear [Stakeholder / Partner Name],\n\nI am reaching out regarding a strategic initiative: "${inputs.task}".\n\nOur objective as ${inputs.rpg_class} is to solve [Key Problem] while delivering measurable value to [Community / Market].\n\nHere is our proposed roadmap:\n• Phase 1: Rapid Prototype & Alignment (Days 1–7)\n• Phase 2: Deployment & Operational Feedback (Days 8–21)\n\nI have prepared a concise 1-page brief and would value your feedback during a 15-minute review.\n\nWarm regards,\n[Your Name]\n${inputs.rpg_class}`,
    leadership_tip: 'Clarity is kindness. When your writing is concise and your purpose is pure, doors open without friction.',
  };
}

export async function generateChapterQuests(inputs: {
  chapter: number;
  rpg_class: string;
  decoded_purpose: string;
  biblical_archetype?: string;
}): Promise<ChapterQuestsResult> {
  const chapter = inputs.chapter || 2;
  const titles = [
    '',
    'Chapter 1: The Awakening',
    'Chapter 2: The Forge of Craft',
    'Chapter 3: The Trial of Impact',
    'Chapter 4: Sovereign Dominion',
  ];
  const chapter_title = titles[chapter] || `Chapter ${chapter}: Ascended Campaign`;

  const ai = getGeminiClient();
  if (!ai) {
    return getFallbackChapterQuests(inputs);
  }

  try {
    const prompt = `You are AlterEgo AI (The Purpose Archetype RPG).
The user is advancing to ${chapter_title} (Week ${chapter} of their 4-Week Purpose Campaign).
Their Class is "${inputs.rpg_class}", Biblical Archetype is "${inputs.biblical_archetype || 'Bezalel'}", and Divine Purpose is "${inputs.decoded_purpose}".

Generate 3 progressive, actionable quests for this chapter:
- Quest 1: 50 points (Actionable milestone for Week ${chapter}).
- Quest 2: 75 points (Challenging skill or operational milestone).
- Quest 3: 125 points (Culminating high-impact breakthrough milestone).
Total chapter points: 250 XP.`;

    const apiCallPromise = ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        systemInstruction: 'You are the AlterEgo Campaign Master. Return ONLY a valid JSON object matching the requested schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            chapter: { type: Type.INTEGER },
            chapter_title: { type: Type.STRING },
            focus: { type: Type.STRING, description: 'One-line strategic focus of this week' },
            quests: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  task: { type: Type.STRING },
                  points: { type: Type.INTEGER },
                },
                required: ['id', 'task', 'points'],
              },
            },
          },
          required: ['chapter', 'chapter_title', 'focus', 'quests'],
        },
      },
    });

    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 25000);
    });

    const response = await Promise.race([apiCallPromise, timeoutPromise]);
    if (!response) {
      return getFallbackChapterQuests(inputs);
    }

    const text = response.text;
    if (text) {
      return JSON.parse(text) as ChapterQuestsResult;
    }
    return getFallbackChapterQuests(inputs);
  } catch (error) {
    console.error('Gemini chapter generation error:', error);
    return getFallbackChapterQuests(inputs);
  }
}

function getFallbackChapterQuests(inputs: {
  chapter: number;
  rpg_class: string;
  decoded_purpose: string;
  biblical_archetype?: string;
}): ChapterQuestsResult {
  const ch = inputs.chapter || 2;
  const idBase = (ch - 1) * 3;

  if (ch === 2) {
    return {
      chapter: 2,
      chapter_title: 'Chapter 2: The Forge of Craft',
      focus: 'Deepen systemic expertise, build core assets, and refine daily execution rhythm.',
      quests: [
        { id: idBase + 1, task: 'Complete an uninterrupted 90-minute deep work sprint architecting your core framework.', points: 50 },
        { id: idBase + 2, task: 'Stress-test your primary workflow with peer feedback or live user critique.', points: 75 },
        { id: idBase + 3, task: 'Package your first complete functional deliverable ready for real-world deployment.', points: 125 },
      ],
    };
  } else if (ch === 3) {
    return {
      chapter: 3,
      chapter_title: 'Chapter 3: The Trial of Impact',
      focus: 'Take your solution directly into the market to address pressing community and societal needs.',
      quests: [
        { id: idBase + 1, task: 'Conduct 3 direct alignment conversations with prospective users or collaborators.', points: 50 },
        { id: idBase + 2, task: 'Publish or present your public case study demonstrating tangible transformation.', points: 75 },
        { id: idBase + 3, task: 'Secure your first formal endorsement, client agreement, or strategic pilot partner.', points: 125 },
      ],
    };
  } else {
    return {
      chapter: 4,
      chapter_title: 'Chapter 4: Sovereign Dominion',
      focus: 'Anchor long-term sustainability, recurring monetization, and generational legacy.',
      quests: [
        { id: idBase + 1, task: 'Establish your long-term monetization cadence and premium pricing structure.', points: 50 },
        { id: idBase + 2, task: 'Build an operational handbook or delegation blueprint to protect your time and energy.', points: 75 },
        { id: idBase + 3, task: 'Host your milestone showcase or launch and celebrate your full Sovereign Ascension.', points: 125 },
      ],
    };
  }
}

export async function generateAlterEgo(inputs: {
  passion: string;
  skill: string;
  worldNeed: string;
  monetization: string;
}): Promise<AlterEgoResult> {
  const ai = getGeminiClient();

  if (!ai) {
    return getFallbackAlterEgo(inputs);
  }

  try {
    const prompt = `You are AlterEgo AI (The Purpose Archetype RPG) in Midnight Studio.
Synthesize the user's subjective aspirations using the dual-lens psychological system:
Japanese Ikigai Matrix + Timeless Biblical Leadership Archetypes (e.g. Luke the Physician, Deborah, Joseph, Nehemiah, Bezalel, Daniel, Esther, David, Solomon, Paul).

User Inputs:
- Quadrant 1 (Passion): "${inputs.passion.trim()}"
- Quadrant 2 (Skill): "${inputs.skill.trim()}"
- Quadrant 3 (World Need): "${inputs.worldNeed.trim()}"
- Quadrant 4 (Monetization): "${inputs.monetization.trim()}"

Generate a gamified RPG Character Blueprint.
STRICT CONSTRAINTS:
1. decoded_purpose: Maximum 150 characters synthesizing their career + ultimate impact statement.
2. biblical_archetype.name: Choose the single best-fitting biblical hero archetype matching their specific domain and vocational heart (e.g. Luke the Physician, Deborah, Joseph, Nehemiah, Bezalel, Daniel, Esther, David, Solomon, Paul).
3. biblical_archetype.context: Maximum 200 characters explaining why their modern skills match this hero's ancient mission.
4. rpg_class: A punchy gamified title combining faith and technology/vocation tailored specifically to their input (e.g. Grace Healer, Mercy Vanguard, Zion Medic, Kingdom Architect, Justice Sovereign, Kingdom Steward, Covenant Rebuilder, Zion Cryptographer).
5. anchor_verse: A relevant scripture reference and complete text that cements their specific calling and industry.
6. weekly_quests: Exactly 3 actionable quests:
   - Quest 1: 50 points (Actionable micro-goal completable in 30 minutes).
   - Quest 2: 50 points (Actionable goal relating to skill upgrading).
   - Quest 3: 100 points (Actionable goal relating to community or financial setup).`;

    const apiCallPromise = ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        systemInstruction: "You are the AlterEgo AI Engine. Return ONLY a valid JSON object matching the requested schema. No additional text.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            decoded_purpose: {
              type: Type.STRING,
              description: "Max 150 characters synthesizing career + ultimate impact statement",
            },
            biblical_archetype: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "e.g., Nehemiah, Joseph, Deborah, Bezalel, Daniel" },
                context: { type: Type.STRING, description: "Max 200 characters explaining modern connection" },
              },
              required: ["name", "context"],
            },
            rpg_class: {
              type: Type.STRING,
              description: "Punchy gamified title combining faith & tech, e.g., Kingdom Architect, Code Alchemist",
            },
            anchor_verse: {
              type: Type.OBJECT,
              properties: {
                reference: { type: Type.STRING, description: "e.g., Ephesians 2:10" },
                text: { type: Type.STRING, description: "The complete scripture text" },
              },
              required: ["reference", "text"],
            },
            weekly_quests: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  task: { type: Type.STRING },
                  points: { type: Type.INTEGER },
                },
                required: ["id", "task", "points"],
              },
            },
          },
          required: ["decoded_purpose", "biblical_archetype", "rpg_class", "anchor_verse", "weekly_quests"],
        },
      },
    });

    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 25000);
    });

    const response = await Promise.race([apiCallPromise, timeoutPromise]);

    if (!response) {
      return getFallbackAlterEgo(inputs);
    }

    const text = response.text;
    if (text) {
      return JSON.parse(text) as AlterEgoResult;
    }
    return getFallbackAlterEgo(inputs);
  } catch (error) {
    console.error("Gemini AlterEgo generation error:", error);
    return getFallbackAlterEgo(inputs);
  }
}

export async function generateSceneSwap(inputs: {
  playerNames: string;
  genre: string;
}): Promise<SceneSwapResult> {
  const ai = getGeminiClient();

  if (!ai) {
    return getFallbackSceneSwap(inputs);
  }

  try {
    const prompt = `You are the SceneSwap AI in Midnight Studio.
Cast the given players into a living, dynamic screenplay scene in the genre "${inputs.genre}".
Cast of Players: ${inputs.playerNames || "Amaka, Tunde, Chioma"}

Create a short, punchy, high-tension 4 to 5 line scene matching "${inputs.genre}".
Each player must have 1-2 sharp lines with stage directions.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        systemInstruction: "You are a master screenwriter. Return ONLY a valid JSON object matching the requested schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            genre: { type: Type.STRING },
            logline: { type: Type.STRING },
            setting: { type: Type.STRING },
            cast: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  player: { type: Type.STRING },
                  role: { type: Type.STRING },
                  archetype: { type: Type.STRING },
                  motivation: { type: Type.STRING },
                },
                required: ["player", "role", "archetype", "motivation"],
              },
            },
            script: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  speaker: { type: Type.STRING },
                  stageDirection: { type: Type.STRING },
                  line: { type: Type.STRING },
                },
                required: ["speaker", "line"],
              },
            },
            directorsNote: { type: Type.STRING },
          },
          required: ["title", "genre", "logline", "setting", "cast", "script", "directorsNote"],
        },
      },
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text) as SceneSwapResult;
    }
    return getFallbackSceneSwap(inputs);
  } catch (error) {
    console.error("Gemini SceneSwap generation error:", error);
    return getFallbackSceneSwap(inputs);
  }
}

function getFallbackAlterEgo(inputs: { passion: string; skill: string; worldNeed: string; monetization: string }): AlterEgoResult {
  const p = inputs.passion.trim() || "Creative Expression and Technology";
  const s = inputs.skill.trim() || "Architecting Digital Systems";
  const w = inputs.worldNeed.trim() || "Purposeful Direction for Youth";
  const m = inputs.monetization.trim() || "High-Impact Software and Creative Studio";
  const text = `${p} ${s} ${w} ${m}`.toLowerCase();

  let name = "Bezalel";
  let context = "Endowed with inventive ingenuity and craftsmanship to construct sacred frameworks that bridge human vision with divine excellence.";
  let rpgClass = "Kingdom Architect";
  let reference = "Exodus 31:3";
  let verseText = "And I have filled him with the Spirit of God, in wisdom, and in understanding, and in knowledge, and in all manner of workmanship.";

  if (text.match(/health|medic|doctor|heal|nurse|patient|clinic|child|care|hospital|therapy/)) {
    name = "Luke the Physician";
    context = "Combining rigorous diagnostic excellence and deep compassion to bring holistic restoration and healing to overlooked communities.";
    rpgClass = "Grace Healer";
    reference = "Luke 9:2";
    verseText = "And he sent them out to proclaim the kingdom of God and to heal the sick.";
  } else if (text.match(/law|justice|judge|policy|right|court|advoca|defend|freedom|govern/)) {
    name = "Deborah";
    context = "Operating as a fearless judicial strategist and arbiter of divine justice to break systemic chains and restore civic peace.";
    rpgClass = "Justice Sovereign";
    reference = "Micah 6:8";
    verseText = "He has shown you, O mortal, what is good. And what does the Lord require of you? To act justly and to love mercy and to walk humbly with your God.";
  } else if (text.match(/money|financ|invest|wealth|bank|fund|capital|trade|economy|supply|food|store/)) {
    name = "Joseph";
    context = "Endowed with prophetic stewardship and economic governance to preserve nations and manage kingdom resources through crisis.";
    rpgClass = "Kingdom Steward";
    reference = "Genesis 41:38-39";
    verseText = "Can we find anyone like this man, one in whom is the spirit of God? Since God has made all this known to you, there is no one so discerning and wise as you.";
  } else if (text.match(/build|wall|reconstruct|city|civil|organize|leader|team|project|infra/)) {
    name = "Nehemiah";
    context = "A disciplined rebuilder who rallies communities, overcomes opposition, and restores cultural and spiritual infrastructure.";
    rpgClass = "Covenant Rebuilder";
    reference = "Nehemiah 2:18";
    verseText = "I also told them about the gracious hand of my God on me... They replied, 'Let us start rebuilding.' So they began this good work.";
  } else if (text.match(/data|ai|cyber|code|tech|software|system|science|analyt|intellig/)) {
    name = "Daniel";
    context = "Possessing extraordinary discernment, technical mastery, and steadfast integrity in the highest courts of global influence.";
    rpgClass = "Zion Cryptographer";
    reference = "Daniel 1:17";
    verseText = "To these four young men God gave knowledge and understanding of all kinds of literature and learning. And Daniel could understand visions and dreams of all kinds.";
  } else if (text.match(/speak|preach|write|teach|educat|movement|gospel|evangel|pioneer|global/)) {
    name = "Paul";
    context = "A visionary frontier pioneer who writes foundational frameworks, mentors leaders, and establishes transformative global hubs.";
    rpgClass = "Frontier Pioneer";
    reference = "2 Timothy 4:7";
    verseText = "I have fought the good fight, I have finished the race, I have kept the faith.";
  } else if (text.match(/music|art|worship|creative|design|song|poet|media|film|entertain/)) {
    name = "David";
    context = "A creative champion and psalmist whose expressions and heart after God shepherd nations and dismantle spiritual oppression.";
    rpgClass = "Resonance Champion";
    reference = "Psalm 78:72";
    verseText = "And David shepherded them with integrity of heart; with skillful hands he led them.";
  } else if (text.match(/diplom|courage|culture|youth|women|impact|destiny|voice|public/)) {
    name = "Esther";
    context = "Placed in high-stakes cultural arenas for such a time as this, leveraging strategic favor and courage to liberate generations.";
    rpgClass = "Sovereign Advocate";
    reference = "Esther 4:14";
    verseText = "And who knows but that you have come to your royal position for such a time as this?";
  }

  return {
    decoded_purpose: `Mobilizing transformative initiatives that fuse ${p.toLowerCase()} with disciplined leadership to solve ${w.toLowerCase()}.`,
    biblical_archetype: {
      name,
      context,
    },
    rpg_class: rpgClass,
    anchor_verse: {
      reference,
      text: verseText,
    },
    weekly_quests: [
      {
        id: 1,
        task: `Dedicate 30 minutes to draft the foundational strategy of your core offering in ${m}.`,
        points: 50,
      },
      {
        id: 2,
        task: `Upgrade your mastery in ${s} by completing one focused tactical sprint.`,
        points: 50,
      },
      {
        id: 3,
        task: `Deploy your first public prototype addressing ${w} and establish initial stakeholder outreach.`,
        points: 100,
      },
    ],
  };
}

function getFallbackSceneSwap(inputs: { playerNames: string; genre: string }): SceneSwapResult {
  const players = inputs.playerNames
    .split(/[,&]+/)
    .map((n) => n.trim())
    .filter(Boolean);
  const player1 = players[0] || "Amaka";
  const player2 = players[1] || "Tunde";
  const player3 = players[2] || "Chioma";

  if (inputs.genre === "Sci-Fi Survival") {
    return {
      title: "Oxygen Zero: Orbital Lockdown",
      genre: "Sci-Fi Survival",
      logline: "When life support fails aboard Station 9, three crew members discover the override key only has one remaining charge.",
      setting: "INT. SECTOR 4 AIRLOCK - DEEP ORBIT - ZERO GRAVITY",
      cast: [
        { player: player1, role: "Commander Alex", archetype: "The Stoic Leader", motivation: "Keep the crew alive at all costs." },
        { player: player2, role: "Chief Engineer Ray", archetype: "The Pragmatist", motivation: "Bypass the failing cooling grid before containment breaches." },
        { player: player3, role: "Specialist Maya", archetype: "The Codebreaker", motivation: "Uncover why the distress beacon was manually cut." },
      ],
      script: [
        { speaker: player1, stageDirection: "adjusting visor as warning lights strobe crimson", line: "Oxygen reserves are down to six minutes. Report!" },
        { speaker: player2, stageDirection: "sparks flying from the manual override relay", line: "The conduit fried. Someone rerouted the main conduit from the bridge." },
        { speaker: player3, stageDirection: "staring intently at the encrypted terminal display", line: "It wasn't a malfunction, Commander. The seal was locked from the outside." },
        { speaker: player1, stageDirection: "voice dropping to a cold, steady whisper", line: "Then we don't fix the ship. We find out who locked us in here." },
      ],
      directorsNote: "Keep the camera tight on reflections in the helmets. Sound design should emphasize breathing and metal creaks.",
    };
  }

  return {
    title: "The Will of Victoria Island",
    genre: "Nollywood Drama",
    logline: "A family dynasty teeters on the brink as long-buried secrets surface during the reading of Chief Balogun's final testament.",
    setting: "INT. BALOGUN BANQUET HALL - VICTORIA ISLAND - EVENING",
    cast: [
      { player: player1, role: "Chief Mrs. Florence", archetype: "The Fierce Matriarch", motivation: "Protect the Balogun empire from pretenders." },
      { player: player2, role: "Dapo Balogun", archetype: "The Ambitious Heir", motivation: "Take rightful control of the conglomerate." },
      { player: player3, role: "Dr. Kemi", archetype: "The Inconvenient Truth", motivation: "Reveal the truth of the missing foundation funds." },
    ],
    script: [
      { speaker: player1, stageDirection: "adjusting her royal gélé with slow, deliberate authority", line: "Look at me very well, Dapo. Do you think this empire was built on excuses and empty signatures?" },
      { speaker: player2, stageDirection: "standing up, slamming the leather document binder on the mahogany table", line: "Mama, times have changed! The board voted this morning, and the shares are signed to my name!" },
      { speaker: player3, stageDirection: "stepping forward from the doorway holding a sealed blue envelope", line: "Not those shares, Dapo. Before Papa closed his eyes, he gave me this deed. You might want to sit down." },
      { speaker: player1, stageDirection: "a knowing smile curling at the corner of her lips", line: "I told you, my son. In this house, walls have ears, and bank accounts have memories." },
    ],
    directorsNote: "Dramatic crash-zoom on Dapo's face as the blue envelope drops. Swelling strings with suspenseful African percussions.",
  };
}

export async function generateSceneSwapChapter(inputs: SceneSwapChapterInputs): Promise<SceneSwapChapterResult> {
  const cleanPlayers = (inputs.players || [])
    .map((p) => p.trim())
    .filter((p) => p.length > 0 && p.length <= 16);
  const playerList = cleanPlayers.length >= 2 ? cleanPlayers : ["Amaka", "Tunde", "Chioma"];
  const chapterNumber = Math.min(Math.max(inputs.chapterNumber || 1, 1), 3);
  const isFinale = chapterNumber === 3;
  const genre = inputs.genre || "Nollywood Drama";
  const tone = inputs.tone || "High Energy & Hilarious Drama";
  const wildcardHook = inputs.wildcardHook?.trim();

  const ai = getGeminiClient();
  if (!ai) {
    return getFallbackSceneSwapChapter({ ...inputs, players: playerList, chapterNumber });
  }

  try {
    let actContext = "";
    if (chapterNumber === 1) {
      actContext = `ACT I: THE INCITING INCIDENT & FIRST TWIST.
The scene must establish the high-tension scenario, reveal the dynamic between the cast, and end on a critical decision point where a secret or dilemma is exposed.
${wildcardHook ? `Wildcard Hook to weave into the scene: "${wildcardHook}"` : ""}`;
    } else if (chapterNumber === 2) {
      actContext = `ACT II: THE CRISIS & ESCALATION.
In the previous chapter, the group chose: "${inputs.chosenChoice?.label || 'Option A'}: ${inputs.chosenChoice?.description || 'Escalate the situation'}".
Now the consequences explode! The stakes are raised, an unexpected complication arises, and they are forced into an even crazier dilemma.`;
    } else {
      actContext = `ACT III: THE GRAND FINALE & RESOLUTION.
In the previous chapter, the group chose: "${inputs.chosenChoice?.label || 'Option A'}: ${inputs.chosenChoice?.description || 'The Final Gambit'}".
This is the climax! Deliver the explosive, dramatic or comedic culmination of this story. All players get unforgettable punchy final lines.`;
    }

    const prompt = `You are the SceneSwap Director (Interactive Multi-Branch Party Script Engine) in Midnight Studio.
Genre: "${genre}"
Tone: "${tone}"
Current Chapter: Chapter ${chapterNumber} of 3 (${actContext})
Cast of Real-Life Party Players: ${playerList.join(", ")}

STRICT SCREENPLAY RULES:
1. Every player in ${JSON.stringify(playerList)} MUST be cast as a distinct character with their exact player name, character role, archetype, motivation, and a quirky/dramatic secret.
2. Provide a vivid, atmospheric setting_description (e.g. "INT. CHIEF ODUKOYA'S PENTHOUSE - BANANA ISLAND - MIDNIGHT RAINSTORM").
3. Provide an evocative audio_cue (sound effects, musical tension, talking drums, or synthwave stabs).
4. Create 6 to 9 script_lines. Every single player MUST have at least 1-2 spoken lines. Each line must include the exact player name as 'speaker', an evocative acting direction in brackets as 'direction' (e.g. "[Gasping, clutching their chest with royal disbelief]"), and natural, punchy 'line' matching "${genre}".
5. Plot Choices:
   ${
     isFinale
       ? "Because this is Chapter 3 (The Grand Finale), is_finale must be true. plot_choices should be empty array []. Provide a memorable, dramatic 2-3 sentence 'finale_summary' wrapping up the story and declaring the winner or ultimate aftermath."
       : "Because this is Chapter " +
         chapterNumber +
         ", provide exactly 3 distinct, compelling branching plot choices (Option A, Option B, Option C) for the party to vote on. Each choice must have id ('A', 'B', 'C'), label (punchy title), description (what action happens next), and consequence_hint (a juicy teaser of what might happen). Set is_finale to false."
   }`;

    const apiCallPromise = ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        systemInstruction:
          "You are the SceneSwap AI Director. Generate dynamic, funny, gripping branching screenplays for live party groups. Return ONLY valid JSON matching the schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            chapter_number: { type: Type.INTEGER },
            chapter_title: { type: Type.STRING },
            genre: { type: Type.STRING },
            tone: { type: Type.STRING },
            setting_description: { type: Type.STRING },
            audio_cue: { type: Type.STRING },
            cast: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  player: { type: Type.STRING },
                  role: { type: Type.STRING },
                  archetype: { type: Type.STRING },
                  motivation: { type: Type.STRING },
                  secret: { type: Type.STRING },
                },
                required: ["player", "role", "archetype", "motivation"],
              },
            },
            script_lines: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  speaker: { type: Type.STRING },
                  direction: { type: Type.STRING },
                  line: { type: Type.STRING },
                },
                required: ["speaker", "direction", "line"],
              },
            },
            plot_choices: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  description: { type: Type.STRING },
                  consequence_hint: { type: Type.STRING },
                },
                required: ["id", "label", "description", "consequence_hint"],
              },
            },
            is_finale: { type: Type.BOOLEAN },
            finale_summary: { type: Type.STRING },
          },
          required: [
            "chapter_number",
            "chapter_title",
            "genre",
            "tone",
            "setting_description",
            "audio_cue",
            "cast",
            "script_lines",
            "plot_choices",
            "is_finale",
          ],
        },
      },
    });

    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 25000);
    });

    const response = await Promise.race([apiCallPromise, timeoutPromise]);
    if (!response) {
      return getFallbackSceneSwapChapter({ ...inputs, players: playerList, chapterNumber });
    }

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text) as SceneSwapChapterResult;
      parsed.chapter_number = chapterNumber;
      parsed.is_finale = isFinale;
      return parsed;
    }
    return getFallbackSceneSwapChapter({ ...inputs, players: playerList, chapterNumber });
  } catch (error) {
    console.error("Gemini SceneSwap chapter generation error:", error);
    return getFallbackSceneSwapChapter({ ...inputs, players: playerList, chapterNumber });
  }
}

export function getFallbackSceneSwapChapter(inputs: SceneSwapChapterInputs): SceneSwapChapterResult {
  const players = (inputs.players || []).filter(Boolean);
  const p1 = players[0] || "Amaka";
  const p2 = players[1] || "Tunde";
  const p3 = players[2] || "Chioma";
  const p4 = players[3] || "Femi";
  const ch = inputs.chapterNumber || 1;
  const isFinale = ch === 3;
  const genre = inputs.genre || "Nollywood Drama";
  const tone = inputs.tone || "Dramatic & High Energy";

  // Sci-Fi Survival Fallback
  if (genre === "Sci-Fi Survival") {
    if (ch === 1) {
      return {
        chapter_number: 1,
        chapter_title: "Act I: Pressure Drop",
        genre: "Sci-Fi Survival",
        tone,
        setting_description: "INT. SECTOR 4 AIRLOCK - ORBITAL RESEARCH STATION - RED ALERT STROBE LIGHTS",
        audio_cue: "Deafening atmospheric decompression horn with frantic mechanical clicking.",
        cast: [
          { player: p1, role: "Commander", archetype: "The Stoic Veteran", motivation: "Seal the hull before oxygen hits zero.", secret: "Knows the station was sabotaged from within." },
          { player: p2, role: "Chief Engineer", archetype: "The Nervous Tech", motivation: "Reroute power before the reactor overloads.", secret: "Lost the master biometric key thirty minutes ago." },
          { player: p3, role: "Medical Officer", archetype: "The Skeptic", motivation: "Keep everyone from hyperventilating.", secret: "Discovered an unknown pathogen in the air scrubbers." },
          ...(players.length >= 4 ? [{ player: p4, role: "Communications Officer", archetype: "The Renegade", motivation: "Broadcast distress beacon.", secret: "Intercepted a classified bounty order." }] : []),
        ],
        script_lines: [
          { speaker: p1, direction: "[Pounding on the emergency lockdown terminal as warning sirens wail]", line: "Hold your breath! Sector 4 seal has breached, and life support is dropping three percent every second!" },
          { speaker: p2, direction: "[Crawling under the glowing conduit rack, sparks bouncing off their helmet visor]", line: "The main fuse didn't blow! Someone physically cut the primary backup cables with laser shears!" },
          { speaker: p3, direction: "[Checking the biometric bio-scanner with trembling fingers]", line: "Forget the cables! The air filtration system is pumping unknown synthetic mist into the cabins!" },
          ...(players.length >= 4 ? [{ speaker: p4, direction: "[Tapping the encrypted headset with wide eyes]", line: "Commander, someone just transmitted an override command from inside this exact airlock!" }] : []),
          { speaker: p1, direction: "[Turning slowly toward the squad, hand resting near the side holster]", line: "Nobody touches that blast door until we figure out who just locked us in." },
        ],
        plot_choices: [
          { id: "A", label: "Option A: Manual Airlock Venting", description: "Purge the toxic mist into deep space, risking complete atmospheric collapse.", consequence_hint: "Will save them from the poison, but leaves only 2 minutes of reserve oxygen!" },
          { id: "B", label: "Option B: Confront the Saboteur", description: "Demand everyone reveal their personal logs before unlocking the security hatch.", consequence_hint: "Mutiny could erupt, but the traitor will be exposed immediately!" },
          { id: "C", label: "Option C: Reroute to Auxiliary Core", description: "Crawl through the radiation-shielded maintenance tunnel to reach bridge controls.", consequence_hint: "Extremely dangerous crawl, but unlocks station surveillance cameras!" },
        ],
        is_finale: false,
      };
    } else if (ch === 2) {
      return {
        chapter_number: 2,
        chapter_title: "Act II: Containment Protocol",
        genre: "Sci-Fi Survival",
        tone,
        setting_description: "INT. AUXILIARY POWER JUNCTION - ZERO GRAVITY TUNNEL - SPARKS & SMOKE",
        audio_cue: "Heavy magnetic boot clangs echo against cold titanium bulkheads.",
        cast: [
          { player: p1, role: "Commander", archetype: "The Stoic Veteran", motivation: "Prevent total ship blowout.", secret: "Battery charge at 12%." },
          { player: p2, role: "Chief Engineer", archetype: "The Pragmatist", motivation: "Restore gravity stabilizers.", secret: "Bypassed three safety interlocks." },
          { player: p3, role: "Medical Officer", archetype: "The Truth-Seeker", motivation: "Contain biological contamination.", secret: "Has an antidote vial." },
          ...(players.length >= 4 ? [{ player: p4, role: "Communications Officer", archetype: "The Wildcard", motivation: "Signal rescue frigate.", secret: "Signal might ping pirate vessels." }] : []),
        ],
        script_lines: [
          { speaker: p2, direction: "[Floating in zero-G, wrestling with a charred copper busbar]", line: "I rerouted the secondary junction! We have three minutes of emergency gravity, that is all!" },
          { speaker: p1, direction: "[Grabbing the safety railing as boots clamp to the metal deck]", line: "Gravity is back, but look at the pressure monitors. The escape pods are ejecting empty!" },
          { speaker: p3, direction: "[Holding up a glowing cyan canister found inside the wall panel]", line: "Someone wanted us trapped while they stole the Genesis sample! Look at this seal!" },
          ...(players.length >= 4 ? [{ speaker: p4, direction: "[Frantically scanning telemetry]", line: "A stealth shuttle just decoupled from the exterior hull! They are leaving us behind!" }] : []),
          { speaker: p1, direction: "[Eyes hardening behind the illuminated visor glass]", line: "We are not dying in orbit today. We take control of the orbital rail cannon." },
        ],
        plot_choices: [
          { id: "A", label: "Option A: Fire the Rail Cannon", description: "Disable the fleeing shuttle's thrusters to force them back.", consequence_hint: "Could detonate the entire docking ring!" },
          { id: "B", label: "Option B: Overload the Reactor Core", description: "Create an electromagnetic pulse that paralyzes all local ships including the shuttle.", consequence_hint: "High risk of total darkness and hypothermia!" },
          { id: "C", label: "Option C: Space Walk Boarding", description: "Leap across open vacuum to intercept the shuttle docking hatch manually.", consequence_hint: "Wildly heroic stunt with fifty-fifty survival odds!" },
        ],
        is_finale: false,
      };
    } else {
      return {
        chapter_number: 3,
        chapter_title: "Act III: The Genesis Gambit (Grand Finale)",
        genre: "Sci-Fi Survival",
        tone,
        setting_description: "INT. COMMAND BRIDGE - EARTH LOOMING MAJESTICALLY IN THE BACKGROUND - SUNBURST HORIZON",
        audio_cue: "Triumphant electronic brass crescendo accompanied by steady heartbeat monitor.",
        cast: [
          { player: p1, role: "Commander", archetype: "The Legend", motivation: "Save Earth and the crew.", secret: "Vindicated." },
          { player: p2, role: "Chief Engineer", archetype: "The Heroic Genius", motivation: "Celebrated survivor.", secret: "Fixed the impossible." },
          { player: p3, role: "Chief Medical Officer", archetype: "Guardian", motivation: "Secured the cure.", secret: "Saved humanity." },
          ...(players.length >= 4 ? [{ player: p4, role: "Comms Master", archetype: "The Ace", motivation: "Broadcasting victory.", secret: "Worldwide broadcast." }] : []),
        ],
        script_lines: [
          { speaker: p1, direction: "[Slamming the master command beacon into the console socket with authority]", line: "Target locked. Shuttles neutralized, life support restored to one hundred percent!" },
          { speaker: p2, direction: "[Collapsing into the pilot chair with an ecstatic sigh of relief]", line: "I never doubted my wiring for a single second! Okay... maybe for two seconds." },
          { speaker: p3, direction: "[Holding the intact medical vial up to the sunlight pouring through the canopy]", line: "The sample is safe. Earth will have the cure before morning." },
          ...(players.length >= 4 ? [{ speaker: p4, direction: "[Throwing both hands in the air cheering]", line: "Earth Command is responding on all frequencies! They are naming an entire fleet after us!" }] : []),
          { speaker: p1, direction: "[Looking out into the sunrise with an unforgettable smirk]", line: "Cut the alarms. Someone pour a victory ration. We just saved the world." },
        ],
        plot_choices: [],
        is_finale: true,
        finale_summary: "Against impossible orbital odds, the crew thwarted the sabotage, retrieved the vital Genesis sample, and steered Station 9 into triumphant stabilization as heroes of the Sol System.",
      };
    }
  }

  // Nollywood Drama Fallback (Default)
  if (ch === 1) {
    return {
      chapter_number: 1,
      chapter_title: "Act I: The Reading of the Will",
      genre: "Nollywood Drama",
      tone,
      setting_description: "INT. CHIEF BALOGUN'S BANQUET PARLOUR - IKOYI - HEAVY MAHOGANY FURNITURE & GOLD DUSTED CHANDELIER",
      audio_cue: "Dramatic Nollywood high-suspense synthetic piano strike followed by distant thunder rumble.",
      cast: [
        { player: p1, role: "Chief Mrs. Florence", archetype: "The Fierce Matriarch", motivation: "Retain total control over the Balogun shipping empire.", secret: "Has the original lawyer's testament locked in her royal handbag." },
        { player: p2, role: "Dapo Balogun", archetype: "The Ambitious London Returnee", motivation: "Seize the family conglomerate before creditors call.", secret: "Owes thirty million naira in overseas cryptocurrency debts." },
        { player: p3, role: "Barrister Kemi", archetype: "The Unbribable Attorney", motivation: "Read the unadulterated truth of Chief's final wishes.", secret: "Was offered a blank check this morning to alter page four." },
        ...(players.length >= 4 ? [{ player: p4, role: "Uncle Segun", archetype: "The Suspicious Elder", motivation: "Claim ancestral family land in Ibadan.", secret: "Arrived with two fake witnesses waiting in the gatehouse." }] : []),
      ],
      script_lines: [
        { speaker: p1, direction: "[Slowly adjusting her towering golden gélé with regal, terrifying calm]", line: "Look at me very well, Dapo. Do you think sixty years of sweat and empire was built for you to gamble away?" },
        { speaker: p2, direction: "[Slamming an Italian leather briefcase onto the mahogany glass table]", line: "Mama, times have changed! The London board recognized my signature as sole managing director yesterday!" },
        { speaker: p3, direction: "[Clearing throat loudly and breaking the red wax seal on a thick blue envelope]", line: "Excuse me, everyone! Before anyone signs any checks, Chief Balogun recorded a video testament with me yesterday." },
        ...(players.length >= 4 ? [{ speaker: p4, direction: "[Spitting out kola nut and pointing his walking stick aggressively]", line: "Video what?! In this culture, a dead man cannot speak through a television set!" }] : []),
        { speaker: p1, direction: "[Eyes narrowing with ice-cold venom as she turns to the lawyer]", line: "Barrister Kemi... if you value your license and your car parked outside, choose your next words very carefully." },
      ],
      plot_choices: [
        { id: "A", label: "Option A: Play the Secret Video", description: "Insert the flash drive into the 85-inch television to reveal Chief's dying confession.", consequence_hint: "Will expose Dapo's secret debt, but might disinherit everyone!" },
        { id: "B", label: "Option B: Florence's Power Play", description: "Chief Mrs. Florence orders the bodyguards to confiscate the envelope immediately.", consequence_hint: "Will trigger an all-out shouting match and flying champagne glasses!" },
        { id: "C", label: "Option C: The Mysterious Stranger Knocks", description: "A loud bang at the ornate front double doors reveals an uninvited guest claiming to be Chief's first-born.", consequence_hint: "Complete pandemonium in Ikoyi!" },
      ],
      is_finale: false,
    };
  } else if (ch === 2) {
    return {
      chapter_number: 2,
      chapter_title: "Act II: Bloodline & Betrayal",
      genre: "Nollywood Drama",
      tone,
      setting_description: "INT. PRIVATE STUDY - THE BALOGUN MANSION - DRAMATIC LIGHTNING FLASHES THROUGH RAIN WINDOWS",
      audio_cue: "Furious talking drums syncopated with high-pitched suspense string trills.",
      cast: [
        { player: p1, role: "Chief Mrs. Florence", archetype: "The Untouchable Matriarch", motivation: "Crush the rebellion.", secret: "Already hired new forensic accountants." },
        { player: p2, role: "Dapo Balogun", archetype: "The Cornered Heir", motivation: "Find the real vault key.", secret: "Sweating profusely." },
        { player: p3, role: "Barrister Kemi", archetype: "The Whistleblower", motivation: "Protect the truth.", secret: "Wearing a hidden wire." },
        ...(players.length >= 4 ? [{ player: p4, role: "Uncle Segun", archetype: "The Opportunist", motivation: "Switch allegiances.", secret: "Stole the deed from the study." }] : []),
      ],
      script_lines: [
        { speaker: p2, direction: "[Pacing frantically, loosening silk tie as thunder claps]", line: "The bank accounts are frozen! Every single one! Mama, did you instruct the Central Bank?!" },
        { speaker: p1, direction: "[Sipping hot hibiscus tea from a porcelain teacup with total serenity]", line: "God gives, and Mama takes away. You thought you were playing chess with small boys in London?" },
        { speaker: p3, direction: "[Unrolling a stamped deed with government seal in front of them]", line: "The accounts weren't frozen by Mama! The anti-fraud commission traced a twenty billion transfer initiated from this IP address!" },
        ...(players.length >= 4 ? [{ speaker: p4, direction: "[Sneaking toward the garden exit with a bulging briefcase]", line: "Family matter is good, but when police sirens enter the compound, elder must take evening stroll!" }] : []),
        { speaker: p2, direction: "[Grabbing the edge of the desk, staring in sheer terror]", line: "Wait... someone set me up! The password was only known by one other person in this room!" },
      ],
      plot_choices: [
        { id: "A", label: "Option A: Unmask the Real Mole", description: "Check the study CCTV footage on the iPad to catch the real culprit red-handed.", consequence_hint: "Guaranteed jaw-dropping reveal of who transferred the billions!" },
        { id: "B", label: "Option B: The Dramatic Collapse", description: "Dapo feigns sudden medical distress to buy time while his driver sneaks into the vault.", consequence_hint: "Pure theatrical drama with ambulance sirens!" },
        { id: "C", label: "Option C: Call the Elder Council", description: "Summon the royal elders to adjudicate the dispute with customary oath-taking.", consequence_hint: "Swearing before the ancestral staff of truth!" },
      ],
      is_finale: false,
    };
  } else {
    return {
      chapter_number: 3,
      chapter_title: "Act III: The Coronation of Truth (Grand Finale)",
      genre: "Nollywood Drama",
      tone,
      setting_description: "INT. THE GRAND BALLROOM - EKO HOTEL GALA - FLASHBULBS POPPING & ROYAL TRUMPETS SOUNDING",
      audio_cue: "Joyous highlife music erupts with celebratory brass and traditional cheering.",
      cast: [
        { player: p1, role: "Chief Mrs. Florence", archetype: "The Undisputed Empress", motivation: "Rule the empire in peace.", secret: "Finally smiling." },
        { player: p2, role: "Dapo Balogun", archetype: "The Reformed Heir", motivation: "Accept humble redemption.", secret: "Promised to work from ground floor up." },
        { player: p3, role: "Barrister Kemi", archetype: "Senior Advocate of Nigeria", motivation: "Justice delivered.", secret: "Awarded master retainership." },
        ...(players.length >= 4 ? [{ player: p4, role: "Uncle Segun", archetype: "The Dancing Elder", motivation: "Spray crisp naira notes.", secret: "First on the dancefloor." }] : []),
      ],
      script_lines: [
        { speaker: p3, direction: "[Stepping up to the podium microphone as three hundred guests applaud]", line: "Ladies and gentlemen, the truth has spoken! The Balogun Foundation belongs equally to the people, and the empire stands united!" },
        { speaker: p2, direction: "[Bowing respectfully before Florence with hands held out in truce]", line: "Mama, forgive my impatience. A son must learn to walk before he runs to seize the crown." },
        { speaker: p1, direction: "[Placing a royal beaded necklace over Dapo's neck with tears of joy]", line: "Stand up, my son! When gold passes through fire, it shines brighter! Let the champagne flow!" },
        ...(players.length >= 4 ? [{ speaker: p4, direction: "[Throwing stacks of crisp naira notes into the air dancing Shaku-Shaku]", line: "Oya spray the money! Sorrow has vanished from Ikoyi tonight!" }] : []),
        { speaker: p1, direction: "[Raising her golden champagne flute high toward the ceiling]", line: "To the Balogun bloodline: unbreakable, undefeated, and forever glorious!" },
      ],
      plot_choices: [],
      is_finale: true,
      finale_summary: "In a breathtaking climax of loyalty and grace, the family secrets were cleansed, the conspirators were exposed, and the dynasty celebrated its triumphant royal reunion with laughter, dance, and an unbreakable covenant.",
    };
  }
}

export interface RealisticImageRequest {
  genre: string;
  tone?: string;
  setting_description: string;
  chapter_number?: number;
  chapter_title?: string;
  type?: 'scene' | 'character';
  aspectRatio?: '9:16' | '16:9' | '3:4' | '1:1';
  cast?: Array<{
    player: string;
    role: string;
    archetype?: string;
    motivation?: string;
    secret?: string;
    wardrobe?: string;
    props?: string;
    facialFeatures?: string;
    heritagePrompt?: string;
  }>;
  characterConsistencyPrompt?: string;
  physicalActionPrompt?: string;
  activeSpeaker?: string;
  activeLine?: string;
  character?: {
    player: string;
    role: string;
    archetype: string;
    secret?: string;
  };
}

export interface RealisticImageResponse {
  imageUrl: string;
  promptUsed: string;
  isAiGenerated: boolean;
  type: 'scene' | 'character';
}

// Global in-memory cache and circuit breaker for image generation
const imageCache = new Map<string, RealisticImageResponse>();
let imageQuotaCooldownUntil = 0;

export async function generateSceneSwapRealisticImage(
  inputs: RealisticImageRequest
): Promise<RealisticImageResponse> {
  const isCharacter = inputs.type === 'character';
  const genre = inputs.genre || 'Nollywood Drama';
  const tone = inputs.tone || 'Cinematic & Dramatic';
  const setting = inputs.setting_description || 'Opulent Lagos Manor Hall';
  const chapterNumber = inputs.chapter_number || 1;

  // Generate cache key
  const cacheKey = isCharacter && inputs.character
    ? `char:${inputs.character.player}:${inputs.character.role}:${genre}`
    : `scene:${genre}:${chapterNumber}:${setting.slice(0, 40)}`;

  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  // Characters are generated with instant photorealistic vector art
  if (isCharacter && inputs.character) {
    const result: RealisticImageResponse = {
      imageUrl: getFallbackRealisticImage(inputs),
      promptUsed: `Portrait of ${inputs.character.player} as ${inputs.character.role}`,
      isAiGenerated: false,
      type: 'character',
    };
    imageCache.set(cacheKey, result);
    return result;
  }

  const targetAspectRatio = inputs.aspectRatio === '16:9' ? '16:9' : '9:16';

  // Build prominent character staging and consistency description inside the scene
  const castListText = inputs.cast && inputs.cast.length > 0
    ? inputs.cast
        .map((c) => {
          const wardrobeInfo = c.wardrobe ? ` wearing ${c.wardrobe}` : '';
          const propsInfo = c.props ? ` carrying/using ${c.props}` : '';
          const heritageInfo = c.heritagePrompt ? ` [heritage: ${c.heritagePrompt}]` : '';
          return `Character "${c.player}" as "${c.role}" (${c.archetype || 'Lead'})${heritageInfo}${wardrobeInfo}${propsInfo}`;
        })
        .join(', ')
    : 'The main ensemble cast members dressed in genre-authentic costumes';

  const activeFocusText = inputs.activeSpeaker
    ? `Featuring ${inputs.activeSpeaker} in active mid-scene dialogue: "${inputs.activeLine || ''}".`
    : '';

  const consistencyDirective = inputs.characterConsistencyPrompt
    ? `\n${inputs.characterConsistencyPrompt}\n`
    : '';

  const actionDirective = inputs.physicalActionPrompt
    ? `PHYSICAL ACTION & INTERACTION (GRAPHIC NOVEL / COMIC STYLE): ${inputs.physicalActionPrompt}`
    : `PHYSICAL ACTION & INTERACTION: The characters are physically inside the setting interacting together and engaging with the environment (e.g. if fight scene, they are in dynamic combat; if confrontation, face-to-face clash; if celebration, raising glasses together).`;

  const prompt = targetAspectRatio === '9:16'
    ? `Cinematic 9:16 vertical film still, full scene illustration, graphic novel cinematic splash art, 8k Arri Alexa 35 cinema capture. Movie Genre: "${genre}". Tone: "${tone}". Scene Setting: "${setting}". Act ${chapterNumber}: "${inputs.chapter_title || ''}".
CHARACTERS IN THE SCENE: ${castListText}.
${activeFocusText}
${actionDirective}
${consistencyDirective}
CRITICAL RULES:
- Characters MUST be physically drawn inside the environment interacting directly with each other and the setting like a graphic novel frame.
- NO floating avatars, circular headshots, or separate profile bubbles.
- Keep character wardrobe, facial look, hair, and props strictly consistent across all scenes.
- Dynamic camera composition, volumetric lighting, rich color grade, cinematic masterpiece, no text, no captions, no watermarks.`
    : `Cinematic wide 16:9 movie still, full scene graphic novel frame, 8k Arri Alexa 35 anamorphic lens. Movie Genre: "${genre}". Tone: "${tone}". Scene Setting: "${setting}". Act ${chapterNumber}.
CHARACTERS IN THE SCENE: ${castListText}.
${activeFocusText}
${actionDirective}
${consistencyDirective}
CRITICAL RULES:
- Characters MUST be physically inside the environment interacting together like a graphic novel or film still.
- NO floating avatars, circular headshots, or isolated portrait cards.
- Keep character wardrobe, facial look, hair, and props strictly consistent across all scenes.
- Masterful composition, dramatic lighting, no text, no watermarks, cinematic film still.`;

  const ai = getGeminiClient();
  const isCooldown = Date.now() < imageQuotaCooldownUntil;

  if (ai && !isCooldown) {
    try {
      const apiCallPromise = ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: targetAspectRatio,
          },
        },
      });

      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), 25000);
      });

      const response = await Promise.race([apiCallPromise, timeoutPromise]);

      if (response && response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            const imageUrl = `data:${mime};base64,${part.inlineData.data}`;
            const successResult: RealisticImageResponse = {
              imageUrl,
              promptUsed: prompt,
              isAiGenerated: true,
              type: 'scene',
            };
            imageCache.set(cacheKey, successResult);
            return successResult;
          }
        }
      }
    } catch (err: any) {
      // Check for rate limit / quota exhaustion (429 RESOURCE_EXHAUSTED)
      const errStr = String(err?.message || err);
      if (err?.status === 'RESOURCE_EXHAUSTED' || errStr.includes('429') || errStr.includes('quota') || errStr.includes('limit: 0')) {
        // Activate 1-hour circuit breaker to prevent repeated failed requests
        imageQuotaCooldownUntil = Date.now() + 60 * 60 * 1000;
      }
    }
  }

  // Fallback to high-fidelity realistic procedural backdrop / portrait
  const fallbackUrl = getFallbackRealisticImage(inputs);
  const fallbackResult: RealisticImageResponse = {
    imageUrl: fallbackUrl,
    promptUsed: prompt,
    isAiGenerated: false,
    type: 'scene',
  };
  imageCache.set(cacheKey, fallbackResult);
  return fallbackResult;
}

export function getFallbackRealisticImage(inputs: RealisticImageRequest): string {
  const isCharacter = inputs.type === 'character';
  const genre = inputs.genre || 'Nollywood Drama';
  const chapter = Math.min(Math.max(inputs.chapter_number || 1, 1), 3);

  if (isCharacter) {
    const role = (inputs.character?.role || '').toLowerCase();
    const player = (inputs.character?.player || '').toLowerCase();

    if (role.includes('matriarch') || role.includes('florence') || player.includes('amaka')) return '/images/characters/matriarch.jpg';
    if (role.includes('heir') || role.includes('dapo') || player.includes('tunde')) return '/images/characters/heir.jpg';
    if (role.includes('attorney') || role.includes('lawyer') || role.includes('barrister') || player.includes('chioma') || player.includes('kemi')) return '/images/characters/attorney.jpg';
    if (role.includes('elder') || role.includes('uncle') || role.includes('segun') || player.includes('femi')) return '/images/characters/elder.jpg';
    if (role.includes('commander') || role.includes('captain')) return '/images/characters/commander.jpg';
    if (role.includes('engineer') || role.includes('tech')) return '/images/characters/engineer.jpg';
    if (role.includes('medic') || role.includes('doctor')) return '/images/characters/medic.jpg';
    if (role.includes('rogue') || role.includes('hacker')) return '/images/characters/rogue.jpg';
    return '/images/characters/socialite.jpg';
  }

  // Realistic photographic scene film still backdrops
  if (genre.includes('Sci-Fi')) {
    if (chapter === 1) return '/images/scenes/scifi_act1.jpg';
    if (chapter === 2) return '/images/scenes/scifi_act2.jpg';
    return '/images/scenes/scifi_act3.jpg';
  }

  if (genre.includes('Afro') || genre.includes('Heist')) {
    if (chapter === 1) return '/images/scenes/heist_act1.jpg';
    if (chapter === 2) return '/images/scenes/heist_act2.jpg';
    return '/images/scenes/heist_act3.jpg';
  }

  if (genre.includes('Horror')) {
    if (chapter === 1) return '/images/scenes/horror_act1.jpg';
    if (chapter === 2) return '/images/scenes/horror_act2.jpg';
    return '/images/scenes/horror_act3.jpg';
  }

  if (genre.includes('Rom') || genre.includes('Comedy')) {
    if (chapter === 1) return '/images/scenes/romcom_act1.jpg';
    if (chapter === 2) return '/images/scenes/romcom_act2.jpg';
    return '/images/scenes/romcom_act3.jpg';
  }

  if (genre.includes('Cyber') || genre.includes('Detective')) {
    if (chapter === 1) return '/images/scenes/detective_act1.jpg';
    if (chapter === 2) return '/images/scenes/detective_act2.jpg';
    return '/images/scenes/detective_act3.jpg';
  }

  // Nollywood Drama default
  if (chapter === 1) return '/images/scenes/nollywood_act1.jpg';
  if (chapter === 2) return '/images/scenes/nollywood_act2.jpg';
  return '/images/scenes/nollywood_act3.jpg';
}

function getRealisticSceneSvg(genre: string, chapter: number, settingDesc: string): string {
  let palette = {
    bg1: '#120404',
    bg2: '#2b0909',
    accent1: '#ca8a04',
    accent2: '#eab308',
    glow: 'rgba(234, 179, 8, 0.25)',
    ambient: '#450a0a',
  };

  if (genre.includes('Sci-Fi')) {
    palette = {
      bg1: '#020617',
      bg2: '#0f172a',
      accent1: '#06b6d4',
      accent2: '#38bdf8',
      glow: 'rgba(6, 182, 212, 0.3)',
      ambient: '#082f49',
    };
  } else if (genre.includes('Afro') || genre.includes('Heist')) {
    palette = {
      bg1: '#052e16',
      bg2: '#022c22',
      accent1: '#10b981',
      accent2: '#34d399',
      glow: 'rgba(16, 185, 129, 0.3)',
      ambient: '#064e3b',
    };
  } else if (genre.includes('Horror')) {
    palette = {
      bg1: '#180728',
      bg2: '#2e1065',
      accent1: '#a855f7',
      accent2: '#c084fc',
      glow: 'rgba(168, 85, 247, 0.25)',
      ambient: '#3b0764',
    };
  } else if (genre.includes('Rom') || genre.includes('Comedy')) {
    palette = {
      bg1: '#2b0817',
      bg2: '#4c0519',
      accent1: '#f43f5e',
      accent2: '#fb7185',
      glow: 'rgba(244, 63, 94, 0.3)',
      ambient: '#881337',
    };
  } else if (genre.includes('Cyber') || genre.includes('Detective')) {
    palette = {
      bg1: '#0a0a1a',
      bg2: '#1e1b4b',
      accent1: '#6366f1',
      accent2: '#818cf8',
      glow: 'rgba(99, 102, 241, 0.3)',
      ambient: '#312e81',
    };
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="100%" height="100%">
    <defs>
      <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
        <stop offset="40%" stop-color="transparent" stop-opacity="0" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0.85" />
      </radialGradient>
      <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${palette.bg1}" />
        <stop offset="60%" stop-color="${palette.bg2}" />
        <stop offset="100%" stop-color="${palette.ambient}" />
      </linearGradient>
      <radialGradient id="keyLight" cx="35%" cy="30%" r="60%">
        <stop offset="0%" stop-color="${palette.accent2}" stop-opacity="0.45" />
        <stop offset="50%" stop-color="${palette.accent1}" stop-opacity="0.15" />
        <stop offset="100%" stop-color="transparent" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0a0a0f" />
        <stop offset="100%" stop-color="#030305" />
      </linearGradient>
      <filter id="cinematicGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="24" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <rect width="1280" height="720" fill="url(#skyGrad)" />
    <circle cx="450" cy="220" r="480" fill="url(#keyLight)" />

    <path d="M 0 480 L 180 320 L 420 320 L 520 480 Z" fill="#000000" opacity="0.4" />
    <path d="M 760 480 L 880 340 L 1120 340 L 1280 480 Z" fill="#000000" opacity="0.4" />

    <rect x="240" y="80" width="800" height="420" rx="24" fill="none" stroke="${palette.accent1}" stroke-opacity="0.25" stroke-width="2" />
    <rect x="280" y="120" width="720" height="340" rx="16" fill="none" stroke="${palette.accent2}" stroke-opacity="0.15" stroke-width="1" />

    <polygon points="0,500 1280,500 1280,720 0,720" fill="url(#floorGrad)" />
    <ellipse cx="640" cy="540" rx="420" ry="40" fill="${palette.glow}" filter="url(#cinematicGlow)" />

    <line x1="0" y1="500" x2="1280" y2="500" stroke="${palette.accent1}" stroke-opacity="0.4" stroke-width="2" />

    <circle cx="320" cy="260" r="2.5" fill="#ffffff" opacity="0.6" />
    <circle cx="480" cy="360" r="1.8" fill="${palette.accent2}" opacity="0.7" />
    <circle cx="820" cy="210" r="3" fill="#ffffff" opacity="0.5" />
    <circle cx="940" cy="380" r="2" fill="${palette.accent1}" opacity="0.8" />
    <circle cx="640" cy="190" r="2.2" fill="#ffffff" opacity="0.7" />

    <rect width="1280" height="720" fill="url(#vignette)" />

    <rect x="0" y="0" width="1280" height="28" fill="#000000" opacity="0.9" />
    <rect x="0" y="692" width="1280" height="28" fill="#000000" opacity="0.9" />

    <text x="36" y="20" fill="#a1a1aa" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" letter-spacing="2">ACT ${chapter} CINEMATIC FILM STILL • ${genre.toUpperCase()}</text>
    <text x="1244" y="20" text-anchor="end" fill="${palette.accent2}" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" letter-spacing="1">ARRI ALEXA 8K</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function getRealisticCharacterSvg(name: string, role: string, genre: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash << 5) - hash + name.charCodeAt(i);
  const colorIndex = Math.abs(hash) % 5;

  const skinTones = ['#8d5524', '#c68642', '#e0ac69', '#f1c27d', '#50331e'];
  const skin = skinTones[Math.abs(hash) % skinTones.length];
  const hairColors = ['#09090b', '#1c1917', '#292524', '#18181b', '#0f172a'];
  const hair = hairColors[(Math.abs(hash) >> 2) % hairColors.length];
  const outfitAccents = ['#eab308', '#ec4899', '#38bdf8', '#a855f7', '#10b981'];
  const accent = outfitAccents[colorIndex];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <defs>
      <linearGradient id="charBg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#18181b" />
        <stop offset="100%" stop-color="#09090b" />
      </linearGradient>
      <radialGradient id="rimLight" cx="30%" cy="20%" r="70%">
        <stop offset="0%" stop-color="${accent}" stop-opacity="0.6" />
        <stop offset="60%" stop-color="${accent}" stop-opacity="0.1" />
        <stop offset="100%" stop-color="transparent" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${skin}" />
        <stop offset="100%" stop-color="#2d1a0e" />
      </linearGradient>
    </defs>
    
    <rect width="400" height="400" rx="32" fill="url(#charBg)" />
    <circle cx="150" cy="120" r="180" fill="url(#rimLight)" />

    <path d="M 60 380 Q 200 310 340 380 L 340 400 L 60 400 Z" fill="#1c1917" />
    <path d="M 120 340 L 200 375 L 280 340 Z" fill="${accent}" opacity="0.9" />

    <rect x="175" y="240" width="50" height="70" rx="8" fill="url(#skinGrad)" />
    <ellipse cx="200" cy="190" rx="65" ry="85" fill="url(#skinGrad)" />

    <path d="M 130 190 Q 120 100 200 95 Q 280 100 270 190 Q 250 120 200 125 Q 150 120 130 190 Z" fill="${hair}" />

    <ellipse cx="175" cy="180" rx="8" ry="5" fill="#ffffff" />
    <circle cx="175" cy="180" r="3.5" fill="#18181b" />
    <ellipse cx="225" cy="180" rx="8" ry="5" fill="#ffffff" />
    <circle cx="225" cy="180" r="3.5" fill="#18181b" />
    
    <path d="M 160 165 Q 175 160 190 166" stroke="#18181b" stroke-width="3.5" fill="none" stroke-linecap="round" />
    <path d="M 210 166 Q 225 160 240 165" stroke="#18181b" stroke-width="3.5" fill="none" stroke-linecap="round" />

    <path d="M 197 185 L 195 205 L 205 205" stroke="#2d1a0e" stroke-width="2.5" fill="none" stroke-linecap="round" />
    <path d="M 180 225 Q 200 240 220 225" stroke="#ffffff" stroke-width="3.5" fill="none" stroke-linecap="round" />

    <path d="M 135 150 Q 130 230 170 265" stroke="${accent}" stroke-width="3" fill="none" opacity="0.8" />

    <rect x="20" y="340" width="360" height="42" rx="12" fill="#000000" fill-opacity="0.75" />
    <text x="200" y="360" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="bold">${name}</text>
    <text x="200" y="375" text-anchor="middle" fill="${accent}" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="600">${role}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

