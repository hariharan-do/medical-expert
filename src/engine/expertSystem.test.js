import { describe, it, expect } from 'vitest';
import { evaluateSymptoms, SYMPTOMS, CONDITIONS } from './expertSystem.js';

describe('AetherMed Clinical Inference Engine Tests', () => {
  it('should return empty array when no symptoms are provided', () => {
    expect(evaluateSymptoms([])).toEqual([]);
    expect(evaluateSymptoms(null)).toEqual([]);
  });

  it('should accurately calculate confidence score for Influenza symptoms', () => {
    const selected = ['fever', 'body_pain', 'fatigue', 'cough'];
    const results = evaluateSymptoms(selected);

    expect(results.length).toBeGreaterThan(0);
    const topResult = results[0];
    expect(topResult.conditionId).toBe('influenza');
    expect(topResult.confidenceScore).toBe(79);
    expect(topResult.matchedSymptoms.map(s => s.id)).toContain('fever');
    expect(topResult.matchedSymptoms.map(s => s.id)).toContain('body_pain');
  });

  it('should filter out conditions below 30% confidence threshold', () => {
    const selected = ['sneezing'];
    const results = evaluateSymptoms(selected, 30);

    const commonColdMatch = results.find(r => r.conditionId === 'common_cold');
    expect(commonColdMatch).toBeUndefined();

    const allergicRhinitisMatch = results.find(r => r.conditionId === 'allergic_rhinitis');
    expect(allergicRhinitisMatch).toBeDefined();
    expect(allergicRhinitisMatch.confidenceScore).toBe(38);
  });

  it('should dynamically escalate urgency level to emergency triage for red flag combinations', () => {
    const severeCombo = ['fever', 'vomiting', 'stomach_pain', 'diarrhea'];
    const results = evaluateSymptoms(severeCombo);

    expect(results.length).toBeGreaterThan(0);
    const topResult = results[0];
    expect(topResult.urgency).toBe('EMERGENCY_TRIAGE_ADVISORY');
  });

  it('should assign routine observation urgency to common cold symptoms', () => {
    const coldCombo = ['sneezing', 'runny_nose', 'sore_throat'];
    const results = evaluateSymptoms(coldCombo);

    const coldMatch = results.find(r => r.conditionId === 'common_cold');
    expect(coldMatch).toBeDefined();
    expect(coldMatch.urgency).toBe('ROUTINE_OBSERVATION');
  });

  it('should contain 12 core clinical symptoms and at least 8 medical conditions', () => {
    expect(SYMPTOMS.length).toBe(12);
    expect(CONDITIONS.length).toBeGreaterThanOrEqual(8);
  });
});
