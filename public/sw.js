// Service Worker for Survey App - Offline-First PWA
const CACHE_NAME = 'survey-app-v1';
const DATA_CACHE_NAME = 'survey-data-v1';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg',
  '/plan.png'
];

// Large data files to cache separately  
const DATA_FILES = [
  '/gare.json',
  '/output.json', 
  '/streets.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Cache data files separately for better management
      caches.open(DATA_CACHE_NAME).then((cache) => {
        console.log('Caching data files');
        return cache.addAll(DATA_FILES);
      })
    ])
  );

  // Force activation of new service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Take control of all clients immediately
  self.clients.claim();
});

// Fetch event - handle all network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle Firebase Firestore requests
  if (url.origin.includes('firestore.googleapis.com')) {
    event.respondWith(handleFirebaseRequest(request));
    return;
  }

  // Handle data files (cache-first strategy)
  if (DATA_FILES.some(file => request.url.endsWith(file))) {
    event.respondWith(handleDataFileRequest(request));
    return;
  }

  // Handle static assets (cache-first with network fallback)
  if (request.method === 'GET') {
    event.respondWith(handleStaticAssetRequest(request));
    return;
  }
});

// Handle Firebase/Firestore requests (network-first with background sync)
async function handleFirebaseRequest(request) {
  try {
    // Try network first
    const response = await fetch(request);
    
    if (response.ok) {
      return response;
    }
    
    throw new Error(`Firebase request failed: ${response.status}`);
  } catch (error) {
    console.log('Firebase request failed, queuing for background sync:', error);
    
    // If it's a POST request (survey submission), queue it for background sync
    if (request.method === 'POST') {
      await queueSurveyForSync(request);
      
      // Return a success response to the app
      return new Response(
        JSON.stringify({ 
          success: true, 
          offline: true,
          message: 'Survey queued for sync when online' 
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // For GET requests, try to return cached data or fail gracefully
    return new Response(
      JSON.stringify({ error: 'Network unavailable' }), 
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Handle data files (cache-first for offline performance)
async function handleDataFileRequest(request) {
  try {
    // Try cache first
    const cache = await caches.open(DATA_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('Serving data file from cache:', request.url);
      
      // Try to update cache in background if online
      if (navigator.onLine) {
        updateDataFileCache(request, cache);
      }
      
      return cachedResponse;
    }

    // If not in cache, try network
    console.log('Data file not in cache, fetching from network:', request.url);
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache the response
      cache.put(request, response.clone());
      return response;
    }
    
    throw new Error(`Failed to fetch data file: ${response.status}`);
  } catch (error) {
    console.error('Failed to load data file:', request.url, error);
    
    // Return empty array as fallback for JSON files
    const filename = request.url.split('/').pop();
    if (filename.endsWith('.json')) {
      return new Response(
        JSON.stringify([]),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response('File not available offline', { status: 503 });
  }
}

// Handle static assets (cache-first with network fallback)
async function handleStaticAssetRequest(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }

    // Try network if not in cache
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache new responses
      cache.put(request, response.clone());
      return response;
    }
    
    return response;
  } catch (error) {
    // Return cached version or fail gracefully
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Content not available offline', { status: 503 });
  }
}

// Background update for data files
async function updateDataFileCache(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      console.log('Updated data file cache in background:', request.url);
      await cache.put(request, response.clone());
    }
  } catch (error) {
    console.log('Background cache update failed:', error);
  }
}

// Queue survey submissions for background sync
async function queueSurveyForSync(request) {
  try {
    const requestBody = await request.clone().text();
    
    const surveyData = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: requestBody,
      timestamp: Date.now(),
      id: `survey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    // Store in IndexedDB for background sync
    const db = await openIndexedDB();
    const tx = db.transaction(['syncQueue'], 'readwrite');
    await tx.objectStore('syncQueue').add(surveyData);
    
    console.log('Survey queued for background sync:', surveyData.id);

    // Register for background sync
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('survey-sync');
    }
  } catch (error) {
    console.error('Failed to queue survey for sync:', error);
  }
}

// Background sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'survey-sync') {
    console.log('Background sync triggered');
    event.waitUntil(syncPendingSurveys());
  }
});

// Sync pending surveys when online
async function syncPendingSurveys() {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(['syncQueue'], 'readwrite');
    const store = tx.objectStore('syncQueue');
    const surveys = await store.getAll();

    console.log(`Found ${surveys.length} surveys to sync`);

    for (const surveyData of surveys) {
      try {
        const response = await fetch(surveyData.url, {
          method: surveyData.method,
          headers: surveyData.headers,
          body: surveyData.body
        });

        if (response.ok) {
          console.log('Survey synced successfully:', surveyData.id);
          await store.delete(surveyData.id);
          
          // Notify clients of successful sync
          notifyClients('survey-synced', { id: surveyData.id });
        } else {
          console.error('Survey sync failed:', surveyData.id, response.status);
        }
      } catch (error) {
        console.error('Error syncing survey:', surveyData.id, error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Open IndexedDB for sync queue
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SurveyAppSync', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('syncQueue')) {
        const store = db.createObjectStore('syncQueue', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp');
      }
    };
  });
}

// Notify all clients of events
function notifyClients(type, data) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({ type, data });
    });
  });
}

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'GET_SYNC_STATUS':
        getSyncStatus().then(status => {
          event.ports[0].postMessage(status);
        });
        break;
      
      case 'FORCE_SYNC':
        syncPendingSurveys().then(() => {
          event.ports[0].postMessage({ success: true });
        });
        break;
        
      case 'CLEAR_CACHE':
        clearAllCaches().then(() => {
          event.ports[0].postMessage({ success: true });
        });
        break;
    }
  }
});

// Get sync status
async function getSyncStatus() {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(['syncQueue'], 'readonly');
    const surveys = await tx.objectStore('syncQueue').getAll();
    
    return {
      pendingCount: surveys.length,
      surveys: surveys.map(s => ({
        id: s.id,
        timestamp: s.timestamp
      }))
    };
  } catch (error) {
    return { pendingCount: 0, surveys: [], error: error.message };
  }
}

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  console.log('All caches cleared');
}