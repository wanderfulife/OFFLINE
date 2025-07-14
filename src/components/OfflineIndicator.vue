<template>
  <div class="offline-indicator-container">
    <!-- Connection Status Indicator -->
    <div class="connection-status" :class="{ 'online': isOnline, 'offline': !isOnline }">
      <div class="status-dot"></div>
    </div>

    <!-- Sync Status -->
    <div v-if="syncStatus.pendingCount > 0 || syncStatus.isSyncing" class="sync-status">
      <div class="sync-info">
        <div v-if="syncStatus.isSyncing" class="syncing">
          <div class="spinner"></div>
          <span>Synchronisation...</span>
        </div>
        <div v-else class="pending">
          <span class="pending-count">{{ syncStatus.pendingCount }}</span>
          <span>enquête(s) en attente</span>
        </div>
      </div>
      
      <!-- Manual Sync Button -->
      <button 
        v-if="isOnline && !syncStatus.isSyncing && syncStatus.pendingCount > 0"
        @click="handleManualSync"
        class="sync-button"
        :disabled="syncStatus.isSyncing"
      >
        Synchroniser
      </button>
    </div>

    <!-- PWA Install Banner - Hidden as requested -->
    <!-- <div v-if="isInstallable && !isPWAInstalled" class="install-banner">
      <div class="install-message">
        <span>📱 Installer l'application pour une utilisation hors ligne optimale</span>
      </div>
      <button @click="handleInstallApp" class="install-button">
        Installer
      </button>
    </div> -->

    <!-- Error Message -->
    <div v-if="syncStatus.syncError" class="sync-error">
      <span>❌ Erreur de synchronisation: {{ syncStatus.syncError }}</span>
      <button @click="clearError" class="clear-error">×</button>
    </div>

    <!-- Admin/Debug Info (only show in development or for admins) -->
    <div v-if="showDebugInfo" class="debug-info">
      <div class="debug-row">
        <span>Cache: {{ cacheInfo.usedMB || 0 }}MB utilisés</span>
        <button @click="updateCacheInfo" class="debug-button">🔄</button>
      </div>
      <div class="debug-row">
        <span>Dernière sync: {{ formatLastSync(syncStatus.lastSync) }}</span>
        <button @click="clearCache" class="debug-button">🗑️</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useOfflineStatus } from '../composables/useOfflineStatus.js'
import { useToast } from '../composables/useToast.js';

const { showToast } = useToast();

const props = defineProps({
  showDebugInfo: {
    type: Boolean,
    default: false
  }
})

// Use the offline status composable
const {
  isOnline,
  isInstallable,
  isPWAInstalled,
  syncStatus,
  installPWA,
  forceSyncNow,
  clearOfflineData,
  getCacheSize
} = useOfflineStatus()

const cacheInfo = ref({ usedMB: 0, availableMB: 0 })
const surveysToSyncCount = ref(0);

// Watch for pending surveys when coming online
watch(isOnline, (online) => {
  if (online && syncStatus.pendingCount > 0) {
    surveysToSyncCount.value = syncStatus.pendingCount;
  }
});

// Watch for sync completion
watch(() => syncStatus.pendingCount, (newCount, old) => {
  // If count drops to 0 and we had surveys to sync, show a success message
  if (newCount === 0 && surveysToSyncCount.value > 0) {
    showToast(`${surveysToSyncCount.value} enquête(s) hors ligne ont été synchronisée(s) avec succès.`, { 
      duration: 5000, 
      type: 'success' 
    });
    // Reset the counter
    surveysToSyncCount.value = 0;
  }
});


// Handle manual synchronization
const handleManualSync = async () => {
  try {
    const result = await forceSyncNow()
    if (!result.success) {
      console.error('Manual sync failed:', result.error)
    }
  } catch (error) {
    console.error('Manual sync error:', error)
  }
}

// Handle PWA installation
const handleInstallApp = async () => {
  try {
    const installed = await installPWA()
    if (installed) {
      console.log('App installed successfully')
    }
  } catch (error) {
    console.error('Installation failed:', error)
  }
}

// Clear sync error
const clearError = () => {
  syncStatus.syncError = null
}

// Update cache information
const updateCacheInfo = async () => {
  try {
    const info = await getCacheSize()
    if (info) {
      cacheInfo.value = info
    }
  } catch (error) {
    console.error('Failed to get cache info:', error)
  }
}

// Clear all cached data
const clearCache = async () => {
  if (confirm('Supprimer toutes les données mises en cache ? Cette action nécessitera de recharger les données.')) {
    try {
      await clearOfflineData()
      cacheInfo.value = { usedMB: 0, availableMB: 0 }
      alert('Cache vidé avec succès')
    } catch (error) {
      console.error('Failed to clear cache:', error)
      alert('Erreur lors de la suppression du cache')
    }
  }
}

// Format last sync time
const formatLastSync = (timestamp) => {
  if (!timestamp) return 'Jamais'
  
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return 'À l\'instant'
  if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`
  if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`
  
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Initialize cache info on mount
onMounted(() => {
  updateCacheInfo()
})
</script>

<style scoped>
.offline-indicator-container {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.offline-indicator-container > * {
  pointer-events: auto;
}

/* Connection Status */
.connection-status {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: transparent;
  transition: all 0.3s ease;
}

.connection-status.online {
  background: transparent;
}

.connection-status.offline {
  background: transparent;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #22c55e;
  animation: pulse 2s infinite;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
}

.connection-status.offline .status-dot {
  background: #ef4444;
  animation: none;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Sync Status */
.sync-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 12px;
}

.sync-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.syncing {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #3b82f6;
}

.pending {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #f59e0b;
}

.pending-count {
  background: #f59e0b;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: bold;
  font-size: 10px;
  min-width: 16px;
  text-align: center;
}

.spinner {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(59, 130, 246, 0.2);
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.sync-button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
  transition: background 0.2s;
}

.sync-button:hover {
  background: #2563eb;
}

.sync-button:disabled {
  background: #6b7280;
  cursor: not-allowed;
}

/* Install Banner */
.install-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 12px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
  font-size: 12px;
  max-width: 280px;
}

.install-message {
  flex: 1;
}

.install-button {
  background: #10b981;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
  transition: background 0.2s;
}

.install-button:hover {
  background: #059669;
}

/* Error Message */
.sync-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  font-size: 12px;
  max-width: 280px;
}

.clear-error {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Debug Info */
.debug-info {
  padding: 8px 12px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #9ca3af;
  font-size: 11px;
  font-family: monospace;
}

.debug-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.debug-row:last-child {
  margin-bottom: 0;
}

.debug-button {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  font-size: 12px;
  padding: 2px;
}

.debug-button:hover {
  color: white;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .offline-indicator-container {
    top: 10px;
    left: 15px;
  }
  
  .install-banner,
  .sync-error {
    max-width: 240px;
  }
  
  .install-message,
  .sync-error span {
    font-size: 11px;
  }
}

/* Tablet Responsive - optimized for Samsung tablets */
@media (min-width: 768px) and (max-width: 1024px) {
  .offline-indicator-container {
    top: 15px;
    right: 15px;
  }
  
  .connection-status,
  .sync-status,
  .install-banner,
  .sync-error {
    font-size: 13px;
  }
  
  .sync-button,
  .install-button {
    padding: 6px 10px;
    font-size: 12px;
  }
}

.sync-toast {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border-radius: 12px;
  background: rgba(34, 197, 94, 0.9); /* Green background */
  color: white;
  font-size: 16px;
  font-weight: 500;
  animation: fadeInOut 3s ease;
  min-width: 300px;
  text-align: center;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(10px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(10px); }
}
</style>