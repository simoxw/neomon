import { useState, useEffect, useCallback } from 'react';
import { NeoMon, Move } from '../types';
import { BattleEngine, BattleAction, FullTurnResult, TurnExecutionResult } from '../logic/BattleEngine';
import movesData from '../data/moves.json';
import { db } from '../db';
import { useStore } from '../context/useStore';

/**
 * Neo-Mon Hook: Battle Logic Orchestrator
 * Gestisce l'interazione tra BattleEngine e UI.
 */

interface BattleEntity extends NeoMon {
  currentHp: number;
  currentStamina: number;
}

import { generateWildMon } from '../logic/generateWildMon';

export const useBattle = (playerId: string, opponentId: string) => {
  const { grantExperience, updateCoins } = useStore();
  const [playerMon, setPlayerMon] = useState<BattleEntity | null>(null);
  const [opponentMon, setOpponentMon] = useState<BattleEntity | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isTurnInProgress, setIsTurnInProgress] = useState(false);
  const [status, setStatus] = useState<'idle' | 'fighting' | 'won' | 'lost'>('idle');
  const [allMoves, setAllMoves] = useState<Move[]>([]);

  // Caricamento Iniziale
  useEffect(() => {
    const initBattle = async () => {
      // Carica mosse
      const flattenedMoves: Move[] = (movesData as any).flat();
      setAllMoves(flattenedMoves);

      // Carica Player dalla squadra
      const team = await db.team.toArray();
      const pMon = team[0]; 

      if (pMon) {
        const stats = pMon.currentStats || pMon.baseStats;
        setPlayerMon({
          ...pMon,
          currentHp: stats.hp,
          currentStamina: stats.stamina
        });

        // Genera avversario casuale dinamico
        const randomId = `n-00${Math.floor(Math.random() * 9) + 1}`; // Esempio n-001 a n-009
        const generatedOpponent = generateWildMon(randomId, pMon.level);
        
        setOpponentMon({
          ...generatedOpponent,
          currentHp: generatedOpponent.currentStats!.hp,
          currentStamina: generatedOpponent.currentStats!.stamina
        });

        setStatus('fighting');
        setBattleLog([`Inizia la battaglia contro ${generatedOpponent.name} selvatico!`]);
      }
    };

    initBattle();
  }, []);

  const addLog = (msg: string) => {
    setBattleLog(prev => [...prev.slice(-4), msg]); // Mantieni ultimi 5 log
  };

  const handleAction = useCallback(async (actionType: 'move' | 'rest' | 'switch', moveId?: string) => {
    if (!playerMon || !opponentMon || isTurnInProgress || status !== 'fighting') return;

    setIsTurnInProgress(true);

    // 1. Prepara Azione Giocatore
    const playerAction: BattleAction = {
      type: actionType,
      moveId,
      move: moveId ? allMoves.find(m => m.id === moveId) : undefined
    };

    // 2. Prepara Azione IA
    const aiAction = BattleEngine.getBestMoveAI(opponentMon, playerMon, allMoves);

    // 3. Esegui Turno (Clone per evitare mutazioni dirette prima di set state)
    const pClone = JSON.parse(JSON.stringify(playerMon));
    const oClone = JSON.parse(JSON.stringify(opponentMon));
    
    // Inseriamo stamina/hp dinamici nell'oggetto per l'engine (che usa (mon as any).currentStamina)
    pClone.currentStamina = playerMon.currentStamina;
    pClone.currentHp = playerMon.currentHp;
    oClone.currentStamina = opponentMon.currentStamina;
    oClone.currentHp = opponentMon.currentHp;

    const turnResult: FullTurnResult = BattleEngine.executeTurn(pClone, oClone, playerAction, aiAction);

    // 4. Esegui Log con Delay per fluidità
    await processTurnResults(turnResult);

    setIsTurnInProgress(false);
  }, [playerMon, opponentMon, isTurnInProgress, status, allMoves]);

  const processTurnResults = async (result: FullTurnResult) => {
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const executeAndLog = async (res: TurnExecutionResult) => {
      addLog(res.message);
      
      // Aggiorna stati visibili gradualmente
      if (res.playerId === 'player') {
        setPlayerMon(prev => prev ? { 
            ...prev, 
            currentStamina: Math.max(0, prev.currentStamina - res.consumedStamina + res.recoveredStamina) 
          } : null);
        setOpponentMon(prev => prev ? { 
            ...prev, 
            currentHp: Math.max(0, prev.currentHp - res.damage) 
          } : null);
      } else {
        setOpponentMon(prev => prev ? { 
            ...prev, 
            currentStamina: Math.max(0, prev.currentStamina - res.consumedStamina + res.recoveredStamina) 
          } : null);
        setPlayerMon(prev => prev ? { 
            ...prev, 
            currentHp: Math.max(0, prev.currentHp - res.damage) 
          } : null);
      }
      
      await sleep(1000); // Pausa tra azioni
    };

    // Esegui prima azione
    await executeAndLog(result.first);

    // Se la battaglia non è finita dopo la prima azione, esegui la seconda
    if (!result.isBattleOver || (result.winner === 'player' && result.first.playerId === 'ai') || (result.winner === 'ai' && result.first.playerId === 'player')) {
       // Se il secondo attore non è quello che è andato KO nel primo step (già gestito dall'engine)
       if (!result.second.isKO) {
          await executeAndLog(result.second);
       }
    }

    // 5. Controllo Fine Battaglia
    if (result.isBattleOver) {
      if (result.winner === 'player') {
        setStatus('won');
        addLog('Hai vinto la battaglia! Guadagnati 50 Monete e 100 EXP.');
        await handleVittoria();
      } else {
        setStatus('lost');
        addLog('Sei stato sconfitto... I tuoi Neo-Mon hanno bisogno di riposo.');
      }
    }
  };

  const handleVittoria = async () => {
    if (!playerMon) return;
    
    // Aggiorna monete tramite store (si riflette immediatamente nell'UI)
    updateCoins(50);

    // Guadagno Esperienza centralizzato tramite Store
    await grantExperience(playerMon.id, 100);
  };

  return {
    playerMon,
    opponentMon,
    battleLog,
    isTurnInProgress,
    status,
    allMoves,
    handleAction
  };
};
