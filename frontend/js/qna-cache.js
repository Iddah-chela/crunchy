// ============================================
// OFFLINE-FIRST Q&A CACHE SYSTEM
// ============================================

window.API_BASE = window.API_BASE || (window.location.hostname === "localhost"
  ? "http://localhost:4000"
  : "https://holyverse-s5s1.onrender.com");
const API_BASE = window.API_BASE;

const QNA_CACHE = {
  DB_NAME: "holyverse_qna",
  DB_VERSION: 1,
  STORE_QUESTIONS: "questions",
  STORE_VERSES: "verses",
  STORE_META: "metadata",
  
  db: null,

  // Initialize IndexedDB
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Questions store
        if (!db.objectStoreNames.contains(this.STORE_QUESTIONS)) {
          const questionStore = db.createObjectStore(this.STORE_QUESTIONS, { keyPath: "id" });
          questionStore.createIndex("category", "category", { unique: false });
          questionStore.createIndex("status", "status", { unique: false });
        }
        
        // Verses store
        if (!db.objectStoreNames.contains(this.STORE_VERSES)) {
          const verseStore = db.createObjectStore(this.STORE_VERSES, { keyPath: "id" });
          verseStore.createIndex("question_id", "question_id", { unique: false });
        }
        
        // Metadata store (for sync timestamps)
        if (!db.objectStoreNames.contains(this.STORE_META)) {
          db.createObjectStore(this.STORE_META, { keyPath: "key" });
        }
      };
    });
  },

  // Get last sync time
  async getLastSync() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.STORE_META], "readonly");
      const store = transaction.objectStore(this.STORE_META);
      const request = store.get("last_sync_time");
      
      request.onsuccess = () => resolve(request.result?.value || null);
      request.onerror = () => reject(request.error);
    });
  },

  // Set last sync time
  async setLastSync(timestamp) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.STORE_META], "readwrite");
      const store = transaction.objectStore(this.STORE_META);
      const request = store.put({ key: "last_sync_time", value: timestamp });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  // Save questions to cache
  async saveQuestions(questions) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.STORE_QUESTIONS, this.STORE_VERSES], "readwrite");
      const questionStore = transaction.objectStore(this.STORE_QUESTIONS);
      const verseStore = transaction.objectStore(this.STORE_VERSES);
      
      questions.forEach(question => {
        // Save question
        const { verses, ...questionData } = question;
        questionStore.put(questionData);
        
        // Save verses
        if (verses && verses.length > 0) {
          verses.forEach(verse => {
            verseStore.put(verse);
          });
        }
      });
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },

  // Get all questions from cache
  async getAllQuestions() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.STORE_QUESTIONS], "readonly");
      const store = transaction.objectStore(this.STORE_QUESTIONS);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  },

  // Get verses for a question
  async getVerses(questionId) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.STORE_VERSES], "readonly");
      const store = transaction.objectStore(this.STORE_VERSES);
      const index = store.index("question_id");
      const request = index.getAll(questionId);
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  },

  // Delete questions by IDs
  async deleteQuestions(ids) {
    if (!this.db) await this.init();
    if (!ids || ids.length === 0) return;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.STORE_QUESTIONS, this.STORE_VERSES], "readwrite");
      const questionStore = transaction.objectStore(this.STORE_QUESTIONS);
      const verseStore = transaction.objectStore(this.STORE_VERSES);
      
      ids.forEach(id => {
        questionStore.delete(id);
        
        // Delete associated verses
        const index = verseStore.index("question_id");
        const request = index.openCursor(IDBKeyRange.only(id));
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          }
        };
      });
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },

  // Check if we have cached data
  async hasCachedData() {
    try {
      const questions = await this.getAllQuestions();
      return questions.length > 0;
    } catch (error) {
      console.error("Error checking cached data:", error);
      return false;
    }
  },

  // Full sync from server
  async syncFromServer() {
    try {
      const lastSync = await this.getLastSync();
      
      // Build URL with optional last_sync parameter
      const url = lastSync 
        ? `${API_BASE}/api/qna/sync?last_sync=${encodeURIComponent(lastSync)}`
        : `${API_BASE}/api/qna/sync`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`);
      }
      
      const { questions, sync_time } = await response.json();
      
      // Save questions to cache
      if (questions && questions.length > 0) {
        await this.saveQuestions(questions);
      }
      
      // Get archived questions and delete from cache
      if (lastSync) {
        const archivedUrl = `${API_BASE}/api/qna/archived?last_sync=${encodeURIComponent(lastSync)}`;
        const archivedResponse = await fetch(archivedUrl);
        
        if (archivedResponse.ok) {
          const { archived_ids } = await archivedResponse.json();
          if (archived_ids && archived_ids.length > 0) {
            await this.deleteQuestions(archived_ids);
          }
        }
      }
      
      // Update last sync time
      await this.setLastSync(sync_time);
      
      return {
        success: true,
        updated: questions.length,
        sync_time
      };
    } catch (error) {
      console.error("Sync error:", error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Background sync (non-blocking)
  async backgroundSync() {
    // Check if online
    if (!navigator.onLine) {
      console.log("Offline - skipping sync");
      return;
    }
    
    console.log("Starting background sync...");
    const result = await this.syncFromServer();
    
    if (result.success) {
      console.log(`Sync complete: ${result.updated} questions updated`);
      
      // Trigger UI update if loadUserQuestions exists
      if (typeof window.loadUserQuestions === 'function') {
        window.loadUserQuestions();
      }
    } else {
      console.error("Sync failed:", result.error);
    }
    
    return result;
  },

  // Convert cached questions to legacy questionMap format
  async toLegacyFormat() {
    try {
      const questions = await this.getAllQuestions();
      const questionMap = {};
      
      for (const question of questions) {
        const verses = await this.getVerses(question.id);
        
        // Convert to legacy format
        const answerStructure = {};
        
        verses.forEach(verse => {
          const theme = verse.theme || "general";
          if (!answerStructure[theme]) {
            answerStructure[theme] = {};
          }
          
          answerStructure[theme][verse.reference] = {
            text: verse.text,
            theme: verse.theme,
            tags: verse.tags || []
          };
        });
        
        questionMap[question.question_id] = answerStructure;
      }
      
      return questionMap;
    } catch (error) {
      console.error("Error converting to legacy format:", error);
      return {};
    }
  }
};

// Initialize on load
(async () => {
  try {
    await QNA_CACHE.init();
    
    // Check if we have cached data
    const hasCached = await QNA_CACHE.hasCachedData();
    
    if (!hasCached) {
      // First time - show loading and do full sync
      console.log("First run - fetching Q&A data...");
      await QNA_CACHE.syncFromServer();
    } else {
      // Have cached data - use it immediately and sync in background
      console.log("Loading from cache...");
      setTimeout(() => {
        QNA_CACHE.backgroundSync();
      }, 1000); // Sync after 1 second
    }
  } catch (error) {
    console.error("QNA Cache initialization error:", error);
  }
})();

// Expose to window
window.QNA_CACHE = QNA_CACHE;
