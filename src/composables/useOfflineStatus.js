// useOfflineStatus.js - Vue composable for offline/online status and PWA functionality
import { ref, reactive, onMounted, onUnmounted } from 'vue'

export function useOfflineStatus() {
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

  // Update online status
  const updateOnlineStatus = () => {
    isOnline.value = navigator.onLine
    if (isOnline.value) {
      attemptBackgroundSync()
    }
  }

  // Register service worker and setup PWA functionality
  const initPWA = async () => {
    if ('serviceWorker' in navigator) {
      try {
        swRegistration = await navigator.serviceWorker.register('/sw.js')
        console.log('Service Worker registered successfully')

        // Listen for service worker messages
        navigator.serviceWorker.addEventListener('message', handleSWMessage)

        // Check if app is already installed
        if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
          isPWAInstalled.value = true
        }

        // Update sync status on registration
        updateSyncStatus()
      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    }
  }

  // Handle service worker messages
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

  // Listen for PWA install prompt (mobile only)
  const handleBeforeInstallPrompt = (e) => {
    // Only show install prompt on mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (!isMobile) {
      e.preventDefault()
      return
    }
    
    e.preventDefault()
    deferredPrompt = e
    isInstallable.value = true
  }

  // Install PWA
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

  // Get sync status from service worker
  const updateSyncStatus = async () => {
    if (!swRegistration || !swRegistration.active) return

    try {
      const messageChannel = new MessageChannel()
      
      const response = await new Promise((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data || { pendingCount: 0 })
        }
        
        // Only post message if service worker is active
        if (swRegistration.active) {
          swRegistration.active.postMessage(
            { type: 'GET_SYNC_STATUS' },
            [messageChannel.port2]
          )
        }
        
        // Timeout after 2 seconds
        setTimeout(() => resolve({ pendingCount: 0 }), 2000)
      })

      syncStatus.pendingCount = response.pendingCount || 0
      syncStatus.syncError = response.error || null
    } catch (error) {
      console.error('Failed to get sync status:', error)
      syncStatus.syncError = 'Erreur de statut de synchronisation'
    }
  }

  // Force manual sync
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
        
        // Timeout after 10 seconds
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

  // Attempt background sync when coming online
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

  // Clear all caches and data
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

  // Get cache storage usage
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

  // Setup event listeners
  onMounted(() => {
    // Network status listeners
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    
    // PWA install prompt listener
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    
    // Initialize PWA
    initPWA()
    
    // Periodic sync status updates
    const syncStatusInterval = setInterval(updateSyncStatus, 30000) // Every 30 seconds
    
    onUnmounted(() => {
      clearInterval(syncStatusInterval)
    })
  })

  // Cleanup event listeners
  onUnmounted(() => {
    window.removeEventListener('online', updateOnlineStatus)
    window.removeEventListener('offline', updateOnlineStatus)
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.removeEventListener('message', handleSWMessage)
    }
  })

  return {
    // Status
    isOnline,
    isInstallable,
    isPWAInstalled,
    syncStatus,
    
    // Actions
    installPWA,
    forceSyncNow,
    clearOfflineData,
    getCacheSize,
    updateSyncStatus,
    
    // Utilities
    swRegistration: () => swRegistration
  }
}