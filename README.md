# Neo-Mon Link 🦾🐈
**The Cyberpunk Monster Tamer PWA Experience**

Benvenuti nell'universo di **Neo-Mon Link**, un gioco di addestramento creature in stile JRPG ambientato in un futuro distopico dominato da neon e realtà aumentata. Utilizza il tuo "Neo-Link" per sincronizzarti con entità digitali, gestisci la tua squadra e scala i ranghi del Nexus.

## 🌟 Caratteristiche Principali
- **Combat Engine Strategico**: Una meccanica di battaglia basata sul "Flusso" (Velocità) e sulla gestione oculata della **Stamina**. Ogni mossa ha un costo e l'esaurimento delle energie ti rende vulnerabile.
- **AI Avanzata**: I nemici analizzano le tue debolezze elementali e scelgono tatticamente quando attaccare o riposare.
- **Sistema di Cattura (Prismi)**: Indebolisci i Neo-Mon selvatici per aumentare le probabilità di successo. Animazioni dinamiche in Framer Motion con 'Shakes' di suspense.
- **Neural Missions**: Un sistema di obiettivi e ricompense per guadagnare Neo-Credits e sbloccare nuovi equipaggiamenti.
- **Asset Ottimizzati**: Sprite creature in formato WebP con sfondo trasparente per un'integrazione perfetta nel layout neon.
- **Progressione Visiva**: Barre XP azzurre nell'Hub per monitorare in tempo reale lo sviluppo della squadra e sistema di Level-Up con potenziamento statistiche.
- **Save State & Backup**: Integrazione con **Dexie.js** per il salvataggio locale e funzione di **Esportazione/Importazione JSON** nelle impostazioni.
- **Estetica Neon UI/UX**: Interfaccia ottimizzata per il mobile con effetti di glassmorphism e animazioni fluide.
- **Team Swap Dinamico**: Sostituisce uno slot della squadra attiva con un Neo-Mon direttamente dal Box, anche a squadra piena (4/4), tramite overlay di selezione con sincronizzazione atomica su IndexedDB.
- **Deep Scan Report Unificato**: Modale condiviso (`NeoMonDetailModal`) usato sia nel Box che nella Squadra. Mostra statistiche con IV per ogni parametro, EV accumulati, barre colorate per tipologia di stat, moveset completo con potenza/costo/tipo, e barra XP precisa.
- **Heal Team Reale**: Il riposo nell'Hub ora ripristina concretamente HP e Stamina al massimo per ogni membro del team, con aggiornamento immediato sia nello store Zustand che nel database Dexie.
- **Coins Sincronizzati**: Le monete guadagnate in battaglia vengono aggiornate istantaneamente nell'Hub senza richiedere reload.
- **PWA Offline Completa**: Tramite `vite-plugin-pwa` con strategia `generateSW`, tutti gli asset (JS, CSS, WebP, JSON) vengono pre-cachati nel Service Worker. Il gioco è giocabile offline dopo il primo caricamento.
- **Sistema Profilo Linker**: Profilo giocatore personalizzabile con Rank (Livello Giocatore), statistiche di vittoria, numero di catture e bacheca dei Badge collezionati.
- **Zaino & Cure Fuori Lotta**: Implementata la logica di utilizzo degli oggetti curativi (HP e Stamina) direttamente dallo zaino fuori battaglia, con selezione del bersaglio in squadra e salvataggio persistente dei dati.
- **Dual Battle Modes**: Differenziazione tra modalità "Lotte" (Combat Link) per allenamento intensivo (+50% EXP, x2 Coins, cattura disabilitata) e modalità "Cattura" (Freq. Scan) per completare la collezione.
- **Link-Dex Dinamico**: Enciclopedia automatizzata che supporta l'intera lista di Neo-Mon (36+ entries) con calcolo automatico delle debolezze (Neural Analysis) basato sulla tabella dei tipi.
- **Ottimizzazione UI Terminale**: Nuova griglia compatta a 3 colonne per le funzioni dell'Hub e ottimizzazione degli spazi per la visualizzazione di nomi lunghi e statistiche vitali.

### Aggiornamenti recenti (documentazione)
- **Battaglia a squadra (multi-slot)**: In lotta l’ordine della squadra coincide con quello impostato nell’Hub/Box. Ogni slot tiene traccia di **HP e Stamina** in battaglia; se il Neo-Mon attivo va K.O., entra il **successivo ancora valido** senza fine partita immediata: la sconfitta arriva solo se **tutti** i membri sono esausti. Lo **switch** consuma il turno, salva chi esce nello slot e applica danni/costi coerenti al motore (`BattleEngine` + `DamageCalc`).
- **Zaino da battaglia**: Aprendo l’inventario durante uno scontro è disponibile il ritorno esplicito all’Arena (**Indietro alla lotta**, inclusa area fissa in basso), così non resti «bloccato» senza usare oggetti.
- **Test automatici (Vitest)**: Oltre a EXP/cattura, il progetto include test su **party di battaglia** (`battleParty.ts`), **turni e danni** (`battle.turn.test.ts` + `BattleEngine`). Comando: `npm test`.
- **Script di contenuti**: In `scripts/` (es. `expand-moves-and-creatures.mjs`) utility per generare o espandere dati in `creatures.json` / mosse — utile agli sviluppatori che aggiornano il Neo-Dex.

## 🎮 Meccaniche di Gioco
### Combattimento
- **HP**: Punti Vita. Se scendono a zero, il Neo-Mon va K.O.
- **Stamina**: L'energia richiesta per le mosse. Se insufficiente, l'azione fallisce (Recupero Passivo).
- **Azione 'Riposo'**: Sacrifica un turno per recuperare il 50% della Stamina massima.
- **Catch System**: Usa i **Prismi** (Base, Neon, Master) per aggiungere nuovi Neo-Mon alla tua collezione.

### Gestione Squadra
- **Team Manager**: Sposta i tuoi 4 Neo-Mon attivi, gestisci l'ordine e visualizza le statistiche vitali.
- **Team Swap**: Sostituisci qualsiasi membro della squadra con uno del Box direttamente dall'interfaccia, senza passare da schermate intermedie.
- **Ordine e lotta**: L’ordine salvato con **swapPositions** / Team Manager è quello usato anche in **Arena** per la panchina e il cambio Neo-Mon.
- **Linker Box**: Archivio digitale con ricerca e filtri avanzati per catalogare le tue creature.
- **Link-Dex**: Consulta l'enciclopedia tattica per studiare debolezze e tipi una volta catturati i Neo-Mon.

## 🛠 Tech Stack
- **Framework**: React 18 + Vite
- **Stato**: Zustand (Persistenza inclusa)
- **Database**: Dexie.js (IndexedDB)
- **Styling**: Tailwind CSS + Custom Neon Layers
- **PWA**: vite-plugin-pwa + Workbox (generateSW, offline-first)
- **Animazioni**: Framer Motion
- **Test**: Vitest (`vitest.config.ts`, `npm test` / `npm run test:watch`)
- **Deployment**: GitHub Pages (con `404.html` per SPA routing e `.nojekyll` per asset Vite)

## 🚀 Deployment su GitHub Pages
1. Esegui `npm run build`
2. Copia il contenuto di `/dist` nel repository GitHub destinato alla pubblicazione
3. In *Settings → Pages*, seleziona il branch come sorgente
4. Il file `public/404.html` gestisce il routing SPA al refresh; `.nojekyll` previene l'interferenza di Jekyll sugli asset Vite

---

