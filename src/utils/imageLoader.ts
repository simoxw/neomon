export const getCreatureSprite = (id: string): string => {
  try {
    // Percorso relativo semplice che punta a public/assets/sprites/ durante lo sviluppo
    // e alla root della dist/ dopo la build.
    return `assets/sprites/${id}.webp`;
  } catch (err) {
    return 'https://placehold.co/400x400/0f172a/22d3ee?text=NEOMON';
  }
};
