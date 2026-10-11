// Daily Divine Affirmations & Ikigai Decrees Engine for AlterEgo RPG

export interface DailyAffirmation {
  id: string;
  archetype: string;
  title: string;
  affirmation: string;
  focusAction: string;
  anchorVerse: {
    reference: string;
    text: string;
  };
  attributeBonus: string;
}

export const ARCHETYPE_AFFIRMATIONS: Record<string, DailyAffirmation[]> = {
  BEZALEL: [
    {
      id: 'bezalel-1',
      archetype: 'BEZALEL',
      title: 'Decree of Sacred Mastery & Precision',
      affirmation:
        'I am endowed with the Spirit of God in wisdom, understanding, and divine craftsmanship. Today, every project my hands touch is marked by excellence, clean architecture, and generational endurance. I reject haste, mediocrity, and confusion.',
      focusAction: 'Bring divine order to one chaotic workflow, system, or workspace before noon.',
      anchorVerse: {
        reference: 'Exodus 31:3',
        text: 'And I have filled him with the Spirit of God, in wisdom, and in understanding, and in knowledge, and in all manner of workmanship.',
      },
      attributeBonus: '+15 Systemic Architecture',
    },
    {
      id: 'bezalel-2',
      archetype: 'BEZALEL',
      title: 'Decree of Material Alignment',
      affirmation:
        'The materials, tools, and code at my disposal are instruments of kingdom purpose. I do not merely build products; I erect holy monuments of utility that solve real human distress and reflect heavenly order.',
      focusAction: 'Dedicate the first 30 minutes of deep work to refining foundational structure.',
      anchorVerse: {
        reference: 'Exodus 35:35',
        text: 'Them hath he filled with wisdom of heart, to work all manner of work, of the engraver, and of the cunning workman.',
      },
      attributeBonus: '+15 Holy Craftsmanship',
    },
    {
      id: 'bezalel-3',
      archetype: 'BEZALEL',
      title: 'Decree of Creative Endurance',
      affirmation:
        'When others see insurmountable technical bottlenecks, I see the invitation for divine insight. My mind is sharp, my patience is fortified, and my execution is steady.',
      focusAction: 'Tackle the single hardest technical obstacle on your board with quiet focus.',
      anchorVerse: {
        reference: 'Proverbs 8:12',
        text: 'I wisdom dwell with prudence, and find out knowledge of witty inventions.',
      },
      attributeBonus: '+20 Creative Fortitude',
    },
  ],
  JOSEPH: [
    {
      id: 'joseph-1',
      archetype: 'JOSEPH',
      title: 'Decree of Strategic Stewardship',
      affirmation:
        'I am appointed to steward surplus and preserve nations in seasons of famine. What was intended to harm me is converted into my promotion. I oversee resources with impeccable integrity and prophetic foresight.',
      focusAction: 'Review your resource allocations, budgets, and operational buffers for future expansion.',
      anchorVerse: {
        reference: 'Genesis 50:20',
        text: 'As for you, you meant evil against me, but God meant it for good, to bring it about that many people should be kept alive.',
      },
      attributeBonus: '+15 Market Governance',
    },
    {
      id: 'joseph-2',
      archetype: 'JOSEPH',
      title: 'Decree of Unshakable Promotion',
      affirmation:
        'Pits and prisons cannot hold the purpose God has engraved on my destiny. Wherever I am placed, I produce undeniable order, multiply value, and earn institutional trust.',
      focusAction: 'Serve your current assignment with supreme excellence as if managing an imperial treasury.',
      anchorVerse: {
        reference: 'Genesis 39:3',
        text: 'His master saw that the Lord was with him and that the Lord made all that he did to prosper in his hand.',
      },
      attributeBonus: '+20 Institutional Favor',
    },
  ],
  DANIEL: [
    {
      id: 'daniel-1',
      archetype: 'DANIEL',
      title: 'Decree of Ten-Fold Wisdom',
      affirmation:
        'I walk in an excellent spirit. The noise and compromise of Babylon have no power over my conviction. In every high-stakes counsel and algorithmic mystery, I operate ten times wiser than the world.',
      focusAction: 'Maintain an uncompromised moral boundary in every negotiation and strategic decision today.',
      anchorVerse: {
        reference: 'Daniel 1:20',
        text: 'In all matters of wisdom and understanding... he found them ten times better than all the magicians and astrologers.',
      },
      attributeBonus: '+15 Intellectual Superiority',
    },
    {
      id: 'daniel-2',
      archetype: 'DANIEL',
      title: 'Decree of Unbroken Conviction',
      affirmation:
        'My prayer life is my sovereign fortress. Political winds and market volatility do not shake my daily discipline. I decode deep mysteries because the Spirit of Holy God rests upon me.',
      focusAction: 'Guard three sacred uninterrupted prayer & reflection pauses during your day.',
      anchorVerse: {
        reference: 'Daniel 6:10',
        text: 'He got down on his knees three times a day and prayed and gave thanks before his God, as he had done previously.',
      },
      attributeBonus: '+20 Unbroken Discipline',
    },
  ],
  DEBORAH: [
    {
      id: 'deborah-1',
      archetype: 'DEBORAH',
      title: 'Decree of Prophetic Leadership',
      affirmation:
        'I arise as a mother and sovereign guardian of my industry. I do not shrink back from confrontation or crisis. When leaders hesitate, I step forward with clarity, courage, and divine battle intelligence.',
      focusAction: 'Make a decisive executive call today that you have previously postponed.',
      anchorVerse: {
        reference: 'Judges 5:7',
        text: 'Village life ceased, it ceased until I, Deborah, arose, arose a mother in Israel.',
      },
      attributeBonus: '+20 Executive Courage',
    },
    {
      id: 'deborah-2',
      archetype: 'DEBORAH',
      title: 'Decree of Strategic Vision',
      affirmation:
        'My words bring order out of paralysis. I rally alliances, commission builders, and speak victory before the battle begins. Divine wind is behind my enterprise.',
      focusAction: 'Encourage and empower one key team member or collaborator with purposeful validation.',
      anchorVerse: {
        reference: 'Judges 4:14',
        text: 'Up! For this is the day in which the Lord has delivered your enemy into your hand. Is not the Lord gone out before you?',
      },
      attributeBonus: '+15 Mobilization Power',
    },
  ],
  NEHEMIAH: [
    {
      id: 'nehemiah-1',
      archetype: 'NEHEMIAH',
      title: 'Decree of Focused Wall-Building',
      affirmation:
        'I am doing a great work and I cannot come down! Distractions, critics, and deceitful invitations cannot pull me off my scaffold. My trowel is in one hand and my sword is in the other.',
      focusAction: 'Decline one frivolous meeting or distraction that threatens your core build mission.',
      anchorVerse: {
        reference: 'Nehemiah 6:3',
        text: 'I am doing a great work, so that I cannot come down. Why should the work cease while I leave it and go down to you?',
      },
      attributeBonus: '+20 Radical Focus',
    },
    {
      id: 'nehemiah-2',
      archetype: 'NEHEMIAH',
      title: 'Decree of Rapid Reconstruction',
      affirmation:
        'Broken walls and generational ruins are reconstructed under my leadership in record time. The hand of my God is good upon me, and what seemed hopeless is completed with honor.',
      focusAction: 'Identify one broken institutional process and draft the immediate repair plan.',
      anchorVerse: {
        reference: 'Nehemiah 2:18',
        text: 'Then I told them of the hand of my God which was good upon me... And they said, Let us rise up and build.',
      },
      attributeBonus: '+15 Reconstructive Speed',
    },
  ],
  ESTHER: [
    {
      id: 'esther-1',
      archetype: 'ESTHER',
      title: 'Decree of Sovereign Timing',
      affirmation:
        'I was born and prepared for such a time as this! I carry sovereign grace and royal favor in rooms of authority. Fear is cast out by purpose; I stand in the gap for my people.',
      focusAction: 'Step into an arena of high influence with quiet confidence and sacred grace.',
      anchorVerse: {
        reference: 'Esther 4:14',
        text: 'And who knows whether you have not come to the kingdom for such a time as this?',
      },
      attributeBonus: '+20 Sovereign Favor',
    },
  ],
  PAUL: [
    {
      id: 'paul-1',
      archetype: 'PAUL',
      title: 'Decree of Unstoppable Mission',
      affirmation:
        'I run with purpose, not beating the air. I press toward the mark for the prize of the high calling. No shipwrecks, setbacks, or hardships can extinguish the fire of my divine mandate.',
      focusAction: 'Map out the boldest missionary/market expansion step for your brand this quarter.',
      anchorVerse: {
        reference: 'Philippians 3:14',
        text: 'I press on toward the goal for the prize of the upward call of God in Christ Jesus.',
      },
      attributeBonus: '+20 Apostolic Drive',
    },
  ],
  DAVID: [
    {
      id: 'david-1',
      archetype: 'DAVID',
      title: 'Decree of Giant-Slaying Faith',
      affirmation:
        'I do not run away from giants; I run toward them in the name of the Lord of Hosts. The battles I fought in the secret wilderness have prepared me to conquer in the public arena.',
      focusAction: 'Face the biggest intimidating challenge head-on today without retreat.',
      anchorVerse: {
        reference: '1 Samuel 17:45',
        text: 'You come to me with a sword, a spear, and a javelin, but I come to you in the name of the Lord of hosts.',
      },
      attributeBonus: '+20 Champion Valour',
    },
  ],
};

