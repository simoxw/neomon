/**
 * Neo-Mon Link: Core Type Definitions
 * @version 0.1.0
 */

/**
 * Tipi elementali del sistema Neo-Mon
 */
export enum ElementType {
  Bio = 'Bio',
  Incandescente = 'Incandescente',
  Idrico = 'Idrico',
  Fulgido = 'Fulgido',
  Tetro = 'Tetro',
  Meccanico = 'Meccanico',
  Etereo = 'Etereo',
  Cinetico = 'Cinetico',
  Geologico = 'Geologico',
  Aereo = 'Aereo',
  Criogenico = 'Criogenico',
  Prismatico = 'Prismatico',
}

/**
 * Definizione delle mosse (tecniche di combattimento)
 */
export interface Move {
  id: string;
  name: string;
  type: ElementType;
  power: number;
  staminaCost: number;
  accuracy: number;
  category: 'Physical' | 'Sintonia' | 'Status';
  effect?: string; // Descrizione opzionale dell'effetto della mossa
}

/**
 * Statistiche base e di sviluppo del Neo-Mon
 */
export interface Stats {
  hp: number;
  stamina: number;
  potenza: number;
  resistenza: number;
  sintonia: number;
  spirito: number;
  flusso: number;
}

/**
 * Interfaccia principale della creatura Neo-Mon
 */
export interface NeoMon {
  id: string;
  name: string;
  types: ElementType[]; // Massimo 2 tipi
  baseStats: Stats;
  
  /** Potenziale genetico (IVs equivalent) tra 0 e 31 */
  potential: number; 
  
  /** Statistiche attuali calcolate in base a livello e potenziale */
  currentStats?: Stats;
  
  /** Flag per l'attivazione dell'evoluzione */
  canEvolve?: boolean;

  /** Statistiche di allenamento (EVs equivalent), max 50 per singola stat */
  development: {
    hp: number;
    potenza: number;
    resistenza: number;
    sintonia: number;
    spirito: number;
    flusso: number;
  };
  
  level: number;
  exp: number;
  
  /** Lista degli ID delle 3 mosse equipaggiate attualmente */
  moves: string[]; 
  
  /** Livello di affinità tra 0 e 100 */
  friendship: number; 
  
  /** Timestamp della cattura per ordinamento cronologico */
  caughtAt?: number;

  evolutionLevel?: number;
  evolvesTo?: string; // ID del Neo-Mon nello stadio successivo
}

/**
 * Dati persistenti del giocatore
 */
export interface PlayerData {
  id: number;
  name: string;
  coins: number;
  badges: string[];
  unlockedNodes: string[];
  lastSave: number;
}

/**
 * Definizione dell'inventario e degli oggetti
 */
export interface InventoryItem {
  itemId: string;
  quantity: number;
}
