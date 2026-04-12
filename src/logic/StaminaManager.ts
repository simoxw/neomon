/**
 * Neo-Mon Link: Stamina Management Logic
 * @version 0.1.2
 */

// Costanti di Configurazione
export const BASE_RECOVERY = 10;           // Stamina recuperata passivamente ogni turno
export const REST_RECOVERY_PERCENT = 0.5;  // 50% del massimo recuperato con l'azione "Riposo"
export const MAX_STAMINA_DEFAULT = 100;    // Valore massimo standard (fallback)

/**
 * Sottrae il costo dalla stamina attuale garantendo che non scenda sotto 0.
 */
export const consumeStamina = (current: number, cost: number): number => {
  return Math.max(0, current - cost);
};

/**
 * Aggiunge il recupero passivo standard senza superare il valore massimo.
 */
export const passiveRecovery = (current: number, max: number): number => {
  return Math.min(max, current + BASE_RECOVERY);
};

/**
 * Calcola il recupero tramite azione attiva "Riposo" (50% del Max).
 */
export const restAction = (current: number, max: number): number => {
  const recoveryAmount = max * REST_RECOVERY_PERCENT;
  return Math.min(max, current + recoveryAmount);
};

export type CanUseMoveResult = { ok: true } | { ok: false; message: string };

/**
 * Verifica se c'è abbastanza stamina per la mossa (costi non numerici = non utilizzabile).
 */
export const canUseMove = (current: number, cost: number | undefined): CanUseMoveResult => {
  if (typeof cost !== 'number' || Number.isNaN(cost)) {
    return { ok: false, message: 'Stamina insufficiente' };
  }
  if (current < cost) return { ok: false, message: 'Stamina insufficiente' };
  return { ok: true };
};

/**
 * Restituisce true se la stamina attuale è sufficiente per coprire il costo richiesto.
 */
export const canPerformMove = (current: number, cost: number): boolean => {
  return canUseMove(current, cost).ok;
};

/**
 * Verifica se la creatura è esausta (stamina a 0).
 * Utile per applicare stati di "Affaticamento" o bloccare i turni.
 */
export const isExhausted = (current: number): boolean => {
  return current <= 0;
};
