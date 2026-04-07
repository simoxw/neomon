# 🧭 Neo-Mon Link: Architettura Completa del Progetto

Questa documentazione rappresenta la mappa definitiva e aggiornata di ogni ingranaggio del sistema Neo-Mon Link. È progettata per facilitare l'analisi strutturale e la manutenzione del nucleo digitale del gioco.

---

## 📂 Albero Integrale del Progetto

```text
NEO-MON LINK
├── public/                     # Asset statici e configurazione PWA
│   ├── assets/                 # Deposito grafico centrale
│   │   └── sprites/            # Sprite creature (.webp trasparenti e .png originali)
│   ├── 404.html                # Pagina di redirect SPA per GitHub Pages (F5 su rotte deep)
│   ├── .nojekyll               # Disabilita Jekyll su GitHub Pages per preservare asset Vite
│   ├── favicon.png             # Icona browser (512px cyberpunk prisma neon)
│   ├── pwa-192x192.png         # Icona PWA per dispositivi mobile
│   ├── pwa-512x512.png         # Icona PWA ad alta risoluzione
│   ├── apple-touch-icon.png    # Icona per aggiunta alla Home su iOS
│   └── manifest.json           # Metadati PWA per installazione su mobile e icone
├── src/                        # Codice Sorgente (Il CUORE del Nexus)
│   ├── components/             # Interfaccia Utente (React)
│   │   ├── Battle/             # Sottosistema di Combattimento
│   │   │   ├── Arena.tsx           # Schermata principale scontro e UI tattica
│   │   │   ├── CatchAnimation.tsx  # Motore grafico per la sincronia dei Prismi
│   │   │   └── MoveTooltip.tsx     # Popup informativo per le tecniche di lotta
│   │   ├── Box/                # Sottosistema Archiviazione
│   │   │   ├── CreatureGrid.tsx    # Griglia dinamica del Box con Tabs (Box/Squadra) e Team Swap
│   │   │   └── TeamManager.tsx     # Gestione slot verticali della squadra attiva con riordinamento
│   │   ├── Common/             # Componenti condivisi riutilizzabili
│   │   │   ├── Button.tsx          # Bottone stilizzato multi-variante (outline, ghost, rose, cyan)
│   │   │   └── NeoMonDetailModal.tsx # Deep Scan Report unificato (stats IV/EV, moveset, XP)
│   │   ├── Hub/                # Sottosistema Centro Operativo
│   │   │   ├── Crafting.tsx        # Terminale per la creazione di tool (In sviluppo)
│   │   │   ├── LinkDex.tsx         # Enciclopedia visuale (Visto/Catturato)
│   │   │   ├── MainHub.tsx         # Dashboard con Preview Squadra e barre XP
│   │   │   ├── MissionTerminal.tsx # Modulo per la gestione degli obiettivi
│   │   │   ├── Settings.tsx        # Menu configurazione, backup e importazione
│   │   │   ├── SettingsMenu.tsx    # Sottogruppi delle impostazioni grafiche
│   │   │   └── Shop.tsx            # Terminale acquisto Prismi e Curativi
│   │   └── Navigation/         # Sottosistema Navigazione
│   │       └── NeoNavBar.tsx       # Barra inferiore per il cambio schermata PWA
│   ├── context/                # Gestione dello Stato Globale
│   │   └── useStore.ts             # Stato centralizzato: team, box, inventory, coins, swapPositions, replaceInTeam, healTeam
│   ├── data/                   # Database Statici (JSON)
│   │   ├── creatures.json          # Registro anagrafico dei 120 Neo-Mon
│   │   ├── items.json              # Listino prezzi e moltiplicatori Prismi
│   │   ├── missions.json           # Database delle Neural Missions
│   │   └── moves.json              # Libreria di tutte le 120 tecniche di lotta
│   ├── db/                     # Persistenza Dati Locale
│   │   └── index.ts                # Schema Dexie.js (IndexedDB) per salvataggi permanenti
│   ├── hooks/                  # Logiche React Riutilizzabili
│   │   ├── useBattle.ts            # Hook orchestratore del flusso di battaglia e XP
│   │   └── useInventory.ts         # Hook per la manipolazione rapida degli oggetti
│   ├── logic/                  # Motori Logici (Processori TypeScript)
│   │   ├── BattleEngine.ts         # Cervello dei combattimenti e Intelligenza Artificiale
│   │   ├── CatchSystem.ts          # Formula matematica sincronia e shakes prisma
│   │   ├── DamageCalc.ts           # Calcolo danni basato su Tipi e Stats
│   │   ├── EvolutionSystem.ts      # Monitoraggio livelli e soglie evolutive
│   │   └── StaminaManager.ts       # Gestione energia, costi mosse e riposo
│   ├── store/                  # Risorse aggiuntive dello store (se presenti)
│   ├── styles/                 # Estetica e Layer Visivi
│   │   └── index.css               # Design System: Tailwind, Neon Glow e Fonts
│   ├── utils/                  # Utility di Supporto
│   │   └── imageLoader.ts          # Caricamento dinamico e intelligente degli sprite
│   ├── App.tsx                 # Root Component (Layout 8/80/12 e Orchestrazione)
│   ├── main.tsx                # Punto di ingresso dell'applicazione (DOM Render)
│   └── types.ts                # Definizioni globali delle interfacce TypeScript
├── index.html                  # Template base con Meta-tag PWA e SEO
├── package.json                # Gestione dipendenze e script di esecuzione
├── postcss.config.js           # Ottimizzazione CSS per la build
├── tailwind.config.js          # Definizione token di design (colori neon, etc)
├── tsconfig.json               # Configurazione del compilatore TypeScript
├── vite.config.ts              # Build config: base './', PWA plugin, Terser, asset dir organizzati
├── README.md                   # Panoramica generale del progetto
├── STRUCTURE.md                # Questa guida tecnica integrale
└── GAME_GUIDE.md               # Manuale di gioco e database tattico per l'utente
```

