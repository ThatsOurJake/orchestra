import type { PersistStorage, StorageValue } from 'zustand/middleware';

interface DBConfig {
  dbName: string;
  storeName: string;
}

class IndexedDBStorage<S> {
  private dbName: string;
  private storeName: string;
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor(config: DBConfig) {
    this.dbName = config.dbName;
    this.storeName = config.storeName;
  }

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => {
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });

    return this.dbPromise;
  }

  async getItem(name: string): Promise<StorageValue<S> | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(name);

        request.onerror = () => {
          reject(request.error);
        };

        request.onsuccess = () => {
          const value = request.result;
          if (value === undefined) {
            resolve(null);
          } else {
            resolve(value);
          }
        };
      });
    } catch (error) {
      console.error('IndexedDB getItem error:', error);
      return null;
    }
  }

  async setItem(name: string, value: StorageValue<S>): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put(value, name);

        request.onerror = () => {
          reject(request.error);
        };

        request.onsuccess = () => {
          resolve();
        };
      });
    } catch (error) {
      console.error('IndexedDB setItem error:', error);
    }
  }

  async removeItem(name: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(name);

        request.onerror = () => {
          reject(request.error);
        };

        request.onsuccess = () => {
          resolve();
        };
      });
    } catch (error) {
      console.error('IndexedDB removeItem error:', error);
    }
  }
}

export const createIndexedDBStorage = <S>(
  config: DBConfig,
): PersistStorage<S> => {
  const storage = new IndexedDBStorage<S>(config);

  return {
    getItem: (name: string) => storage.getItem(name),
    setItem: (name: string, value: StorageValue<S>) =>
      storage.setItem(name, value),
    removeItem: (name: string) => storage.removeItem(name),
  };
};
