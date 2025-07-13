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
          console.log('New service worker found');
        });
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

createApp(App).mount('#app')