---

## 📜 Analisi Dettagliata per File

### 📐 Logica e Motori (`src/logic/`)
- **`BattleEngine.ts`**: Il processore principale dei turni. Decide l'ordine di attacco, gestisce i messaggi di log e contiene l'IA tattica nemica.
- **`CatchSystem.ts`**: Cuore del collezionismo. Calcola le probabilità di successo basandosi su HP nemici, tipo di Prisma e Bonus Stato.
- **`DamageCalc.ts`**: Contiene la matrice delle resistenze/debolezze e la formula matematica del danno (Attacco vs Difesa).
- **`EvolutionSystem.ts`**: Gestisce i dati di crescita e segnala quando un Neo-Mon è pronto per il NEXT-GEN stadiuù.
- **`StaminaManager.ts`**: Regola il flusso di energia. Gestisce il recupero dal riposo o la penalità per esaurimento.

### 🧠 Stato e Database (`src/context/`, `src/db/`)
- **`useStore.ts`**: Fondamentale. Unisce lo stato di React con la persistenza di IndexedDB. Gestisce la cattura, gli XP e il cambio schermo.
- **`db/index.ts`**: Configura IndexedDB tramite Dexie.js. Garantisce che i Neo-Mon catturati siano salvati permanentemente nel dispositivo.

### ⚔️ Componenti Battaglia (`src/components/Battle/`)
- **`Arena.tsx`**: Layout immersivo dello scontro. Gestisce barre HP, Stamina e innesca i log di battaglia.
- **`CatchAnimation.tsx`**: Visualizza la sequenza di cattura (Lancio, Shakes, Successo/Fallimento) usando Framer Motion.
- **`MoveTooltip.tsx`**: Componente UX che descrive i dati tecnici delle mosse al passaggio dell'utente.

### 🏢 Componenti Hub (`src/components/Hub/`)
- **`MainHub.tsx`**: Dashboard principale. Mostra la squadrattiva, le barre XP dinamiche e i lanci rapidi per le missioni.
- **`LinkDex.tsx`**: Registro visivo. Mostra sprite pieni per i catturati e silhouette per quelli solo avvistati.
- **`Shop.tsx`**: Interfaccia di acquisto oggetti con scalamento automatico delle monete.
- **`Settings.tsx`**: Console di controllo per l'esportazione/importazione dei salvataggi in formato JSON.

### 📦 Gestione Box & Team (`src/components/Box/`)
- **`CreatureGrid.tsx`**: Archivio massivo. Gestisce filtri per tipo, ordinamenti, paginazione e **Team Swap** (sostituzione Box↔Squadra anche a team pieno tramite `replaceInTeam`).
- **`TeamManager.tsx`**: Sistema di ordinamento della squadra con frecce su/giù. Usa `swapPositions` con sincronizzazione atomica Dexie.

### 🔧 Componenti Comuni (`src/components/Common/`)
- **`Button.tsx`**: Bottone React con supporto varianti grafiche (`outline`, `ghost`, `rose`, `cyan`, `fuchsia`) per coerenza UI.
- **`NeoMonDetailModal.tsx`**: Modale condiviso per la visualizzazione completa di un Neo-Mon. Usato sia dal Box che dalla Squadra. Include: barre statistiche con colori differenziati, IV/EV per ogni parametro, moveset completo (nome, tipo colorato, categoria, PWR, SP), barra XP e sezione Development opzionale.

### 🏗️ Infrastruttura e Utility
- **`App.tsx`**: Il telaio dell'applicazione. Definisce la ripartizione dello schermo e il sistema di switch tra i vari moduli.
- **`types.ts`**: La pietra angolare del codice. Definisce la struttura di `NeoMon`, `Move` e `PlayerData` per evitare errori di dato.
- **`imageLoader.ts`**: Utility fondamentale che mappa gli ID delle creature sui file .webp nella cartella assets.
- **`manifest.json`**: Fornisce al browser le istruzioni per trattare il sito come un'app mobile (Splash screen, icone, colori).

### 🚀 Deployment (`public/`, `vite.config.ts`)
- **`vite.config.ts`**: Configura `vite-plugin-pwa` con `generateSW` per pre-caching offline di tutti gli asset. Minificazione Terser attiva. Output strutturato in `assets/js`, `assets/css`, `assets/img`.
- **`404.html`**: Intercetta i refresh su rotte deep (es. `/arena`) su GitHub Pages e reindirizza a `index.html` tramite script JS, mantenendo l'URL originale per React Router.
- **`.nojekyll`**: Segnale a GitHub Pages di non processare i file con Jekyll, evitando la corruzione degli asset generati da Vite.
- **Icone PWA**: `favicon.png`, `pwa-192x192.png`, `pwa-512x512.png`, `apple-touch-icon.png` — set completo per installazione su Android, iOS e desktop.

---
*Documentazione Architetturale Definitiva Neo-Mon Link - Aggiornata il 08/04/2026*
