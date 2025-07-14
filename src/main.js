import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    })
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('New service worker found, updating...');
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New service worker installed, reloading page...');
                // Auto-reload when new version is available
                window.location.reload();
              }
            });
          }
        });
        
        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data.type === 'SW_UPDATED') {
            console.log('Service Worker updated to version:', event.data.version);
            // Force a hard reload to get latest assets
            window.location.reload(true);
          }
        });
        
        // Check for updates every 30 seconds in development
        if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
          setInterval(() => {
            registration.update();
          }, 30000);
        }
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

createApp(App).mount('#app')
