/**
 * IndexedDB helper for client-side workout data storage
 */

import { TWorkoutData } from '../types';

export const WORKOUTS_DB_NAME = 'mindstack-workouts';
export const WORKOUTS_STORE_NAME = 'workouts';
export const WORKOUTS_DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;

/**
 * Get or create the IndexedDB database instance
 */
export async function getWorkoutsDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  if (typeof window === 'undefined' || !window.indexedDB) {
    const error = new Error('IndexedDB is not available');
    // eslint-disable-next-line no-console
    console.error('[indexedDB:getWorkoutsDB]', 'IndexedDB is not available', {
      error,
      hasWindow: typeof window !== 'undefined',
      hasIndexedDB: typeof window !== 'undefined' && !!window.indexedDB,
    });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(WORKOUTS_DB_NAME, WORKOUTS_DB_VERSION);

    request.onerror = (event) => {
      const error = new Error('Failed to open IndexedDB');
      // eslint-disable-next-line no-console
      console.error('[indexedDB:getWorkoutsDB]', 'Failed to open IndexedDB', {
        error,
        event,
      });
      debugger; // eslint-disable-line no-debugger
      reject(error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(WORKOUTS_STORE_NAME)) {
        const store = db.createObjectStore(WORKOUTS_STORE_NAME, { keyPath: 'topicId' });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };
  });
}

/**
 * Save a workout to IndexedDB
 */
export async function saveWorkoutToDB(topicId: string, workout: TWorkoutData): Promise<void> {
  const db = await getWorkoutsDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([WORKOUTS_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(WORKOUTS_STORE_NAME);

    const data = {
      topicId,
      ...workout,
      updatedAt: new Date(), // new Date().toISOString(),
    };

    const request = store.put(data);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      const error = new Error(`Failed to save workout for topic ${topicId}`);
      // eslint-disable-next-line no-console
      console.error('[indexedDB:saveWorkoutToDB]', `Failed to save workout for topic ${topicId}`, {
        error,
        topicId,
        workout,
      });
      debugger; // eslint-disable-line no-debugger
      reject(error);
    };
  });
}

/**
 * Get a workout from IndexedDB by topicId
 */
export async function getWorkoutFromDB(topicId: string): Promise<TWorkoutData | null> {
  const db = await getWorkoutsDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([WORKOUTS_STORE_NAME], 'readonly');
    const store = transaction.objectStore(WORKOUTS_STORE_NAME);
    const request = store.get(topicId);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      const error = new Error(`Failed to get workout for topic ${topicId}`);
      // eslint-disable-next-line no-console
      console.error('[indexedDB:getWorkoutFromDB]', `Failed to get workout for topic ${topicId}`, {
        error,
        topicId,
      });
      debugger; // eslint-disable-line no-debugger
      reject(error);
    };
  });
}

/**
 * Delete a workout from IndexedDB by topicId
 */
export async function deleteWorkoutFromDB(topicId: string): Promise<void> {
  const db = await getWorkoutsDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([WORKOUTS_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(WORKOUTS_STORE_NAME);
    const request = store.delete(topicId);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      const error = new Error(`Failed to delete workout for topic ${topicId}`);
      // eslint-disable-next-line no-console
      console.error(
        '[indexedDB:deleteWorkoutFromDB]',
        `Failed to delete workout for topic ${topicId}`,
        {
          error,
          topicId,
        },
      );
      debugger; // eslint-disable-line no-debugger
      reject(error);
    };
  });
}

/* // UNUSED
 * export async function saveOrDeleteWorkoutInDB(topicId?: TTopicId, workout?: TWorkoutData | null) {
 *   if (!topicId) {
 *     return;
 *   }
 *   try {
 *     console.log('[indexedDB:saveOrDeleteWorkoutInDB]', {
 *       workout,
 *       topicId,
 *     });
 *     if (workout) {
 *       await saveWorkoutToDB(topicId, workout);
 *     } else {
 *       await deleteWorkoutFromDB(topicId);
 *     }
 *   } catch (error) {
 *     const message = 'Failed to save workout to IndexedDB';
 *     // eslint-disable-next-line no-console
 *     console.error('[indexedDB:saveOrDeleteWorkoutInDB]', message, {
 *       error,
 *       topicId,
 *       workout,
 *     });
 *     debugger; // eslint-disable-line no-debugger
 *   }
 * }
 */

/**
 * Get all workout topic IDs from IndexedDB
 */
export async function getAllWorkoutTopicIds(): Promise<string[]> {
  const db = await getWorkoutsDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([WORKOUTS_STORE_NAME], 'readonly');
    const store = transaction.objectStore(WORKOUTS_STORE_NAME);
    const request = store.getAllKeys();

    request.onsuccess = () => {
      resolve(request.result as string[]);
    };

    request.onerror = () => {
      const error = new Error('Failed to get all workout topic IDs');
      // eslint-disable-next-line no-console
      console.error('[indexedDB:getAllWorkoutTopicIds]', 'Failed to get all workout topic IDs', {
        error,
      });
      debugger; // eslint-disable-line no-debugger
      reject(error);
    };
  });
}

/**
 * Get all workouts from IndexedDB
 */
export async function getAllWorkoutsFromDB(): Promise<TWorkoutData[]> {
  const db = await getWorkoutsDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([WORKOUTS_STORE_NAME], 'readonly');
    const store = transaction.objectStore(WORKOUTS_STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      const error = new Error('Failed to get all workouts');
      // eslint-disable-next-line no-console
      console.error('[indexedDB:getAllWorkoutsFromDB]', 'Failed to get all workouts', {
        error,
      });
      debugger; // eslint-disable-line no-debugger
      reject(error);
    };
  });
}

/**
 * Clear all workouts from IndexedDB
 */
export async function clearAllWorkoutsFromDB(): Promise<void> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return;
  }

  try {
    const db = await getWorkoutsDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([WORKOUTS_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(WORKOUTS_STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        const error = new Error('Failed to clear all workouts');
        // eslint-disable-next-line no-console
        console.error('[indexedDB:clearAllWorkoutsFromDB]', 'Failed to clear all workouts', {
          error,
        });
        debugger; // eslint-disable-line no-debugger
        reject(error);
      };
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[indexedDB:clearAllWorkoutsFromDB]', 'Failed to clear all workouts', {
      error,
    });
    debugger; // eslint-disable-line no-debugger
  }
}
