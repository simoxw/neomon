/**
 * Utility per il caricamento dinamico delle risorse grafiche dei Neo-Mon.
 * Utilizza la logica URL di Vite per garantire la compatibilità con GitHub Pages.
 */

export const getCreatureSprite = (id: string): string => {
  try {
    // Le immagini in 'public' sono servite direttamente dalla root.
    // Usiamo il percorso relativo 'assets/sprites/' per massima compatibilità con GitHub Pages.
    return `./assets/sprites/${id}.webp`;
  } catch (err) {
    return 'https://placehold.co/400x400/0f172a/22d3ee?text=NEOMON';
  }
};
