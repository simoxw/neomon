export interface LinkQuality { 
  id: string; name: string; 
  boostedStat: 'attack'|'defense'|'speed'|'specialAtk'|'specialDef'; 
  nerfedStat:  'attack'|'defense'|'speed'|'specialAtk'|'specialDef'; 
  description: string; 
} 

export const LINK_QUALITIES: LinkQuality[] = [ 
  { id:"overclock",  name:"Overclock",   boostedStat:"speed",      nerfedStat:"defense",    description:"Velocità massima, barriere trascurate." }, 
  { id:"berserker",  name:"Berserker",   boostedStat:"attack",     nerfedStat:"specialDef", description:"Attacca senza sosta, esposto alle frequenze." }, 
  { id:"fortress",   name:"Fortress",    boostedStat:"defense",    nerfedStat:"speed",      description:"Muri digitali impenetrabili. Lento ma solido." }, 
  { id:"phantom",    name:"Phantom",     boostedStat:"specialAtk", nerfedStat:"defense",    description:"Frequenze invisibili. Corpo fragile." }, 
  { id:"sentinel",   name:"Sentinel",    boostedStat:"specialDef", nerfedStat:"attack",     description:"Assorbe ogni interferenza. Colpi deboli." }, 
  { id:"razor",      name:"Razor",       boostedStat:"attack",     nerfedStat:"specialAtk", description:"Fisico affilato, frequenze bloccate." }, 
  { id:"psionic",    name:"Psionic",     boostedStat:"specialAtk", nerfedStat:"attack",     description:"Frequenze amplificate, forza ridotta." }, 
  { id:"ironwall",   name:"Iron Wall",   boostedStat:"defense",    nerfedStat:"specialDef", description:"Corpo blindato, mente aperta agli attacchi." }, 
  { id:"mindshield", name:"Mind Shield", boostedStat:"specialDef", nerfedStat:"defense",    description:"Frequenze schermate, corpo vulnerabile." }, 
  { id:"spark",      name:"Spark",       boostedStat:"speed",      nerfedStat:"attack",     description:"Iper-reattivo. Forza sacrificata." }, 
  { id:"glitch",     name:"Glitch",      boostedStat:"specialAtk", nerfedStat:"specialDef", description:"Potenza instabile. Schermatura instabile." },
  { id:"tank",       name:"Tank",        boostedStat:"defense",    nerfedStat:"attack",     description:"Resistente ma poco incisivo." },
  { id:"scout",      name:"Scout",       boostedStat:"speed",      nerfedStat:"specialAtk", description:"Rapido nel posizionamento, attacco speciale ridotto." },
  { id:"heavy",      name:"Heavy",       boostedStat:"attack",     nerfedStat:"speed",      description:"Colpi pesanti, movimenti impacciati." },
  { id:"mystic",     name:"Mystic",      boostedStat:"specialDef", nerfedStat:"specialAtk", description:"Resistenza magica, attacco speciale limitato." },
  { id:"agile",      name:"Agile",       boostedStat:"speed",      nerfedStat:"specialDef", description:"Movimenti fluidi, vulnerabile alle onde." },
  { id:"warrior",    name:"Warrior",     boostedStat:"attack",     nerfedStat:"defense",    description:"Focalizzato sull'offesa fisica." },
  { id:"sage",       name:"Sage",        boostedStat:"specialAtk", nerfedStat:"speed",      description:"Grande potere mentale, riflessi lenti." },
  { id:"guardian",   name:"Guardian",    boostedStat:"specialDef", nerfedStat:"speed",      description:"Protetto dalle frequenze, poco agile." },
  { id:"steady",     name:"Steady",      boostedStat:"defense",    nerfedStat:"specialAtk", description:"Difesa fisica costante, poco propenso all'energia." },
  { id:"volatile",   name:"Volatile",    boostedStat:"specialAtk", nerfedStat:"specialDef", description:"Energia pura, difesa instabile." },
  { id:"juggernaut", name:"Juggernaut",  boostedStat:"attack",     nerfedStat:"speed",      description:"Inarrestabile, ma lento." },
  { id:"nimble",     name:"Nimble",      boostedStat:"speed",      nerfedStat:"defense",    description:"Schivate rapide, colpi critici se colpito." },
  { id:"bastion",    name:"Bastion",     boostedStat:"defense",    nerfedStat:"specialDef", description:"Fortificato contro il fisico, debole al mentale." },
  { id:"oracle",     name:"Oracle",      boostedStat:"specialDef", nerfedStat:"attack",     description:"Visione chiara, forza fisica minima." }
]; 
