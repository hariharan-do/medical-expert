import { SYMPTOMS, evaluateSymptoms } from '../engine/expertSystem.js';
import { MedicalSceneManager } from '../three/scene.js';
import { ParallaxController } from './parallax.js';
import { VoiceAssistant } from './voiceAssistant.js';
import { MangaCharacter } from './mangaCharacter.js';
import { consultationDB } from '../db/consultationDB.js';
import gsap from 'gsap';

export class MedicalExpertApp {
  constructor() {
    this.currentState = 'LANDING';
    this.selectedSymptoms = new Set();
    this.sceneManager = null;
    this.parallax = null;
    this.voice = null;
    this.character = null;
    this.is2DMode = false;
    this.cachedDbRecords = [];

    this.frameCount = 0;
    this.lastFpsCheckTime = performance.now();
    this.lowFpsDuration = 0;
    this.highFpsDuration = 0;
    this.currentFps = 60;

    this.init();
  }

  init() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasWebGL = this.checkWebGLSupport();

    if (prefersReducedMotion || !hasWebGL) {
      this.is2DMode = true;
      document.body.classList.add('mode-2d');
    } else {
      const canvasEl = document.getElementById('webgl-canvas');
      if (canvasEl) {
        try {
          this.sceneManager = new MedicalSceneManager(canvasEl);
        } catch (e) {
          console.warn('WebGL setup failed, switching to 2D mode:', e);
          this.is2DMode = true;
          document.body.classList.add('mode-2d');
        }
      }
    }

    if (!this.is2DMode) {
      this.parallax = new ParallaxController();
    }

    this.voice = new VoiceAssistant();

    const assistantContainer = document.getElementById('manga-assistant-container');
    if (assistantContainer) {
      this.character = new MangaCharacter(assistantContainer);
    }

    this.renderSymptomGrid();
    this.bindEvents();
    this.updateNavbarDbBadge();

    if (!this.is2DMode) {
      this.startFpsMonitor();
    }

