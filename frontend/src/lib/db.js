import { openDB } from "idb";

const DB_NAME = "care-offline-db";
const DB_VERSION = 1;

/**
 * Initializes the IndexedDB database for offline storage.
 * Creates tables (object stores) if they don't exist.
 */
export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // 1. Telemetry Store (Game scores, reaction times, cognitive metrics)
      if (!db.objectStoreNames.contains("telemetry")) {
        const telemetryStore = db.createObjectStore("telemetry", {
          keyPath: "id",
          autoIncrement: true,
        });
        // Index by timestamp for easy querying of daily/weekly trends
        telemetryStore.createIndex("timestamp", "timestamp");
        telemetryStore.createIndex("gameType", "gameType");
      }

      // 2. Voice Logs Store (Metadata about voice interactions)
      if (!db.objectStoreNames.contains("voice_logs")) {
        const voiceStore = db.createObjectStore("voice_logs", {
          keyPath: "id",
          autoIncrement: true,
        });
        voiceStore.createIndex("timestamp", "timestamp");
      }

      // 3. Settings Store (User preferences, theme, font size)
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", {
          keyPath: "key",
        });
      }
    },
  });
}

// ==========================================
// TELEMETRY FUNCTIONS (Games & Tracking)
// ==========================================

export async function saveTelemetry(gameType, score, rawData = {}) {
  const db = await initDB();
  
  // TODO (Stage 1C): Before saving, we will pipe `rawData` through the
  // WASM vault_core encryptor once it's ready. For now, it saves plaintext.
  
  const entry = {
    gameType,
    score,
    data: rawData, // Will become an encrypted string in Stage 1C
    timestamp: Date.now(),
  };
  
  return db.add("telemetry", entry);
}

export async function getRecentTelemetry(limit = 10) {
  const db = await initDB();
  // Get all items, sort by timestamp descending using a cursor would be optimal,
  // but for simplicity we fetch all and slice (fine for small local DBs initially).
  // A better approach for scale is to use cursors on the timestamp index.
  const tx = db.transaction("telemetry", "readonly");
  const index = tx.store.index("timestamp");
  
  let cursor = await index.openCursor(null, "prev");
  const results = [];
  
  while (cursor && results.length < limit) {
    // TODO (Stage 1C): Decrypt the `data` field here using WASM
    results.push(cursor.value);
    cursor = await cursor.continue();
  }
  
  return results;
}

// ==========================================
// SETTINGS FUNCTIONS (Preferences)
// ==========================================

export async function saveSetting(key, value) {
  const db = await initDB();
  return db.put("settings", { key, value });
}

export async function getSetting(key) {
  const db = await initDB();
  const result = await db.get("settings", key);
  return result ? result.value : null;
}
