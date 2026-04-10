/**
 * Utility per il caricamento dinamico delle risorse grafiche dei Neo-Mon.
 * Utilizza la logica URL di Vite per garantire la compatibilità con GitHub Pages.
 */

export const getCreatureSprite = (id: string): string => {
  try {
    // Usiamo import.meta.env.BASE_URL che viene popolato da Vite in base al config.
    // In locale sarà '/' e in produzione '/neomon/'.
    const baseUrl = import.meta.env.BASE_URL;
    return `${baseUrl}assets/sprites/${id}.webp`;
  } catch (err) {
    return 'https://placehold.co/400x400/0f172a/22d3ee?text=NEOMON';
  }
};
