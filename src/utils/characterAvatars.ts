// Realistic Character Portrait Photos matching roles & archetypes
const REALISTIC_PORTRAITS = [
  '/images/characters/matriarch.jpg',
  '/images/characters/heir.jpg',
  '/images/characters/attorney.jpg',
  '/images/characters/elder.jpg',
  '/images/characters/commander.jpg',
  '/images/characters/engineer.jpg',
  '/images/characters/medic.jpg',
  '/images/characters/rogue.jpg',
  '/images/characters/charming.jpg',
  '/images/characters/socialite.jpg',
];

export function getRealisticCharacterPhoto(name: string, role: string, genre: string): string {
  const lowerRole = (role || '').toLowerCase();
  const lowerName = (name || '').toLowerCase();

  if (lowerRole.includes('matriarch') || lowerRole.includes('florence') || lowerRole.includes('queen') || lowerName.includes('amaka')) {
    return '/images/characters/matriarch.jpg';
  }
  if (lowerRole.includes('heir') || lowerRole.includes('dapo') || lowerName.includes('tunde')) {
    return '/images/characters/heir.jpg';
  }
  if (lowerRole.includes('attorney') || lowerRole.includes('lawyer') || lowerRole.includes('barrister') || lowerName.includes('kemi') || lowerName.includes('chioma')) {
    return '/images/characters/attorney.jpg';
  }
  if (lowerRole.includes('elder') || lowerRole.includes('uncle') || lowerRole.includes('segun') || lowerName.includes('femi')) {
    return '/images/characters/elder.jpg';
  }
  if (lowerRole.includes('commander') || lowerRole.includes('leader') || lowerRole.includes('captain')) {
    return '/images/characters/commander.jpg';
  }
  if (lowerRole.includes('engineer') || lowerRole.includes('tech')) {
    return '/images/characters/engineer.jpg';
  }
  if (lowerRole.includes('medic') || lowerRole.includes('doctor')) {
    return '/images/characters/medic.jpg';
  }
  if (lowerRole.includes('rogue') || lowerRole.includes('hacker') || lowerRole.includes('wildcard')) {
    return '/images/characters/rogue.jpg';
  }

  // Deterministic selection based on name
  let hash = 0;
  for (let i = 0; i < (name + role).length; i++) {
    hash = (hash << 5) - hash + (name + role).charCodeAt(i);
  }
  const index = Math.abs(hash) % REALISTIC_PORTRAITS.length;
  return REALISTIC_PORTRAITS[index];
}

// Fallback vector generator if needed
export function getRealisticCharacterSvg(name: string, role: string, genre: string): string {
  return getRealisticCharacterPhoto(name, role, genre);
}

