// useOfflineStatus.js - Vue composable for offline/online status and PWA functionality
import { ref, reactive, onMounted, onUnmounted } from 'vue'

// --- STATE (defined outside the function to be a singleton) ---
const isOnline = ref(navigator.onLine)
const isInstallable = ref(false)
const isPWAInstalled = ref(false)
const syncStatus = reactive({
  pendingCount: 0,
  isSyncing: false,
  lastSync: null,
  syncError: null
})

let deferredPrompt = null
let swRegistration = null
let isInitialized = false // Flag to prevent multiple initializations

// --- METHODS (can be defined outside if they don't depend on component lifecycle) ---
const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine
  if (isOnline.value) {
    attemptBackgroundSync()
  }
}

const handleSWMessage = (event) => {
  const { type, data } = event.data
  
  switch (type) {
    case 'survey-synced':
      syncStatus.pendingCount = Math.max(0, syncStatus.pendingCount - 1)
      syncStatus.lastSync = new Date().toISOString()
      break
    case 'sync-error':
      syncStatus.syncError = data.error
      break
  }
}

const handleBeforeInstallPrompt = (e) => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  if (!isMobile) {
    e.preventDefault()
    return
  }
  e.preventDefault()
  deferredPrompt = e
  isInstallable.value = true
}

const updateSyncStatus = async () => {
  if (!swRegistration || !swRegistration.active) return

  try {
    const messageChannel = new MessageChannel()
    
    const response = await new Promise((resolve) => {
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data || { pendingCount: 0 })
      }
      
      if (swRegistration.active) {
        swRegistration.active.postMessage(
          { type: 'GET_SYNC_STATUS' },
          [messageChannel.port2]
        )
      }
      
      setTimeout(() => resolve({ pendingCount: 0 }), 2000)
    })

    syncStatus.pendingCount = response.pendingCount || 0
    syncStatus.syncError = response.error || null
  } catch (error) {
    console.error('Failed to get sync status:', error)
    syncStatus.syncError = 'Erreur de statut de synchronisation'
  }
}

const attemptBackgroundSync = async () => {
  if (swRegistration && 'sync' in window.ServiceWorkerRegistration.prototype) {
    try {
      await swRegistration.sync.register('survey-sync')
      console.log('Background sync registered')
    } catch (error) {
      console.log('Background sync registration failed:', error)
    }
  }
}

export function useOfflineStatus() {

  // --- LOGIC (runs only once) ---
  if (!isInitialized) {
    isInitialized = true

    const initPWA = async () => {
      if ('serviceWorker' in navigator) {
        try {
          swRegistration = await navigator.serviceWorker.register('/sw.js')
          console.log('Service Worker registered successfully')

          navigator.serviceWorker.addEventListener('message', handleSWMessage)

          if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
            isPWAInstalled.value = true
          }
          
          updateSyncStatus()
        } catch (error) {
          console.error('Service Worker registration failed:', error)
        }
      }
    }

    onMounted(() => {
      window.addEventListener('online', updateOnlineStatus)
      window.addEventListener('offline', updateOnlineStatus)
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      initPWA()
    })

    onUnmounted(() => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      if (swRegistration) {
        navigator.serviceWorker.removeEventListener('message', handleSWMessage)
      }
    })
  }

  // --- METHODS EXPOSED TO COMPONENTS ---
  const installPWA = async () => {
    if (!deferredPrompt) return false

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        isPWAInstalled.value = true
        isInstallable.value = false
        console.log('PWA installed successfully')
      }
      
      deferredPrompt = null
      return outcome === 'accepted'
    } catch (error) {
      console.error('PWA installation failed:', error)
      return false
    }
  }

  const forceSyncNow = async () => {
    if (!swRegistration || !swRegistration.active || !isOnline.value) {
      return { success: false, error: 'Pas de connexion ou service worker inactif' }
    }

    try {
      syncStatus.isSyncing = true
      syncStatus.syncError = null

      const messageChannel = new MessageChannel()
      
      const response = await new Promise((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data || { success: false, error: 'Réponse invalide' })
        }
        
        if (swRegistration.active) {
          swRegistration.active.postMessage(
            { type: 'FORCE_SYNC' },
            [messageChannel.port2]
          )
        } else {
          resolve({ success: false, error: 'Service worker inactif' })
        }
        
        setTimeout(() => resolve({ success: false, error: 'Timeout de synchronisation' }), 10000)
      })

      if (response.success) {
        await updateSyncStatus()
        syncStatus.lastSync = new Date().toISOString()
      } else {
        syncStatus.syncError = response.error || 'Erreur de synchronisation inconnue'
      }

      return response
    } catch (error) {
      const errorMessage = 'Erreur lors de la synchronisation'
      syncStatus.syncError = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      syncStatus.isSyncing = false
    }
  }

  const clearOfflineData = async () => {
    if (!swRegistration) return false

    try {
      const messageChannel = new MessageChannel()
      
      const response = await new Promise((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data)
        }
        
        swRegistration.active?.postMessage(
          { type: 'CLEAR_CACHE' },
          [messageChannel.port2]
        )
        
        setTimeout(() => resolve({ success: false }), 5000)
      })

      if (response.success) {
        syncStatus.pendingCount = 0
        syncStatus.lastSync = null
        syncStatus.syncError = null
      }

      return response.success
    } catch (error) {
      console.error('Failed to clear offline data:', error)
      return false
    }
  }

  const getCacheSize = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate()
        return {
          used: estimate.usage,
          available: estimate.quota,
          usedMB: Math.round((estimate.usage || 0) / 1024 / 1024 * 100) / 100,
          availableMB: Math.round((estimate.quota || 0) / 1024 / 1024 * 100) / 100
        }
      } catch (error) {
        console.error('Failed to get storage estimate:', error)
      }
    }
    return null
  }

  // --- RETURN SHARED STATE & METHODS ---
  return {
    isOnline,
    isInstallable,
    isPWAInstalled,
    syncStatus,
    installPWA,
    forceSyncNow,
    clearOfflineData,
    getCacheSize
  }
}