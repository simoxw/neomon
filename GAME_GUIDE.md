# 🦾 Neo-Mon Link: Guida Tattica Integrale
**Sincronizzazione Dati: Livello Final - Modulo Enciclopedia Avanzata**

Questa guida contiene l'elenco completo delle efficacie, dei Neo-Mon registrati e dell'intera libreria mosse (120 tecniche totali).

**Aggiornamento (Neo-Dex):** il registro tattico qui sotto copre **40 specie** (ID **n-001** … **n-040**) allineate a `src/data/creatures.json`. In battaglia la squadra segue l’**ordine definito nell’Hub**; se il Neo-Mon attivo va K.O., entra automaticamente il **primo della panchina ancora in piedi** (stessa logica del cambio manuale: HP/Stamina e mosse sincronizzati allo slot). Dallo **Zaino** aperto in lotta puoi tornare all’Arena con **Indietro alla lotta** (anche barra fissa in basso), senza dover usare un oggetto.

## 🕹️ Guida Rapida ai Sistemi Nexus

### 🧬 Catch System (Sincronizzazione)
La sincronia con un Neo-Mon selvatico non è garantita. Ecco come massimizzare le tue chance:
- **Indebolimento**: Più bassi sono gli HP del bersaglio, più labile è la sua difesa neurale.
- **Strumenti**: 
  - **Prisma Base**: Standard (1x).
  - **Prisma Neon**: Frequenza amplificata (1.5x).
  - **Prisma Master**: Sincronia quantistica forzata (100% Successo).
- **Suspense (Shakes)**: Il prisma si scuote fino a 3 volte. Ogni scossa rappresenta un firewall superato. Se fallisce, il Neo-Mon riappare.

### 📈 Progressione e Level-Up
Ogni vittoria nel Nexus conferisce **100 XP** al Neo-Mon attivo.
- **Barra XP**: Visibile nell'Hub sotto ogni creatura (colore azzurro neon).
- **Soglia Livello**: L'esperienza necessaria è calcolata come `Livello * 100`.
- **Evoluzione Statistiche**: Al passaggio di livello, gli HP aumentano del 5% e tutte le altre statistiche base crescono di 2 punti fissi.

### 🖥️ Navigazione Hub Intelligente
- **Quick Manage**: Clicca direttamente sull'icona di un Neo-Mon nella squadra per aprire istantaneamente il menu di gestione.
- **Status Check**: La barra XP azzurra ti permette di sapere chi è vicino a potenziarsi senza dover aprire il Box.

---

## ⚡ Tabella delle Efficacie Elementali
| Attaccante \ Difensore | Bio | Inc. | Idr. | Ful. | Tet. | Mec. | Ete. | Cin. | Geo. | Aer. | Cri. |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Bio** | ½ | ½ | 2 | 2 | 1 | ½ | 1 | 1 | 2 | ½ | 1 |
| **Incandescente** | 2 | ½ | ½ | 1 | 1 | 2 | 1 | 1 | ½ | 1 | 2 |
| **Idrico** | ½ | 2 | ½ | ½ | 1 | 1 | 1 | 1 | 2 | 1 | 1 |
| **Fulgido** | ½ | 1 | 2 | ½ | 2 | 1 | ½ | 1 | 1 | 2 | 1 |
| **Tetro** | 1 | 1 | 1 | 2 | ½ | ½ | 2 | ½ | 1 | 1 | 1 |
| **Meccanico** | 2 | ½ | ½ | 1 | 1 | ½ | 2 | 1 | 1 | 1 | 2 |
| **Etereo** | 1 | 1 | 1 | 1 | 2 | ½ | ½ | 2 | 1 | 1 | 1 |
| **Cinetico** | 1 | 1 | 1 | 1 | ½ | 2 | ½ | ½ | 2 | ½ | 2 |
| **Geologico** | ½ | 2 | ½ | 2 | 1 | 2 | 1 | 1 | ½ | ½ | 1 |
| **Aereo** | 2 | 1 | 1 | ½ | 1 | ½ | 1 | 2 | ½ | ½ | 1 |
| **Criogenico** | 2 | ½ | ½ | 1 | 1 | ½ | 1 | 1 | 2 | 2 | ½ |
| **Prismatico** | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |

---

