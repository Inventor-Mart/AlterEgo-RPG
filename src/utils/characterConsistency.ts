// ============================================================================
// CHARACTER VISUAL BIBLE & CONTINUITY LOCK ENGINE
// Locks characters' physical look, facial features, wardrobe, and props
// across all acts and scene branches for graphic novel & cinematic consistency.
// ============================================================================

import { detectNameNationality, detectGenderAffinity } from './characterAvatars';

export interface LockedCharacterVisual {
  player: string;
  role: string;
  archetype: string;
  heritagePrompt: string; // Used strictly in prompts, never displayed in UI
  facialFeatures: string;
  hairStyle: string;
  wardrobe: string;
  signatureProps: string;
  expressionProfile: string;
}

export type CharacterVisualBible = Record<string, LockedCharacterVisual>;

const STORAGE_KEY_BIBLE = 'sceneswap_character_visual_bible_v2';

/**
 * Get the saved visual bible from localStorage
 */
export function getStoredVisualBible(): CharacterVisualBible {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BIBLE);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Save the visual bible to localStorage
 */
export function saveStoredVisualBible(bible: CharacterVisualBible): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_BIBLE, JSON.stringify(bible));
  } catch (err) {
    console.warn('Failed to save character visual bible:', err);
  }
}

/**
 * Clear the stored visual bible (when starting a brand new party game)
 */
export function clearStoredVisualBible(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_BIBLE);
  } catch (err) {
    console.warn('Failed to clear character visual bible:', err);
  }
}

/**
 * Wardrobe templates locked by genre and archetype
 */
const WARDROBE_PRESETS: Record<string, { wardrobe: string; props: string }[]> = {
  nollywood: [
    {
      wardrobe: 'Crisp midnight-blue Agbada with ornate gold metallic embroidery across the chest and tailored trousers',
      props: 'Heavy engraved gold signet ring on right pinky finger, slim gold watch',
    },
    {
      wardrobe: 'Royal emerald-green silk Gele headwrap and fitted off-shoulder brocade gown with shimmering beadwork',
      props: 'Chunky polished coral beaded necklace and matching gold statement drop earrings',
    },
    {
      wardrobe: 'Sharp bespoke charcoal Italian wool three-piece suit with ivory silk tie and pocket square',
      props: 'Encrypted black leather portfolio and vintage fountain pen',
    },
    {
      wardrobe: 'Crimson tailored velvet dinner jacket with black satin peak lapels and tailored dress pants',
      props: 'Gold-rimmed aviator sunglasses hanging from collar, gold signet band',
    },
    {
      wardrobe: 'Regal burgundy traditional Kaftan with intricate diamond geometric collar embroidery',
      props: 'Carved ivory ceremonial walking cane and woven wristlet',
    },
  ],
  scifi: [
    {
      wardrobe: 'Matte carbon-fiber armored flight suit with neon cyan biometric LED seams and reinforced joints',
      props: 'Holographic wrist-mounted comms gauntlet and magnetic holster',
    },
    {
      wardrobe: 'White and chrome orbital scientist coat over slate pressurized tactical jumpsuit',
      props: 'Floating optical scanner lens over left eye, transparent datapad',
    },
    {
      wardrobe: 'Stealth combat exo-rig with titanium shoulder plating and thermal dampening mesh',
      props: 'Plasma sidearm locked in quick-draw thigh rig, tactical visor',
    },
    {
      wardrobe: 'High-collar cybernetic operative duster in distressed obsidian weave with copper wiring accents',
      props: 'Cyberware data-jack port on right temple, neural hacking deck',
    },
  ],
  heist: [
    {
      wardrobe: 'Matte black tactical turtleneck with Kevlar-weave utility harness and covert combat trousers',
      props: 'Titanium lockpick pen in breast slot, biometric earpiece communicator',
    },
    {
      wardrobe: 'Immaculate tailored midnight-navy tuxedo with concealed silk shoulder holster and cufflinks',
      props: 'Laser vault frequency bypass key fob, vintage gold pocket watch',
    },
    {
      wardrobe: 'Sleek leather motorcycle jacket with reinforced elbows, dark denim and combat boots',
      props: 'Encrypted drone remote control handset on belt, mirrored aviators',
    },
    {
      wardrobe: 'High-fashion metallic silver cocktail dress with concealed ceramic blade sheath at thigh',
      props: 'Diamond-encrusted audio bug compact mirror, sapphire pendant',
    },
  ],
  cyberpunk: [
    {
      wardrobe: 'Weathered neon-yellow reinforced courier jacket with glowing optic cables and armored knee trousers',
      props: 'Implanted cyber-optic ocular HUD in right eye, chrome deck deckpack',
    },
    {
      wardrobe: 'Synthetic leather trenchcoat with ultraviolet circuit patterns running down both sleeves',
      props: 'Glow-wire knuckle duster on left hand, data siphon jack',
    },
    {
      wardrobe: 'Corporate security carbon-weave blazer with internal ballistic plating and smart-tie',
      props: 'Micro-projector lapel pin, encrypted thumbprint reader',
    },
  ],
  horror: [
    {
      wardrobe: 'Distressed tweed academic coat with leather elbow patches, wool vest and weathered boots',
      props: 'Antique brass kerosene lantern and leather-bound occult grimoire',
    },
    {
      wardrobe: 'Heavy waxed rain canvas coat with fleece collar and waterproof field boots',
      props: 'Vintage silver crucifix pendant and tactical flash beam torch',
    },
    {
      wardrobe: 'Dark vintage Victorian high-neck mourning dress with lace collar and obsidian buttons',
      props: 'Silver locket containing dried sage, heirloom candleholder',
    },
  ],
  default: [
    {
      wardrobe: 'Sleek dark tailored cinematic wardrobe with modern structured silhouette and textured fabrics',
      props: 'Signature metallic watch and sleek smartphone device',
    },
    {
      wardrobe: 'Contemporary high-contrast cinematic ensemble with sharp lines and rich color grading',
      props: 'Distinctive leather notebook and silver pendant necklace',
    },
    {
      wardrobe: 'Rugged stylized cinematic jacket over dark knit shirt and durable field trousers',
      props: 'Tactical wrist compass and worn leather belt pouch',
    },
  ],
};