// Universal Ikigai Affirmations for any archetype
export const UNIVERSAL_AFFIRMATIONS: DailyAffirmation[] = [
  {
    id: 'universal-1',
    archetype: 'COVENANT ARCHITECT',
    title: 'Decree of Divine Alignment & Clarity',
    affirmation:
      'My passion, skills, market calling, and holy mission converge in harmonic power today. I am not drifting; I am walking in pre-ordained good works prepared before the foundation of the world.',
    focusAction: 'Align every task on your calendar with your core Ikigai quadrant.',
    anchorVerse: {
      reference: 'Ephesians 2:10',
      text: 'For we are His workmanship, created in Christ Jesus for good works, which God prepared beforehand that we should walk in them.',
    },
    attributeBonus: '+15 Divine Clarity',
  },
  {
    id: 'universal-2',
    archetype: 'KINGDOM PIONEER',
    title: 'Decree of Daily Harvest & Fruitfulness',
    affirmation:
      'The seeds of wisdom, sweat, and integrity I sow today shall yield a thirty, sixty, and hundredfold harvest. I am delivered from burnout and anchored in divine rhythm.',
    focusAction: 'Celebrate one small win today and sow value into someone else without expecting return.',
    anchorVerse: {
      reference: 'Galatians 6:9',
      text: 'And let us not grow weary while doing good, for in due season we shall reap if we do not lose heart.',
    },
    attributeBonus: '+15 Sustainable Stamina',
  },
  {
    id: 'universal-3',
    archetype: 'ROYAL STEWARD',
    title: 'Decree of Bold Authority',
    affirmation:
      'God has not given me a spirit of fear, but of power, love, and a sound mind. Today, doubt dissolves under the light of divine truth. I move with dignity, strength, and unwavering faith.',
    focusAction: 'Speak out your daily purpose decree aloud before opening your email or messages.',
    anchorVerse: {
      reference: '2 Timothy 1:7',
      text: 'For God has not given us a spirit of fear, but of power and of love and of a sound mind.',
    },
    attributeBonus: '+20 Sound Mind',
  },
];