    setTimeout(() => {
      const welcomeText = "Welcome to AetherMed! I am Dr. Aira, your Manga Medic AI guide. Click Execute Intake Sequence to begin.";
      if (this.character) {
        this.character.speakBubble(welcomeText);
      }
      if (this.voice) {
        this.voice.speak(welcomeText);
      }
    }, 800);
  }

  checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  async updateNavbarDbBadge() {
    const records = await consultationDB.getAllRecords();
    this.cachedDbRecords = records;
    const badge = document.getElementById('nav-db-count-badge');
    if (badge) {
      badge.textContent = records.length.toString();
    }
  }

  renderSymptomGrid() {
    const gridContainer = document.getElementById('symptoms-grid');
    if (!gridContainer) return;

    gridContainer.innerHTML = '';

    SYMPTOMS.forEach((symptom, index) => {
      const isSelected = this.selectedSymptoms.has(symptom.id);

      const card = document.createElement('div');
      card.className = `symptom-card glass-panel ${isSelected ? 'selected' : ''}`;
      card.dataset.id = symptom.id;

      card.setAttribute('data-parallax', 'true');
      card.setAttribute('data-parallax-intensity', (0.5 + (index % 3) * 0.2).toString());
      card.setAttribute('data-parallax-depth', (isSelected ? 25 : 0).toString());

      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'checkbox');
      card.setAttribute('aria-checked', isSelected ? 'true' : 'false');
      card.setAttribute('aria-label', `${symptom.label} (${symptom.medicalTerm}): ${symptom.description}`);

      card.innerHTML = `
        <div class="symptom-card-header">
          <span class="symptom-medical-term">${symptom.medicalTerm}</span>
          <div class="symptom-check-indicator">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>
        <h3 class="symptom-title">${symptom.label}</h3>
        <p class="symptom-desc">${symptom.description}</p>
      `;

      card.addEventListener('click', () => this.toggleSymptom(symptom, card));
      card.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          this.toggleSymptom(symptom, card);
        }
      });

      gridContainer.appendChild(card);
    });

    if (this.parallax) {
      this.parallax.refreshElements();
    }
  }

  toggleSymptom(symptom, cardElement) {
    const isSelected = this.selectedSymptoms.has(symptom.id);

    if (isSelected) {
      this.selectedSymptoms.delete(symptom.id);
      cardElement.classList.remove('selected');
      cardElement.setAttribute('aria-checked', 'false');
      cardElement.setAttribute('data-parallax-depth', '0');

      gsap.to(cardElement, { scale: 1.0, y: 0, duration: 0.3, ease: 'power2.out' });
      
      const text = `Deselected ${symptom.label}.`;
      if (this.character) this.character.speakBubble(text);
      if (this.voice) this.voice.speak(text);
    } else {
      this.selectedSymptoms.add(symptom.id);
      cardElement.classList.add('selected');
      cardElement.setAttribute('aria-checked', 'true');
      cardElement.setAttribute('data-parallax-depth', '25');

      gsap.to(cardElement, { scale: 1.03, y: -6, duration: 0.3, ease: 'power2.out' });

      if (['fever', 'vomiting', 'stomach_pain'].includes(symptom.id)) {
        if (this.character) this.character.setExpression('ALERT');
      }

      const text = `Added ${symptom.label}: ${symptom.description}.`;
      if (this.character) this.character.speakBubble(text);
      if (this.voice) this.voice.speak(text);
    }

    this.updateSubmitButtonState();
  }

  updateSubmitButtonState() {
    const submitBtn = document.getElementById('btn-submit-symptoms');
    const badgeCount = document.getElementById('selected-count-badge');

    if (!submitBtn) return;

    const count = this.selectedSymptoms.size;
    if (badgeCount) badgeCount.textContent = count.toString();

    if (count > 0) {
      submitBtn.removeAttribute('disabled');
    } else {
      submitBtn.setAttribute('disabled', 'true');
    }
  }

  bindEvents() {
    const startBtn = document.getElementById('btn-start');
    if (startBtn) startBtn.addEventListener('click', () => this.switchState('SYMPTOMS'));

    const submitBtn = document.getElementById('btn-submit-symptoms');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        if (this.selectedSymptoms.size > 0) {
          this.evaluateAndRevealDiagnosis();
        }
      });
    }

    const backBtn = document.getElementById('btn-back-symptoms');
    if (backBtn) backBtn.addEventListener('click', () => this.switchState('SYMPTOMS'));

    const resetBtn = document.getElementById('btn-reset-symptoms');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.selectedSymptoms.clear();
        this.renderSymptomGrid();
        this.updateSubmitButtonState();
        const text = "Observations reset.";
        if (this.character) this.character.speakBubble(text);
        if (this.voice) this.voice.speak(text);
      });
    }

    // Header Voice Toggle
    const voiceBtn = document.getElementById('btn-voice-toggle');
    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => {
        if (this.voice) {
          const enabled = this.voice.toggle();
          const label = voiceBtn.querySelector('.voice-label');
          if (label) label.textContent = enabled ? 'Voice Guide: ON' : 'Voice Guide: OFF';
          if (enabled) {
            const text = "Voice assistance enabled.";
            if (this.character) this.character.speakBubble(text);
            this.voice.speak(text);
          }
        }
      });
    }

    // Header Observation Logs Button
    const historyBtn = document.getElementById('btn-view-history');
    if (historyBtn) {
      historyBtn.addEventListener('click', () => {
        this.switchState('HISTORY');
      });
    }

    const backFromHistoryBtn = document.getElementById('btn-back-from-history');
    if (backFromHistoryBtn) {
      backFromHistoryBtn.addEventListener('click', () => {
        this.switchState('LANDING');
      });
    }

    // Search and Filter Events in History View
    const searchInput = document.getElementById('db-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', () => this.renderHistoryRecords());
    }

    const riskFilter = document.getElementById('db-risk-filter');
    if (riskFilter) {
      riskFilter.addEventListener('change', () => this.renderHistoryRecords());
    }

    // Export DB JSON Button
    const exportBtn = document.getElementById('btn-export-db');
    if (exportBtn) {
      exportBtn.addEventListener('click', async () => {
        const jsonStr = await consultationDB.exportJSON();
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aethermed_db_export_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        if (this.character) this.character.speakBubble("Database exported as JSON snapshot.");
      });
    }

    // Clear DB Button
    const clearBtn = document.getElementById('btn-clear-db');
    if (clearBtn) {
      clearBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to clear all database observation logs?')) {
          await consultationDB.clearAll();
          await this.updateNavbarDbBadge();
          this.renderHistoryRecords();
          if (this.character) this.character.speakBubble("Database cleared.");
        }
      });
    }

    // Modal Close Button
    const closeModalBtn = document.getElementById('btn-close-modal');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => {
        const modal = document.getElementById('db-inspector-modal');
        if (modal) modal.classList.add('hidden-scene');
      });
    }
  }

  switchState(newState) {
    if (this.currentState === newState) return;
    this.currentState = newState;

    const landingSection = document.getElementById('scene-landing');
    const symptomsSection = document.getElementById('scene-symptoms');
    const diagnosisSection = document.getElementById('scene-diagnosis');
    const historySection = document.getElementById('scene-history');

    if (this.sceneManager) {
      this.sceneManager.transitionToState(newState === 'HISTORY' ? 'SYMPTOMS' : newState);
    }

    if (newState === 'LANDING') {
      this.showSection(landingSection);
      this.hideSection(symptomsSection);
      this.hideSection(diagnosisSection);
      this.hideSection(historySection);
    } else if (newState === 'SYMPTOMS') {
      this.hideSection(landingSection);
      this.showSection(symptomsSection);
      this.hideSection(diagnosisSection);
      this.hideSection(historySection);

      this.renderSymptomGrid();
      this.updateSubmitButtonState();

      const text = "Select your observed symptoms from the 3D grid, then click Analyze Symptom Vector.";
      if (this.character) this.character.speakBubble(text);
      if (this.voice) this.voice.speak(text);
    } else if (newState === 'DIAGNOSIS') {
      this.hideSection(landingSection);
      this.hideSection(symptomsSection);
      this.showSection(diagnosisSection);
      this.hideSection(historySection);
    } else if (newState === 'HISTORY') {
      this.hideSection(landingSection);
      this.hideSection(symptomsSection);
      this.hideSection(diagnosisSection);
      this.showSection(historySection);

      this.renderHistoryRecords();

      const text = "Viewing Clinical Observation Database logs. Inspect past sessions or export database snapshots.";
      if (this.character) this.character.speakBubble(text);
      if (this.voice) this.voice.speak(text);
    }

    if (this.parallax) {
      setTimeout(() => this.parallax.refreshElements(), 100);
    }
  }

  showSection(el) {
    if (!el) return;
    el.classList.remove('hidden-scene');
    gsap.fromTo(el, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
  }

  hideSection(el) {
    if (!el) return;
    el.classList.add('hidden-scene');
  }

  async evaluateAndRevealDiagnosis() {
    const symptomArray = Array.from(this.selectedSymptoms);
    const results = evaluateSymptoms(symptomArray, 30);

    // Save session automatically to Persistent Database
    const savedRecord = await consultationDB.saveRecord(symptomArray, results);
    await this.updateNavbarDbBadge();

    const resultsContainer = document.getElementById('diagnosis-carousel');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = '';

    if (results.length === 0) {
      resultsContainer.innerHTML = `
        <div class="glass-panel" style="padding: 3rem; text-align: center;">
          <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">No Conditions Exceeding Threshold</h2>
          <p style="color: var(--text-secondary); max-width: 500px; margin: 0 auto 1.5rem; line-height: 1.6;">
            The selected symptoms did not reach the 30% weighted confidence score threshold for any specific differential condition in the database.
          </p>
          <span style="font-size: 0.85rem; color: #ffffff;">Saved to DB log ${savedRecord.id}.</span>
        </div>
      `;
      const text = `Evaluation complete. Session saved to database ${savedRecord.id}. No conditions exceeded 30% match.`;
      if (this.character) {
        this.character.setExpression('THINKING');
        this.character.speakBubble(text);
      }
      if (this.voice) this.voice.speak(text);
    } else {
      results.forEach((diag, index) => {
        const card = document.createElement('div');
        card.className = 'diagnosis-card glass-panel';
        card.setAttribute('data-parallax', 'true');
        card.setAttribute('data-parallax-intensity', '0.4');

        let triageLabel = 'ROUTINE OBSERVATION';
        if (diag.urgency === 'OUTPATIENT_EVALUATION') triageLabel = 'OUTPATIENT EVALUATION RECOMMENDED';
        if (diag.urgency === 'PRIORITY_MEDICAL_CONSULTATION') triageLabel = 'PRIORITY CONSULTATION (24-48H)';
        if (diag.urgency === 'EMERGENCY_TRIAGE_ADVISORY') triageLabel = 'EMERGENCY TRIAGE ADVISORY';

        card.innerHTML = `
          <div class="diag-header">
            <div>
              <span class="diag-category-badge">${diag.category} &bull; Match #${index + 1}</span>
              <h2 class="diag-name">${diag.name}</h2>
            </div>
            <div class="confidence-meter-box">
              <span class="score-num">${diag.confidenceScore}%</span>
              <span class="score-label">Symptom Match</span>
            </div>
          </div>

          <p class="diag-desc">${diag.description}</p>

          <div class="triage-banner triage-${diag.urgency}">
            <span><strong>Triage Guidance:</strong> ${triageLabel}</span>
            <span class="triage-tag">${diag.urgency}</span>
          </div>

          <div class="diag-section">
            <h4 class="diag-section-title">Symptomatic Weight Matrix Breakdown</h4>
            <div class="matched-chips-container">
              ${diag.matchedSymptoms.map(s => `
                <span class="symptom-chip">
                  <strong>${s.label}</strong> <small>(${s.medicalTerm}) +${s.weight}</small>
                </span>
              `).join('')}
            </div>
          </div>

          <div class="diag-section">
            <h4 class="diag-section-title">Clinical Protocol & Recommended Therapy</h4>
            <div class="clinical-protocol-box">
              ${diag.treatment}
            </div>
          </div>

          <div class="diag-section">
            <h4 class="diag-section-title">Clinical Precautions & Risk Stratification</h4>
            <p style="color: var(--text-secondary); font-size: 0.92rem; line-height: 1.6;">${diag.precaution}</p>
          </div>

          <div class="clinical-disclaimer-callout">
            <div>
              <strong>Professional Notice (Auto-Saved to DB: ${savedRecord.id}):</strong>
              <p style="color: var(--text-secondary); margin-top: 0.25rem;">This session has been saved to your local database. Consult a licensed physician for clinical management.</p>
            </div>
          </div>
        `;

        resultsContainer.appendChild(card);
      });

      const cards = resultsContainer.querySelectorAll('.diagnosis-card');
      gsap.fromTo(cards, 
        { opacity: 0, y: 40, rotationX: -8 },
        { opacity: 1, y: 0, rotationX: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out' }
      );

      const topResult = results[0];
      const text = `Diagnostic evaluation complete! Saved to database log ${savedRecord.id}. Primary match: ${topResult.name} with ${topResult.confidenceScore}% confidence.`;
      if (this.character) {
        this.character.setExpression('CONFIDENT');
        this.character.speakBubble(text);
      }
      if (this.voice) this.voice.speak(text);
    }

    this.switchState('DIAGNOSIS');
  }

  async renderHistoryRecords() {
    const grid = document.getElementById('db-records-grid');
    if (!grid) return;

    const records = await consultationDB.getAllRecords();
    this.cachedDbRecords = records;

    const searchQuery = (document.getElementById('db-search-input')?.value || '').toLowerCase().trim();
    const riskFilter = document.getElementById('db-risk-filter')?.value || 'ALL';

    const filtered = records.filter(rec => {
      const matchesSearch = !searchQuery || 
        rec.id.toLowerCase().includes(searchQuery) ||
        rec.topDiagnosis.name.toLowerCase().includes(searchQuery) ||
        rec.symptomsList.some(s => s.toLowerCase().includes(searchQuery));

      const matchesRisk = riskFilter === 'ALL' || rec.topDiagnosis.urgency === riskFilter;

      return matchesSearch && matchesRisk;
    });

    grid.innerHTML = '';

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="db-empty-state">
          <h3>No Database Records Found</h3>
          <p style="margin-top: 0.5rem;">Execute diagnostic intake evaluations to populate your observation database.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(rec => {
      const card = document.createElement('div');
      card.className = 'db-record-card glass-panel';
      card.innerHTML = `
        <div class="db-rec-header">
          <span class="db-rec-id">${rec.id}</span>
          <span class="db-rec-date">${rec.dateFormatted}</span>
        </div>
        <h4 class="db-rec-title">${rec.topDiagnosis.name}</h4>
        <div class="db-rec-meta">
          <span>Observations: <strong>${rec.symptomCount}</strong></span>
          <span class="db-rec-score">${rec.topDiagnosis.confidenceScore}% Match</span>
        </div>
        <div class="triage-tag" style="align-self: flex-start;">${rec.topDiagnosis.urgency}</div>
      `;

      card.addEventListener('click', () => this.inspectRecord(rec));
      grid.appendChild(card);
    });
  }

  inspectRecord(record) {
    const modal = document.getElementById('db-inspector-modal');
    const modalId = document.getElementById('modal-session-id');
    const modalBody = document.getElementById('modal-session-body');

    if (!modal || !modalBody) return;

    modalId.textContent = `Record ${record.id} (${record.dateFormatted})`;

    modalBody.innerHTML = `
      <div style="border-bottom: 1px solid var(--manga-border); padding-bottom: 1rem;">
        <span class="diag-category-badge">${record.topDiagnosis.category}</span>
        <h2 style="font-size: 1.5rem; margin: 0.25rem 0;">${record.topDiagnosis.name}</h2>
        <p style="color: var(--text-secondary);">Match Score: <strong>${record.topDiagnosis.confidenceScore}%</strong> &bull; Triage: <strong>${record.topDiagnosis.urgency}</strong></p>
      </div>

      <div>
        <h4 class="diag-section-title">Recorded Symptom Observations (${record.symptomCount})</h4>
        <div class="matched-chips-container">
          ${record.symptomsList.map(s => `<span class="symptom-chip"><strong>${s}</strong></span>`).join('')}
        </div>
      </div>

      <div>
        <h4 class="diag-section-title">Differential Diagnostic Results (${record.matchedCount})</h4>
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          ${record.fullDiagnosticResults.map((r, i) => `
            <div style="background: rgba(255,255,255,0.05); padding: 0.75rem 1rem; border-radius: 6px; border: 1px solid var(--manga-border);">
              <div style="display: flex; justify-content: space-between; font-weight: 700;">
                <span>#${i + 1} ${r.name}</span>
                <span>${r.confidenceScore}% Score</span>
              </div>
              <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.35rem;">${r.treatment}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    modal.classList.remove('hidden-scene');
  }

  startFpsMonitor() {
    const fpsBadge = document.getElementById('fps-counter');

    const checkFps = () => {
      const now = performance.now();
      this.frameCount++;

      if (now - this.lastFpsCheckTime >= 1000) {
        const fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsCheckTime));
        this.currentFps = fps;
        this.frameCount = 0;
        this.lastFpsCheckTime = now;

        if (fpsBadge) fpsBadge.textContent = `${fps} FPS`;

        if (fps < 30) {
          this.lowFpsDuration += 1.0;
          this.highFpsDuration = 0;

          if (this.lowFpsDuration >= 2.0) {
            if (this.sceneManager) this.sceneManager.setQualityMode(true);
            if (this.parallax) this.parallax.setEnabled(false);
            if (fpsBadge) {
              fpsBadge.classList.add('quality-throttled');
              fpsBadge.textContent = `${fps} FPS (Low-Power)`;
            }
          }
        } else {
          this.highFpsDuration += 1.0;
          if (this.highFpsDuration >= 3.0) {
            this.lowFpsDuration = 0;
            if (this.sceneManager) this.sceneManager.setQualityMode(false);
            if (this.parallax) this.parallax.setEnabled(true);
            if (fpsBadge) fpsBadge.classList.remove('quality-throttled');
          }
        }
      }

      requestAnimationFrame(checkFps);
    };

    requestAnimationFrame(checkFps);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.medicalApp = new MedicalExpertApp();
});
