export const PLAYER_RANKS = [ 
  { id:"r-00", name:"Novice Link",    minBadges:0, minLevel:1, 
    color:"text-gray-400", 
    greeting:"Sincronizzazione iniziale completata. Benvenuto nel Nexus.", 
    subtext:"Il sistema ti ha assegnato un Neo-Mon di base." }, 
  { id:"r-01", name:"Link Runner",    minBadges:1, minLevel:10, 
    color:"text-green-400", 
    greeting:"Il Nexus riconosce la tua firma digitale.", 
    subtext:"Hai superato il primo nodo di sicurezza." }, 
  { id:"r-02", name:"Sync Operator",  minBadges:2, minLevel:20, 
    color:"text-cyan-400", 
    greeting:"Operatore rilevato. Accesso Livello 2 confermato.", 
    subtext:"Le creature ti seguono con fiducia." }, 
  { id:"r-03", name:"Nexus Drifter",  minBadges:3, minLevel:30, 
    color:"text-violet-400", 
    greeting:"Presenza anomala nel Nexus. Stai evolvendo.", 
    subtext:"I trainer ti cercano. Sei una leggenda urbana." }, 
  { id:"r-04", name:"Synapse Elite",  minBadges:4, minLevel:40, 
    color:"text-orange-400", 
    greeting:"ALLERTA NEXUS: Entità di classe S rilevata.", 
    subtext:"Sei tra i pochi che hanno toccato il nucleo." }, 
  { id:"r-05", name:"Ghost Protocol", minBadges:5, minLevel:50, 
    color:"text-rose-400", 
    greeting:"Il Nexus non riesce più a tracciarti.", 
    subtext:"La leggenda è completa. Il Nexus nasconde ancora segreti." } 
]; 

export function getCurrentRank(badges: string[], maxTeamLevel: number) { 
  return [...PLAYER_RANKS].reverse().find(r => 
    badges.length >= r.minBadges && maxTeamLevel >= r.minLevel 
  ) ?? PLAYER_RANKS[0]; 
} 