## 🐈 Registro Creature Nazionale (Neo-Dex 001-040)
| ID | Nome | Tipo 1 | Tipo 2 | Evoluzione |
| :--- | :--- | :--- | :--- | :--- |
| **n-001** | **Floris** | Bio | - | Floragile (LV 20) |
| **n-002** | **Floragile** | Bio | - | Aether-Vernant (LV 40) |
| **n-003** | **Aether-Vernant** | Bio | Etereo | - (Stadio Finale) |
| **n-004** | **Ignis** | Incandescente | - | Pyrosauro (LV 20) |
| **n-005** | **Pyrosauro** | Incandescente | - | Magma-Core (LV 40) |
| **n-006** | **Magma-Core** | Incandescente | Meccanico | - (Stadio Finale) |
| **n-007** | **Hydros** | Idrico | - | Aquastream (LV 20) |
| **n-008** | **Aquastream** | Idrico | - | Tsunami-Titan (LV 40) |
| **n-009** | **Tsunami-Titan** | Idrico | Geologico | - (Stadio Finale) |
| **n-010** | **Larva-Neon** | Bio | - | Crisalide (LV 15) |
| **n-011** | **Crisalide-Glow** | Bio | Meccanico | Farfalla-Prismatica (LV 30) |
| **n-012** | **Farfalla-Prismatica**| Bio | Prismatico | - (Stadio Finale) |
| **n-013** | **Eco-Bit** | Tetro | - | Radar-Wing (LV 22) |
| **n-014** | **Radar-Wing** | Tetro | Aereo | - (Stadio Finale) |
| **n-015** | **Geo-Shell** | Geologico | - | - (Stadio Unico) |
| **n-016** | **Cyber-Cane** | Cinetico | - | Bolt-Hound (LV 25) |
| **n-017** | **Bolt-Hound** | Cinetico | Fulgido | - (Stadio Finale) |
| **n-018** | **Mecha-Micio** | Meccanico | - | - (Stadio Unico) |
| **n-019** | **Crio-Lince** | Criogenico | - | - (Stadio Unico) |
| **n-020** | **Aura-Nebula** | Etereo | - | - (Stadio Unico) |
| **n-021** | **Volt-Achel** | Fulgido | - | Tesla-Don (LV 24) |
| **n-022** | **Tesla-Don** | Fulgido | - | - (Stadio Finale) |
| **n-023** | **Bit-Moth** | Bio | Meccanico | Cyber-Os (LV 18) |
| **n-024** | **Cyber-Os** | Bio | Meccanico | - (Stadio Finale) |
| **n-025** | **Magma-Core** | Incandescente | - | Reactor-Gron (LV 30) |
| **n-026** | **Reactor-Gron** | Incandescente | Meccanico | - (Stadio Finale) |
| **n-027** | **Neon-Puff** | Prismatico | - | Aura-Spectra (LV 25) |
| **n-028** | **Aura-Spectra** | Prismatico | Etereo | - (Stadio Finale) |
| **n-029** | **Rusty** | Meccanico | - | Scrap-Titan (LV 20) |
| **n-030** | **Scrap-Titan** | Meccanico | - | - (Stadio Finale) |
| **n-031** | **Hydro-Chip** | Idrico | - | Tsunami-Node (LV 22) |
| **n-032** | **Tsunami-Node** | Idrico | Fulgido | - (Stadio Finale) |
| **n-033** | **Gravel-Bot** | Geologico | - | Terra-Drill (LV 28) |
| **n-034** | **Terra-Drill** | Geologico | Meccanico | - (Stadio Finale) |
| **n-035** | **Shadow-Byte** | Tetro | - | Void-Zero (LV 32) |
| **n-036** | **Void-Zero** | Tetro | Meccanico | - (Stadio Finale) |
| **n-037** | **Aero-Bit** | Aereo | - | Sky-Server (LV 20) |
| **n-038** | **Sky-Server** | Aereo | Prismatico | - (Stadio Finale) |
| **n-039** | **Crio-Mite** | Criogenico | - | Frost-Frame (LV 25) |
| **n-040** | **Frost-Frame** | Criogenico | Idrico | - (Stadio Finale) |

*Nota dati:* **n-025** e **n-006** condividono il nome «Magma-Core» nel database specie, ma sono ID diversi e linee evolutive distinte (vedi colonne ID e catena).

---

## 🌀 Libreria Mosse Integrale (120 Tecniche)

