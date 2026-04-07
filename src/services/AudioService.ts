import { useStore } from '../context/useStore';

/**
 * AudioService: Gestore centrale suoni e musica del Nexus
 * Utilizza singleton pattern per mantenere lo stato audio globale.
 */
class AudioService {
  private bgm: HTMLAudioElement | null = null;
  private sfx: HTMLAudioElement | null = null;
  
  // Percorsi asset (Placeholder, l'utente dovrà aggiungere i file o useremo suoni sintetici se possibile)
  private sounds = {
    hub_bgm: '/assets/audio/hub_theme.mp3',
    battle_bgm: '/assets/audio/battle_theme.mp3',
    click: '/assets/audio/sfx_click.wav',
    damage: '/assets/audio/sfx_damage.wav',
    catch: '/assets/audio/sfx_catch.wav',
    level_up: '/assets/audio/sfx_levelup.wav'
  };

  /**
   * Avvia la musica di sottofondo per uno specifico schermo
   */
  playBGM(type: 'hub' | 'battle') {
    if (this.bgm) {
      this.bgm.pause();
      this.bgm = null;
    }

    const { volume, volMuted } = useStore.getState();
    const url = type === 'hub' ? this.sounds.hub_bgm : this.sounds.battle_bgm;
    
    this.bgm = new Audio(url);
    this.bgm.loop = true;
    this.bgm.volume = volMuted ? 0 : volume;
    
    // Gestione errore se l'asset manca o il browser blocca
    this.bgm.play().catch(() => {
      console.warn("AudioService: Riproduzione BGM bloccata. Interagire con la pagina prima.");
    });
  }

  /**
   * Riproduce un effetto sonoro istantaneo
   */
  playSFX(key: keyof typeof this.sounds) {
    const { volume, volMuted } = useStore.getState();
    if (volMuted) return;

    const sfx = new Audio(this.sounds[key]);
    sfx.volume = volume;
    sfx.play().catch(() => {});
  }

  /**
   * Sincronizza il volume corrente
   */
  updateVolume(val: number, muted: boolean) {
    if (this.bgm) {
      this.bgm.volume = muted ? 0 : val;
    }
  }
}

export const audioService = new AudioService();
export default audioService;
