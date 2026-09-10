import { describe, it, expect, beforeEach } from 'vitest';
import { ConsultationDB } from './consultationDB.js';

describe('Consultation Database Engine Tests', () => {
  let db;

  beforeEach(async () => {
    db = new ConsultationDB();
    await db.clearAll();
  });

  it('should save a diagnostic consultation record and retrieve it', async () => {
    const symptoms = ['fever', 'cough'];
    const results = [
      {
        name: 'Influenza (Acute Viral Flu)',
        confidenceScore: 79,
        category: 'Respiratory Infection',
        urgency: 'PRIORITY_MEDICAL_CONSULTATION'
      }
    ];

    const record = await db.saveRecord(symptoms, results);
    expect(record).toBeDefined();
    expect(record.id).toContain('REC-');
    expect(record.symptomCount).toBe(2);
    expect(record.topDiagnosis.name).toBe('Influenza (Acute Viral Flu)');

    const allRecords = await db.getAllRecords();
    expect(allRecords.length).toBeGreaterThan(0);
    expect(allRecords[0].id).toBe(record.id);
  });

  it('should delete a record by ID', async () => {
    const rec = await db.saveRecord(['headache'], []);
    const initialRecords = await db.getAllRecords();
    expect(initialRecords.length).toBe(1);

    await db.deleteRecord(rec.id);
    const afterDelete = await db.getAllRecords();
    expect(afterDelete.length).toBe(0);
  });

  it('should clear all database records', async () => {
    await db.saveRecord(['fever'], []);
    await db.saveRecord(['cough'], []);

    const beforeClear = await db.getAllRecords();
    expect(beforeClear.length).toBe(2);

    await db.clearAll();
    const afterClear = await db.getAllRecords();
    expect(afterClear.length).toBe(0);
  });

  it('should export database records as JSON string', async () => {
    await db.saveRecord(['fever'], []);
    const jsonStr = await db.exportJSON();

    expect(typeof jsonStr).toBe('string');
    const parsed = JSON.parse(jsonStr);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(1);
  });
});