### 🌱 Bio (Sincronia Naturale)
1. **m-bio-01**: Seme Luminescente (Pot 45)
2. **m-bio-02**: Frusta Fluorescente (Pot 50)
3. **m-bio-03**: Spira di Radici-Laser (Pot 35)
4. **m-bio-04**: Liana al Plasma (Pot 75)
5. **m-bio-05**: Polline Elettrolitico (Pot 80)
6. **m-bio-06**: Spora Cibernetica (Pot 65)
7. **m-bio-07**: Eruzione Clorofilliana (Pot 120)
8. **m-bio-08**: Artiglio di Smeraldo (Pot 110)
9. **m-bio-09**: Sintesi di Neon (Status)
10. **m-bio-10**: Veleno Neon (Status)

### 🔥 Incandescente (Frequenza Termica)
1. **m-inc-01**: Scintilla Digitale (Pot 40)
2. **m-inc-02**: Colpo di Calore (Pot 45)
3. **m-inc-03**: Fiamma Neon (Pot 50)
4. **m-inc-04**: Pugno Magmatico (Pot 80)
5. **m-inc-05**: Flare Infrarosso (Pot 70)
6. **m-inc-06**: Nebbia Incandescente (Pot 65)
7. **m-inc-07**: Supernova di Quarzo (Pot 130)
8. **m-inc-08**: Impatto Vulcanico (Pot 115)
9. **m-inc-09**: Surriscaldamento (Status)
10. **m-inc-10**: Barriera Termica (Status)

### 💧 Idrico (Flusso Cibernetico)
1. **m-idr-01**: Goccia Sonica (Pot 35)
2. **m-idr-02**: Taglio d'Acqua (Pot 45)
3. **m-idr-03**: Flusso di Fosforo (Pot 50)
4. **m-idr-04**: Idropulsore Beta (Pot 75)
5. **m-idr-05**: Colpo di Marea (Pot 80)
6. **m-idr-06**: Nebulosa Marina (Pot 65)
7. **m-idr-07**: Maremoto Digitale (Pot 120)
8. **m-idr-08**: Diluvio di Smeraldo (Pot 110)
9. **m-idr-09**: Nebbia Umida (Status)
10. **m-idr-10**: Sorgente Purificatrice (Status)

### ⚡ Fulgido (Elettrolisi Digitale)
1. **m-ful-01**: Scossa di Cobalto (Pot 40)
2. **m-ful-02**: Lampo Istantaneo (Pot 45)
3. **m-ful-03**: Artiglio Fulmineo (Pot 50)
4. **m-ful-04**: Arco Voltaico (Pot 80)
5. **m-ful-05**: Scarica di Neon (Pot 75)
6. **m-ful-06**: Tuono Modulato (Pot 65)
7. **m-ful-07**: Tempesta Elettromagnetica (Pot 125)
8. **m-ful-08**: Fulmine di Zaffiro (Pot 110)
9. **m-ful-09**: Sovraccarico (Status)
10. **m-ful-10**: Paralisi Statica (Status)

### 🌑 Tetro (Oscurità Criptata)
1. **m-tet-01**: Ombra di Vetro (Pot 40)
2. **m-tet-02**: Sussurro Oscuro (Pot 45)
3. **m-tet-03**: Graffio Tetro (Pot 35)
4. **m-tet-04**: Vuoto di Silenzio (Pot 80)
5. **m-tet-05**: Abisso di Codice (Pot 75)
6. **m-tet-06**: Morso dell'Oblio (Pot 70)
7. **m-tet-07**: Eclissi di Ossidiana (Pot 120)
8. **m-tet-08**: Lama delle Tenebre (Pot 110)
9. **m-tet-09**: Maledizione Digitale (Status)
10. **m-tet-10**: Terrore Assoluto (Status)

### ⚙️ Meccanico (Risoluzione Hardware)
1. **m-mec-01**: Ingranaggio Veloce (Pot 45)
2. **m-mec-02**: Bullone Espulsore (Pot 40)
3. **m-mec-03**: Pinza Idraulica (Pot 50)
4. **m-mec-04**: Motore a Ioni (Pot 85)
5. **m-mec-05**: Raggio Laser (Pot 75)
6. **m-mec-06**: Impatto al Tungsteno (Pot 80)
7. **m-mec-07**: Cacciabombardiere (Pot 130)
8. **m-mec-08**: Pistone Colossale (Pot 115)
9. **m-mec-09**: Calibrazione (Status)
10. **m-mec-10**: Scudo di Ferro (Status)

