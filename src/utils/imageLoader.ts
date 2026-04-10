export const getCreatureSprite = (id: string): string => {
  try {
    // import.meta.env.BASE_URL è '/' in dev e '/neomon/' in produzione.
    // Questo è il modo più affidabile per puntare alla cartella public/assets/sprites/
    return `${import.meta.env.BASE_URL}assets/sprites/${id}.webp`;
  } catch (err) {
    return 'https://placehold.co/400x400/0f172a/22d3ee?text=NEOMON';
  }
};