/**
 * Generate or retrieve locked visual identity for every character in the cast.
 * Once created for a story, this visual bible is completely immutable so that
 * the characters have 100% consistent faces, hair, wardrobe, and props across all scenes.
 */
export function lockOrGetCharacterVisualBible(
  cast: Array<{ player: string; role: string; archetype?: string; motivation?: string }>,
  genre: string,
  customPhotos: Record<string, string> = {}
): CharacterVisualBible {
  const existing = getStoredVisualBible();
  let updated = { ...existing };
  let hasNew = false;

  const normalizedGenre = genre.toLowerCase().includes('scifi') || genre.toLowerCase().includes('sci-fi')
    ? 'scifi'
    : genre.toLowerCase().includes('heist')
    ? 'heist'
    : genre.toLowerCase().includes('cyber')
    ? 'cyberpunk'
    : genre.toLowerCase().includes('horror')
    ? 'horror'
    : genre.toLowerCase().includes('nollywood') || genre.toLowerCase().includes('afro')
    ? 'nollywood'
    : 'default';

  const presets = WARDROBE_PRESETS[normalizedGenre] || WARDROBE_PRESETS.default;

  cast.forEach((member, index) => {
    const key = member.player.toLowerCase().trim();
    if (!updated[key]) {
      hasNew = true;
      const nationality = detectNameNationality(member.player);
      const gender = detectGenderAffinity(member.player, member.role);
      const isFemale = gender === 'female';
      const preset = presets[index % presets.length];

      // Physical facial features and hair locked for continuity
      let facialFeatures = '';
      let hairStyle = '';

      if (nationality.nationality === 'nigerian') {
        facialFeatures = isFemale
          ? 'Radiant warm deep espresso complexion, sculpted high cheekbones, expressive warm dark brown eyes'
          : 'Rich dark espresso skin, clean sculpted jawline, well-groomed beard fade, confident gaze';
        hairStyle = isFemale
          ? 'Intricate braided crown updo adorned with subtle gold thread'
          : 'Crisp short buzz cut with sharp temple line-up';
      } else if (nationality.nationality === 'asian') {
        facialFeatures = isFemale
          ? 'Luminous porcelain tone, elegant almond-shaped dark eyes, refined facial contours'
          : 'Sharp jawline, intense focused dark eyes, high cheekbones';
        hairStyle = isFemale
          ? 'Sleek jet-black shoulder-length hair tucked behind one ear'
          : 'Modern textured undercut styled with matte clay';
      } else if (nationality.nationality === 'south_asian') {
        facialFeatures = isFemale
          ? 'Warm golden-bronze complexion, striking kohl-rimmed dark eyes, graceful facial profile'
          : 'Warm caramel-bronze skin tone, defined sharp jaw, manicured stubble, piercing gaze';
        hairStyle = isFemale
          ? 'Thick lustrous dark wavy hair parted gracefully'
          : 'Classic groomed voluminous dark hair swept back';
      } else if (nationality.nationality === 'hispanic') {
        facialFeatures = isFemale
          ? 'Warm sun-kissed olive complexion, dramatic dark eyes, defined brows'
          : 'Sharp angular features, warm bronze skin, five o-clock shadow, charismatic intense expression';
        hairStyle = isFemale
          ? 'Dark brunette curls cascading over shoulders'
          : 'Tapered fade with textured wavy dark hair on top';
      } else if (nationality.nationality === 'middle_eastern') {
        facialFeatures = isFemale
          ? 'Warm olive-amber skin, captivating dark almond eyes with dramatic lashes'
          : 'Distinguished profile, olive undertones, trimmed full beard, piercing dark gaze';
        hairStyle = isFemale
          ? 'Long flowing midnight-black waves framing face'
          : 'Polished dark hair brushed back with clean side taper';
      } else {
        facialFeatures = isFemale
          ? 'Defined features, expressive luminous eyes, natural elegant makeup'
          : 'Chiseled jaw, focused determined eyes, clean shave or subtle stubble';
        hairStyle = isFemale
          ? 'Sophisticated styled hair with loose natural waves'
          : 'Sharp classic side-part haircut with clean silhouette';
      }

      // Check if custom photo was uploaded
      const hasCustomPhoto = !!customPhotos[key];
      const customNote = hasCustomPhoto
        ? `[Continuity Note: Match likeness and hairstyle from player's uploaded reference portrait for ${member.player}]`
        : '';

      updated[key] = {
        player: member.player,
        role: member.role,
        archetype: member.archetype || 'Lead',
        heritagePrompt: `${nationality.label} ethnic appearance and features ${customNote}`.trim(),
        facialFeatures,
        hairStyle,
        wardrobe: preset.wardrobe,
        signatureProps: preset.props,
        expressionProfile: 'Intense cinematic presence, expressive eye contact, distinct signature stance',
      };
    }
  });

  if (hasNew) {
    saveStoredVisualBible(updated);
  }

  return updated;
}