### 👻 Etereo (Risveglio Astrale)
1. **m-ete-01**: Vuoto Etereo (Pot 40)
2. **m-ete-02**: Tocco Fantasma (Pot 45)
3. **m-ete-03**: Raggio Astrale (Pot 50)
4. **m-ete-04**: Dimensionamento (Pot 80)
5. **m-ete-05**: Nebulosa Spettrale (Pot 70)
6. **m-ete-06**: Artiglio dell'Anima (Pot 75)
7. **m-ete-07**: Cataclisma Astrale (Pot 125)
8. **m-ete-08**: Lama dello Spirito (Pot 110)
9. **m-ete-09**: Fasatura (Status)
10. **m-ete-10**: Trascendenza (Status)

### 🌀 Cinetico (Vettore di Forza)
1. **m-cin-01**: Impatto Cinetico (Pot 45)
2. **m-cin-02**: Onda d'Urto (Pot 40)
3. **m-cin-03**: Frizione Rapida (Pot 50)
4. **m-cin-04**: Vettore di Forza (Pot 85)
5. **m-cin-05**: Spinta Gravitazionale (Pot 75)
6. **m-cin-06**: Collisione Elastica (Pot 65)
7. **m-cin-07**: Impatto Metropolitano (Pot 130)
8. **m-cin-08**: Fulcro di Energia (Pot 110)
9. **m-cin-09**: Accelerazione (Status)
10. **m-cin-10**: Inerzia (Status)

### 🏔️ Geologico (Nucleo Planetario)
1. **m-geo-01**: Pietrisco Laser (Pot 40)
2. **m-geo-02**: Pugno Roccioso (Pot 45)
3. **m-geo-03**: Scheggia di Rubino (Pot 50)
4. **m-geo-04**: Terremoto Modulato (Pot 85)
5. **m-geo-05**: Pilastro di Titanio (Pot 75)
6. **m-geo-06**: Frana di Neon (Pot 70)
7. **m-geo-07**: Meteore di Cristallo (Pot 130)
8. **m-geo-08**: Crollo Strutturale (Pot 110)
9. **m-geo-09**: Fortificazione (Status)
10. **m-geo-10**: Sabbia Neon (Status)

### 🦅 Aereo (Corrente di Codice)
1. **m-aer-01**: Refolo di Luce (Pot 40)
2. **m-aer-02**: Colpo di Vento (Pot 45)
3. **m-aer-03**: Lama di Pressione (Pot 50)
4. **m-aer-04**: Tornado di Neon (Pot 80)
5. **m-aer-05**: Picchiata Sonica (Pot 85)
6. **m-aer-06**: Raffica Tracciante (Pot 70)
7. **m-aer-07**: Ciclone Cinetico (Pot 120)
8. **m-aer-08**: Uragano di Plasma (Pot 115)
9. **m-aer-09**: Corrente Ascensionale (Status)
10. **m-aer-10**: Turbolenza (Status)

### ❄️ Criogenico (Frequenza Zero)
1. **m-cri-01**: Scheggia di Ghiaccio (Pot 40)
2. **m-cri-02**: Soffio Gelo (Pot 45)
3. **m-cri-03**: Cristallo Affilato (Pot 50)
4. **m-cri-04**: Bufera di Neon (Pot 85)
5. **m-cri-05**: Pugno Polare (Pot 80)
6. **m-cri-06**: Marea Ghiacciata (Pot 70)
7. **m-cri-07**: Era Glaciale (Pot 130)
8. **m-cri-08**: Schiacciamento Artico (Pot 115)
9. **m-cri-09**: Congelamento Rapido (Status)
10. **m-cri-10**: Velo di Brina (Status)

### 🌈 Prismatico (Spettro Neutro)
1. **m-pri-01**: Impulso Prisma (Pot 45)
2. **m-pri-02**: Colpo Bilanciato (Pot 50)
3. **m-pri-03**: Raggio Neutro (Pot 40)
4. **m-pri-04**: Armonia Cromatica (Pot 80)
5. **m-pri-05**: Pressione Neutrale (Pot 75)
6. **m-pri-06**: Rifrazione Ottica (Pot 70)
7. **m-pri-07**: Esplosione Spettrale (Pot 120)
8. **m-pri-08**: Urti Equilibranti (Pot 110)
9. **m-pri-09**: Rifrazione Equilibrante (Status)
10. **m-pri-10**: Neutralizzazione (Status)

---
*Neo-Mon Link - Digital Database Complete Update - 07/04/2026*

*Appendice documentazione — 12/04/2026: Neo-Dex esteso a 40 voci, note su battaglia a squadra e Zaino in lotta.*
