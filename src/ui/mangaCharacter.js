/**
 * AetherMed Manga Anime Assistant Character ("Dr. Aira")
 * Renders an expressional Manga Medic character with speech cloud bubbles & facial expressions.
 */

export class MangaCharacter {
  constructor(containerElement) {
    this.container = containerElement;
    this.currentExpression = 'GREETING'; // GREETING, THINKING, EXPLAINING, ALERT, CONFIDENT
    this.typewriterTimer = null;

    this.init();
  }

  init() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="manga-assistant-wrapper">
        <!-- Manga Speech Bubble Cloud -->
        <div id="manga-speech-cloud" class="manga-speech-cloud">
          <div class="speech-cloud-content">
            <span id="manga-speech-text">Initialized.</span>
          </div>
          <div class="speech-cloud-tail"></div>
        </div>

        <!-- Anime Character Avatar Frame -->
        <div class="manga-avatar-card glass-panel" data-expression="GREETING">
          <div class="avatar-badge">ANIME MEDIC AI</div>
          
          <div class="character-svg-container">
            <!-- Dynamic SVG Manga Character Portrait -->
            <svg id="aira-avatar-svg" viewBox="0 0 120 120" width="100" height="100">
              <!-- Background Aura Circle -->
              <circle cx="60" cy="60" r="50" fill="#111111" stroke="#ffffff" stroke-width="2.5"/>

              <!-- Hair Back -->
              <path d="M25 65 Q 20 20 60 18 Q 100 20 95 65 Z" fill="#ffffff" stroke="#000000" stroke-width="2"/>

              <!-- Face -->
              <ellipse cx="60" cy="62" rx="28" ry="30" fill="#ffffff" stroke="#000000" stroke-width="2"/>

              <!-- Eyes & Glasses (Manga Style) -->
              <g id="aira-eyes">
                <!-- Glasses Frame -->
                <rect x="38" y="50" width="18" height="14" rx="3" fill="none" stroke="#000000" stroke-width="2"/>
                <rect x="64" y="50" width="18" height="14" rx="3" fill="none" stroke="#000000" stroke-width="2"/>
                <line x1="56" y1="57" x2="64" y2="57" stroke="#000000" stroke-width="2"/>

                <!-- Pupils -->
                <circle cx="47" cy="57" r="4" fill="#000000"/>
                <circle cx="73" cy="57" r="4" fill="#000000"/>
                <circle cx="48" cy="55" r="1.5" fill="#ffffff"/>
                <circle cx="74" cy="55" r="1.5" fill="#ffffff"/>
              </g>

              <!-- Mouth (Dynamic) -->
              <path id="aira-mouth" d="M 52 76 Q 60 82 68 76" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round"/>

              <!-- Lab Coat & Stethoscope -->
              <path d="M 35 90 L 45 115 L 75 115 L 85 90 Z" fill="#ffffff" stroke="#000000" stroke-width="2"/>
              <path d="M 46 90 L 60 102 L 74 90" fill="none" stroke="#000000" stroke-width="2"/>
              <circle cx="60" cy="105" r="4" fill="#000000"/>

              <!-- Manga Expression Effects (Sweat drop / Sparkle) -->
              <g id="aira-expression-effect" opacity="0">
                <path d="M 85 45 Q 90 40 88 35 Q 83 40 85 45 Z" fill="#ffffff" stroke="#000000" stroke-width="1.5"/>
              </g>
            </svg>
          </div>

          <div class="character-info">
            <span class="character-name">Dr. Aira</span>
            <span class="character-title">Manga Medic Guide</span>
          </div>
        </div>
      </div>
    `;

    this.cloudEl = document.getElementById('manga-speech-cloud');
    this.textEl = document.getElementById('manga-speech-text');
    this.mouthEl = document.getElementById('aira-mouth');
    this.effectEl = document.getElementById('aira-expression-effect');
  }

  setExpression(expression) {
    this.currentExpression = expression;
    if (!this.mouthEl || !this.effectEl) return;

    if (expression === 'GREETING' || expression === 'CONFIDENT') {
      // Smiling mouth
      this.mouthEl.setAttribute('d', 'M 52 74 Q 60 84 68 74');
      this.effectEl.setAttribute('opacity', '0');
    } else if (expression === 'EXPLAINING') {
      // Open talking mouth
      this.mouthEl.setAttribute('d', 'M 53 74 Q 60 86 67 74 Z');
      this.effectEl.setAttribute('opacity', '0');
    } else if (expression === 'THINKING') {
      // Concentrating small mouth
      this.mouthEl.setAttribute('d', 'M 54 77 L 66 77');
      this.effectEl.setAttribute('opacity', '0');
    } else if (expression === 'ALERT') {
      // O-mouth with manga sweat drop effect
      this.mouthEl.setAttribute('d', 'M 56 75 A 4 5 0 1 0 64 75 A 4 5 0 1 0 56 75');
      this.effectEl.setAttribute('opacity', '1');
    }
  }

  speakBubble(text, duration = 4000) {
    if (!this.cloudEl || !this.textEl) return;

    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
    }

    this.cloudEl.classList.add('visible');
    this.setExpression('EXPLAINING');

    // Typewriter effect
    let charIndex = 0;
    this.textEl.textContent = '';

    this.typewriterTimer = setInterval(() => {
      if (charIndex < text.length) {
        this.textEl.textContent += text.charAt(charIndex);
        charIndex++;
      } else {
        clearInterval(this.typewriterTimer);
        // After typing finishes, return to happy expression
        setTimeout(() => this.setExpression('CONFIDENT'), 1000);
      }
    }, 25);
  }

  hideBubble() {
    if (this.cloudEl) {
      this.cloudEl.classList.remove('visible');
    }
    this.setExpression('GREETING');
  }
}
