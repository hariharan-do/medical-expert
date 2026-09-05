/**
 * AetherMed Web Speech API - Voice Assistant Engine
 */

export class VoiceAssistant {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.isEnabled = true;
    this.isSpeaking = false;
    this.selectedVoice = null;

    this.init();
  }

  init() {
    if (!this.synth) {
      console.warn('Web Speech API is not supported in this browser environment.');
      return;
    }

    const updateVoices = () => {
      const voices = this.synth.getVoices();
      this.selectedVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David') || v.name.includes('Zira'))) || voices.find(v => v.lang.startsWith('en')) || voices[0];
    };

    updateVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = updateVoices;
    }
  }

  speak(text) {
    if (!this.synth || !this.isEnabled || !text) return;

    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.updateVoiceButtonState(true);
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.updateVoiceButtonState(false);
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      this.isSpeaking = false;
      this.updateVoiceButtonState(false);
    };

    this.synth.speak(utterance);
  }

  updateVoiceButtonState(speaking) {
    const btn = document.getElementById('btn-voice-toggle');
    if (!btn) return;

    if (this.isEnabled) {
      btn.classList.add('active');
      if (speaking) {
        btn.classList.add('speaking');
      } else {
        btn.classList.remove('speaking');
      }
    } else {
      btn.classList.remove('active', 'speaking');
    }
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    if (!this.isEnabled && this.synth) {
      this.synth.cancel();
    }
    this.updateVoiceButtonState(false);
    return this.isEnabled;
  }
}
