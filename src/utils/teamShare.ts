import { NeoMon } from '../types';

export interface TeamShareData { 
  v: number;    // versione schema (1) 
  t: { 
    id: string;   // speciesId (id in our case)
    lv: number;   // level 
    mv: string[]; // 4 move IDs 
    lq: string;   // linkQuality ID 
    nn?: string;  // nickname (opzionale) 
  }[]; 
} 

export function encodeTeam(team: NeoMon[]): string { 
  const data: TeamShareData = { 
    v: 1, 
    t: team.slice(0, 4).map(c => ({ 
      id: c.id, 
      lv: c.level, 
      mv: c.moves?.slice(0, 4) || [], 
      lq: c.linkQuality ?? 'overclock', 
      nn: c.nickname || undefined 
    })) 
  }; 
  const json = JSON.stringify(data); 
  // Usa btoa con supporto per caratteri speciali (UTF-8)
  return btoa(unescape(encodeURIComponent(json))) 
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); 
} 

export function decodeTeam(code: string): TeamShareData | null { 
  try { 
    const base64 = code.replace(/-/g, '+').replace(/_/g, '/'); 
    const json = decodeURIComponent(escape(atob(base64))); 
    const data = JSON.parse(json) as TeamShareData; 
    if (data.v !== 1 || !Array.isArray(data.t)) return null; 
    return data; 
  } catch { return null; } 
} 

export function generateShareURL(team: NeoMon[]): string { 
  return `${window.location.origin}/neomon/?team=${encodeTeam(team)}`; 
} 
