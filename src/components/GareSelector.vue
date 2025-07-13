<template>
  <div class="form-group">
    <input 
      class="form-control" 
      type="text" 
      v-model="gareInputDisplay" 
      @input="searchGares" 
      @focus="showDropdown = true" 
      placeholder="Saisir ou rechercher une gare (train)" 
    />
    <div v-if="showDropdown && filteredGares.length > 0" class="gare-dropdown autocomplete-results">
      <div 
        v-for="(gare, index) in filteredGares" 
        :key="gare.id || index" 
        @click="selectGare(gare)" 
        class="gare-option autocomplete-option"
      >
        {{ getGareName(gare) }} 
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

const allGares = ref([]); // To store the fetched list of gares

onMounted(async () => {
  try {
    const response = await fetch('/gare.json'); // Assuming gare.json is in /public
    if (response.ok) {
      const data = await response.json();
      // The gare.json already has the correct structure with "Nom Gare" property
      allGares.value = data;
    } else {
      console.error('Error loading gare.json: Response not OK', response.status);
      allGares.value = []; // Ensure it's an empty array on failure
    }
  } catch (error) {
    console.error('Error fetching gare.json:', error);
    allGares.value = []; // Ensure it's an empty array on error
  }
});

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

const searchGares = () => {
  if (!gareInputDisplay.value || !allGares.value.length) {
    filteredGares.value = [];
    // Do not hide dropdown immediately on input, allow clicking
    // showDropdown.value = false; 
    // emit current input if user types and doesn't select
    // emit('update:modelValue', gareInputDisplay.value);
    return;
  }

  const searchTerm = gareInputDisplay.value.toLowerCase();
  filteredGares.value = allGares.value.filter(gare => {
    const name = getGareName(gare);
    return name && typeof name === 'string' && name.toLowerCase().includes(searchTerm);
  }).slice(0, 100); // Limit results

  showDropdown.value = filteredGares.value.length > 0;
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
.form-group {
  position: relative; /* For dropdown positioning */
  margin-bottom: 15px;
}

.form-control {
  width: 100%; 
  max-width: 400px; 
  padding: 10px;
  border-radius: 5px;
  border: 1px solid white;
  background-color: #333; 
  color: white;
  font-size: 16px;
}

/* Using shared styles from SurveyTemplate for consistency */
.autocomplete-results {
  list-style-type: none;
  padding: 0;
  margin: 0;
  border: 1px solid #ccc;
  max-height: 150px;
  overflow-y: auto;
  position: absolute; 
  width: 100%; 
  max-width: 400px; /* Match input width */
  background-color: #fff; 
  color: #333; 
  z-index: 1000; 
  border-radius: 0 0 5px 5px; 
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  top: 100%; /* Position below the input field */
  left: 0;
}

.autocomplete-option {
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #eee; 
}

.autocomplete-option:last-child {
  border-bottom: none;
}

.autocomplete-option:hover {
  background-color: #f0f0f0; 
}

/* Fallback if SurveyTemplate styles aren't available */
.gare-dropdown {
  /* Styles defined above as .autocomplete-results */
}

.gare-option {
 /* Styles defined above as .autocomplete-option */
}
</style>