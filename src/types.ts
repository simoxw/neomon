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

/** Condizioni di stato in battaglia */
export type StatusCondition =
  | 'burn'
  | 'freeze'
  | 'paralysis'
  | 'poison'
  | 'sleep'
  | 'confuse'
  | null;

/** Stage statistiche da -6 a +6 */
export interface StatStages {
  attack: number;
  defense: number;
  speed: number;
  specialAtk: number;
  specialDef: number;
}

/** Effetto strutturato di una mossa (JSON `effect` può essere oggetto o legacy string/null) */
export interface MoveEffect {
  type: 'status' | 'stat_change' | 'damage_only' | 'drain' | 'recoil' | 'damage_status';
  statusCondition?: StatusCondition;
  statusChance?: number;
  selfStatusCondition?: StatusCondition;
  statChanges?: Partial<StatStages>;
  selfStatChanges?: Partial<StatStages>;
  drainPercent?: number;
  recoilPercent?: number;
  priority?: number;
  bypassAccuracy?: boolean;
}

export type MoveCategory = 'Physical' | 'Sintonia' | 'Status' | 'physical' | 'special' | 'status';

/**
 * Definizione delle mosse (tecniche di combattimento)
 */
export interface Move {
  id: string;
  name: string;
  type: ElementType;
  power: number;
  staminaCost: number;
  /** 0–100; se assente la mossa è considerata sempre precisa (salvo bypass) */
  accuracy?: number;
  category: MoveCategory;
  /** Legacy: testo flavor; oppure oggetto MoveEffect per il motore di battaglia */
  effect?: string | MoveEffect | null;
  /** Descrizione mostrata in UI (Neural Uplink, tooltip) */
  description?: string;
  /** Livello minimo per apprendere / installare via Neural Uplink */
  learnLevel?: number;
  /** Massimo Power Points (PP) per la mossa - default 15 */
  maxPP?: number;
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
/** Obiettivo evoluzione (creatures.json): string legacy o { creatureId, level } */
export type SpeciesEvolutionTarget = string | { creatureId: string; level: number } | null;

/** Dati statici da creatures.json (specie) */
export interface CreatureSpecies {
  id: string;
  name: string;
  types: ElementType[];
  baseStats: Stats;
  moves: string[];
  /** Pool apprendibile (include mosse attive + extra) */
  learnPool?: string[];
  catchRate?: number;
  moves_learned?: { level: number; moveId: string }[];
  evolutionLevel?: number | null;
  evolvesTo?: SpeciesEvolutionTarget;
}

export interface NeoMon {
  id: string;
  name: string;
  types: ElementType[]; // Massimo 2 tipi
  baseStats: Stats;
  
  /** Potenziale genetico (IVs equivalent) tra 0 e 31 */
  potential: number; 
  
  /** Statistiche attuali calcolate in base a livello e potenziale (i.e. Massimali) */
  currentStats?: Stats;
  
  /** HP attuali (rimanenti dopo i danni) */
  currentHp?: number;

  /** Stamina attuale (rimanente dopo l'uso di mosse) */
  currentStamina?: number;

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
  
  /** ID mosse equipaggiate (max 4 in battaglia) */
  moves: string[];

  /** Power Points attuali per ogni mossa equipaggiata (parallelo a moves) */
  movePPs?: number[];

  /** Pool mosse apprendibili (specie + istanza) */
  learnPool?: string[];

  /** Stato alterato attuale (default null in useStore / battaglia) */
  status?: StatusCondition;

  /** Stage modificatori in battaglia (default tutti 0) */
  statStages?: StatStages;

  /** Turni di sonno rimanenti (solo se status === 'sleep') */
  sleepTurnsRemaining?: number;

  /** Solo in battaglia: cronologia potenziamenti stat per AI */
  statBoostHistory?: string[];

  /** Tasso cattura base specie (0–255), presente sui dati statici selvatici */
  catchRate?: number;
  
  /** Livello di affinità tra 0 e 100 */
  friendship: number; 
  
  /** Timestamp della cattura per ordinamento cronologico */
  caughtAt?: number;

  evolutionLevel?: number;
  evolvesTo?: string | { creatureId: string; level: number };
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
  defeatedTrainerIds?: string[];
  totalBattles?: number;
  totalBattlesWon?: number;
  totalCaptures?: number;
  playtimeMs?: number;
  missionProgress?: Record<string, { completed?: boolean; count?: number }>;
}

/**
 * Definizione dell'inventario e degli oggetti
 */
export interface InventoryItem {
  itemId: string;
  quantity: number;
}
