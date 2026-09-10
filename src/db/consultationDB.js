/**
 * AetherMed Consultation & Patient Observation Database Controller
 * Manages persistent storage of diagnostic sessions using IndexedDB with LocalStorage & In-Memory fallback.
 */

const DB_NAME = 'AetherMed_Clinical_DB';
const DB_VERSION = 1;
const STORE_NAME = 'consultation_logs';
const LOCAL_STORAGE_KEY = 'aethermed_consultation_logs_v1';

export class ConsultationDB {
  constructor() {
    this.db = null;
    this.memoryFallback = [];
    this.initPromise = this.initDB();
  }

  async initDB() {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return null;
    }

    return new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            store.createIndex('timestamp', 'timestamp', { unique: false });
          }
        };

        request.onsuccess = (event) => {
          this.db = event.target.result;
          resolve(this.db);
        };

        request.onerror = () => {
          resolve(null);
        };
      } catch (e) {
        resolve(null);
      }
    });
  }

  /**
   * Saves a new diagnostic consultation record
   */
  async saveRecord(selectedSymptoms = [], results = []) {
    await this.initPromise;

    const now = new Date();
    const id = `REC-${now.getTime()}-${Math.floor(Math.random() * 1000)}`;
    const topMatch = results.length > 0 ? results[0] : null;

    const record = {
      id,
      timestamp: now.toISOString(),
      dateFormatted: now.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }),
      symptomCount: selectedSymptoms.length,
      symptomsList: selectedSymptoms,
      topDiagnosis: topMatch ? {
        name: topMatch.name,
        confidenceScore: topMatch.confidenceScore,
        category: topMatch.category,
        urgency: topMatch.urgency
      } : {
        name: 'No Match (>30% Threshold)',
        confidenceScore: 0,
        category: 'N/A',
        urgency: 'ROUTINE_OBSERVATION'
      },
      matchedCount: results.length,
      fullDiagnosticResults: results
    };

    if (this.db) {
      try {
        await new Promise((resolve, reject) => {
          const transaction = this.db.transaction([STORE_NAME], 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          const req = store.add(record);
          req.onsuccess = () => resolve();
          req.onerror = (e) => reject(e);
        });
      } catch (e) {
        this.saveFallback(record);
      }
    } else {
      this.saveFallback(record);
    }

    return record;
  }

  /**
   * Retrieves all historical records sorted descending by timestamp
   */
  async getAllRecords() {
    await this.initPromise;

    if (this.db) {
      try {
        const records = await new Promise((resolve, reject) => {
          const transaction = this.db.transaction([STORE_NAME], 'readonly');
          const store = transaction.objectStore(STORE_NAME);
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = (e) => reject(e);
        });

        records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        return records;
      } catch (e) {
        return this.getFallback();
      }
    }

    return this.getFallback();
  }

  /**
   * Deletes a specific record by ID
   */
  async deleteRecord(id) {
    await this.initPromise;

    if (this.db) {
      try {
        await new Promise((resolve, reject) => {
          const transaction = this.db.transaction([STORE_NAME], 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          const req = store.delete(id);
          req.onsuccess = () => resolve();
          req.onerror = (e) => reject(e);
        });
      } catch (e) {}
    }

    this.memoryFallback = this.memoryFallback.filter(r => r.id !== id);
    if (typeof localStorage !== 'undefined') {
      const records = this.getFallback().filter(r => r.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
    }
    return true;
  }

  /**
   * Clears all consultation records
   */
  async clearAll() {
    await this.initPromise;

    if (this.db) {
      try {
        await new Promise((resolve, reject) => {
          const transaction = this.db.transaction([STORE_NAME], 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          const req = store.clear();
          req.onsuccess = () => resolve();
          req.onerror = (e) => reject(e);
        });
      } catch (e) {}
    }

    this.memoryFallback = [];
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    return true;
  }

  /**
   * Exports entire database as JSON string for download
   */
  async exportJSON() {
    const records = await this.getAllRecords();
    return JSON.stringify(records, null, 2);
  }

  // --- Fallback Helpers ---
  saveFallback(record) {
    this.memoryFallback.unshift(record);
    if (typeof localStorage !== 'undefined') {
      try {
        const records = this.getFallback();
        records.unshift(record);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
      } catch (e) {}
    }
  }

  getFallback() {
    if (typeof localStorage !== 'undefined') {
      try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        return data ? JSON.parse(data) : this.memoryFallback;
      } catch (e) {
        return this.memoryFallback;
      }
    }
    return this.memoryFallback;
  }
}

export const consultationDB = new ConsultationDB();