/**
 * Extract physical action keywords from the script and setting
 * to ensure characters are depicted in active physical interaction (fighting, clashing, arguing, escaping, etc.)
 */
export function extractPhysicalSceneAction(
  settingDescription: string,
  scriptLines: Array<{ speaker: string; direction?: string; line: string }>,
  chapterTitle = ''
): string {
  const combinedText = [
    chapterTitle,
    settingDescription,
    ...scriptLines.map((l) => `${l.direction || ''} ${l.line}`),
  ].join(' ').toLowerCase();

  if (/fight|punch|kick|brawl|clash|attack|strike|weapon|sword|gun|shoot|combat|duel|tackle/.test(combinedText)) {
    return 'HIGH-OCTANE PHYSICAL COMBAT: The characters are in dynamic, mid-action combat—striking, defending, weapons drawn or clashing hand-to-hand with kinetic energy, debris and dramatic motion blur like a premier graphic novel fight splash page.';
  }

  if (/chase|run|flee|escape|sprint|pursue|dash|vehicle|drive/.test(combinedText)) {
    return 'HIGH-SPEED PURSUIT & ESCAPE: The characters are in active motion, running, sprinting through obstacles, glancing over shoulders, caught in a breathless chase sequence.';
  }

  if (/argue|shout|confront|accuse|point|yell|betray|threaten|stare/.test(combinedText)) {
    return 'INTENSE DRAMATIC CONFRONTATION: Characters are standing toe-to-toe in a fierce standoff, pointing accusing fingers, leaning across a table or cornering each other with furious facial expressions and charged body language.';
  }

  if (/hack|terminal|vault|lock|safe|laser|disable|steal|infiltrat/.test(combinedText)) {
    return 'TENSE COVERT INFILTRATION: Characters are actively working side-by-side on the heist—one hacking the glowing console or cracking the safe while another watches the doorway with weapon drawn and heightened alert.';
  }

  if (/toast|celebrat|laugh|drink|party|cheer|embrace|kiss|dance/.test(combinedText)) {
    return 'VIBRANT CELEBRATION & TOAST: Characters are raising ornate glasses in a triumphant toast, leaning in close with genuine smiles and emotional camaraderie amidst the opulent setting.';
  }

  if (/investigat|search|clue|examine|inspect|whisper|uncover/.test(combinedText)) {
    return 'ATMOSPHERIC INVESTIGATION: Characters are crouching together over crucial physical evidence, one shining a light while the other examines the artifact with keen scrutiny.';
  }

  return 'DYNAMIC DRAMATIC INTERACTION: Characters are physically interacting with each other and their environment, moving through the space with expressive body language and active cinematic engagement.';
}

/**
 * Formulate a complete character continuity prompt block for image generation
 */
export function buildContinuityPromptBlock(
  bible: CharacterVisualBible,
  activeCast: Array<{ player: string; role: string }>,
  actionDescription: string
): string {
  const characterDescriptions = activeCast
    .map((member) => {
      const charKey = member.player.toLowerCase().trim();
      const locked = bible[charKey];
      if (!locked) return null;

      return `- "${locked.player}" as ${locked.role}: ${locked.heritagePrompt}. Face & Hair: ${locked.facialFeatures}, ${locked.hairStyle}. LOCKED WARDROBE (MUST NOT CHANGE): ${locked.wardrobe}. LOCKED SIGNATURE PROPS: ${locked.signatureProps}.`;
    })
    .filter(Boolean)
    .join('\n');

  return `
=== MANDATORY CHARACTER CONTINUITY LOCK (STRICT COHESION) ===
The characters in this scene MUST retain their EXACT identical facial identity, hairstyle, locked wardrobe, and signature props as established in Act 1:
${characterDescriptions}

=== GRAPHIC NOVEL SCENE ACTION (CHARACTERS IN ACTION) ===
${actionDescription}
IMPORTANT: Do NOT render characters as separate portrait headshots or UI floating icons. The characters MUST be physically rendered INSIDE the scene illustration itself, interacting with one another and the environment, fully drawn into the environment just like a cinematic graphic novel or comic book panel.
`.trim();
}
