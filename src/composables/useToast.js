import { reactive } from 'vue';

const toasts = reactive([]);
const toastTimeouts = new Map();

export function useToast() {
  const showToast = (message, options = {}) => {
    const { duration = 3000, type = 'info', id = Date.now() + Math.random() } = options;
    
    // If a toast with this ID already has a timeout, clear it
    if (toastTimeouts.has(id)) {
      clearTimeout(toastTimeouts.get(id));
      toastTimeouts.delete(id);
    }

    const existingIndex = toasts.findIndex(t => t.id === id);
    const newToast = { id, message, type };

    if (existingIndex > -1) {
      toasts[existingIndex] = newToast;
    } else {
      toasts.push(newToast);
    }
    
    const timeout = setTimeout(() => {
      const index = toasts.findIndex(t => t.id === id);
      if (index > -1) {
        toasts.splice(index, 1);
      }
      toastTimeouts.delete(id);
    }, duration);

    toastTimeouts.set(id, timeout);
  };

  return { toasts, showToast };
} 