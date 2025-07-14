<template>
  <div class="toast-container">
    <transition-group name="toast-fade" tag="div">
      <div v-for="toast in toasts" :key="toast.id" :class="['toast', `toast-${toast.type}`]">
        {{ toast.message }}
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useToast } from '../composables/useToast';

const { toasts } = useToast();
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast {
  padding: 15px 25px;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  transform-origin: bottom right;
}

.toast-info {
  background-color: #2a3b63; /* A deep blue, matching admin theme */
}

.toast-success {
  background-color: #2f855a; /* A nice green */
}

.toast-error {
  background-color: #c53030; /* A standard red */
}

.toast-fade-enter-active, .toast-fade-leave-active {
  transition: all 0.5s ease;
}

.toast-fade-enter-from, .toast-fade-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}
</style> 