<template>
  <div class="input-container">
    <input 
      class="form-control" 
      type="text" 
      v-model="gareInputDisplay" 
      @input="searchGaresLocal" 
      @focus="showDropdown = true" 
      placeholder="Saisir ou rechercher une gare (train)" 
    />
    <ul v-if="showDropdown && filteredGares.length > 0" class="autocomplete-results">
      <li 
        v-for="(gare, index) in filteredGares" 
        :key="gare.id || index" 
        @click="selectGare(gare)" 
        class="autocomplete-option"
      >
        {{ getGareName(gare) }} 
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useOfflineData } from '../composables/useOfflineData.js';

const { getGares, searchGares, loadingState } = useOfflineData();
const allGares = ref([]);

const props = defineProps({
  modelValue: String // The selected gare name
});

const emit = defineEmits(['update:modelValue']);

const gareInputDisplay = ref(''); // For the input field, distinct from modelValue for more control
const showDropdown = ref(false);
const filteredGares = ref([]);

// Helper to get gare name if it's an object, or return the string itself
const getGareName = (gare) => {
  if (typeof gare === 'object' && gare !== null) {
    // Handle the actual structure from gare.json which uses "Nom Gare"
    return gare["Nom Gare"] || gare.name || gare;
  }
  return gare;
};

const searchGaresLocal = async () => {
  if (!gareInputDisplay.value) {
    filteredGares.value = [];
    return;
  }

  try {
    // Use the offline-first search function
    filteredGares.value = await searchGares(gareInputDisplay.value, 100);
    showDropdown.value = filteredGares.value.length > 0;
  } catch (error) {
    console.error('Error searching gares:', error);
    filteredGares.value = [];
    showDropdown.value = false;
  }
};

const selectGare = (gare) => {
  const selectedName = getGareName(gare);
  gareInputDisplay.value = selectedName; 
  emit('update:modelValue', selectedName);
  showDropdown.value = false;
  filteredGares.value = [];
};

// Watch for external changes to modelValue to update the input display
watch(() => props.modelValue, (newVal) => {
  if (newVal !== gareInputDisplay.value) {
    gareInputDisplay.value = newVal || '';
    if (!newVal) { // If modelValue is cleared externally, clear filtered results
        filteredGares.value = [];
        showDropdown.value = false;
    }
  }
});

// Optional: Hide dropdown if clicked outside
// This would require a bit more setup, possibly a global click listener or a wrapper div with @blur
// For simplicity, a @focus on input shows it, selection hides it.

</script>

<style scoped>
/* All scoped styles removed for global consistency */
</style>