/**
 * Returns today's affirmation for a given archetype, consistently keyed to the calendar date.
 */
export function getTodayAffirmation(archetypeName?: string, dayOffset: number = 0): DailyAffirmation {
  const normName = (archetypeName || 'BEZALEL').trim().toUpperCase();
  
  // Find archetype list or fallback to universal
  let pool = ARCHETYPE_AFFIRMATIONS[normName];
  if (!pool || pool.length === 0) {
    // Check if partial match exists
    const matchingKey = Object.keys(ARCHETYPE_AFFIRMATIONS).find((key) => normName.includes(key));
    pool = matchingKey ? ARCHETYPE_AFFIRMATIONS[matchingKey] : UNIVERSAL_AFFIRMATIONS;
  }

  // Combined pool including universal for variety
  const combined = [...pool, ...UNIVERSAL_AFFIRMATIONS];
  
  const today = new Date();
  today.setDate(today.getDate() + dayOffset);
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );

  const index = Math.abs(dayOfYear) % combined.length;
  return combined[index];
}

/**
 * Gets a fresh random decree for spontaneous reflection.
 */
export function getRandomDecree(archetypeName?: string): DailyAffirmation {
  const normName = (archetypeName || 'BEZALEL').trim().toUpperCase();
  let pool = ARCHETYPE_AFFIRMATIONS[normName] || UNIVERSAL_AFFIRMATIONS;
  const combined = [...pool, ...UNIVERSAL_AFFIRMATIONS];
  const randIdx = Math.floor(Math.random() * combined.length);
  return combined[randIdx];
}
