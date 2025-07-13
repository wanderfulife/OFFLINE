<script setup>
import { ref, onMounted } from 'vue';
import Constructor from './components/Constructor.vue';
import AdminDashboard from './components/AdminDashboard.vue';
import OfflineIndicator from './components/OfflineIndicator.vue';

// Define the master Firebase collection name here
const masterFirebaseCollectionName = ref("Offline");

// Register service worker for PWA functionality
onMounted(async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
});
</script>

<template>
  <div id="app-container">
    <!-- Offline Status Indicator -->
    <OfflineIndicator :show-debug-info="false" />
    
    <div class="survey-content-area">
      <Constructor :firebase-collection-override="masterFirebaseCollectionName" />
    </div>
    <div class="admin-section">
      <AdminDashboard :active-firebase-collection-name="masterFirebaseCollectionName" />
    </div>
  </div>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'Arial', sans-serif;
  background-color: #2a3b63; /* Consistent background */
  color: white;
  overflow-x: hidden; /* Prevent horizontal scrolling */
}

#app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* Full viewport height */
  position: relative;
}

.survey-content-area {
  flex: 1; /* Takes up all available space, pushing admin section down */
  display: flex;
  flex-direction: column;
  min-height: 0; /* Allow content to shrink if needed */
  overflow: auto; /* Allow scrolling within content area if needed */
}

.admin-section {
  flex-shrink: 0; /* Prevent the admin section from shrinking */
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #2a3b63; /* Same as main background */
  padding: 20px 0;
  margin: 0;
  border: none;
  position: relative;
  z-index: 10;
  /* Add a subtle top border to separate from content */
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

/* Enhanced button positioning */
.admin-section .btn-signin {
  margin: 0; /* Remove default margin */
  position: relative;
}

/* Ensure proper spacing on mobile */
@media (max-width: 768px) {
  .admin-section {
    padding: 15px 0;
  }
}

/* Handle very small screens */
@media (max-width: 480px) {
  .admin-section {
    padding: 12px 0;
  }
}
</style>
