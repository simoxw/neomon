/**
 * Utility per il caricamento dinamico delle risorse grafiche dei Neo-Mon.
 * Utilizza la logica URL di Vite per garantire la compatibilità con GitHub Pages.
 */

export const getCreatureSprite = (id: string): string => {
  try {
    // Usiamo il percorso relativo per garantire la compatibilità con GitHub Pages.
    // In produzione (GitHub Pages) l'URL è https://simoxw.github.io/neomon/
    // Con base: './' in vite.config, 'assets/sprites/' punta correttamente alla cartella nel root della repo.
    return `assets/sprites/${id}.webp`;
  } catch (err) {
    return 'https://placehold.co/400x400/0f172a/22d3ee?text=NEOMON';
  }
};
