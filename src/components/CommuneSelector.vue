<!-- CommuneSelector.vue -->
<template>
  <div class="form-group">
    <input class="form-control" type="text" v-model="postalCodeInput" @input="search"
      placeholder="Code postal (ex: 92, 54)" />
    <input class="form-control" type="text" v-model="communeInput" @input="search" placeholder="Nom de la commune" />
    <div v-if="showDropdown" class="commune-dropdown">
      <div v-for="item in filteredCommunes" :key="item['CODE INSEE']" @click="selectCommune(item)"
        class="commune-option">
        {{ item.COMMUNE }} ({{ item['CODE POSTAL'] }})
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

const insee = ref([]);

onMounted(async () => {
  try {
    const response = await fetch('/output.json');
    insee.value = await response.json();
  } catch (error) {
    console.error('Error loading insee data:', error);
  }
});

const props = defineProps({
  modelValue: String,
  postalCodePrefix: String
});

const emit = defineEmits(['update:modelValue', 'update:postalCodePrefix']);

const postalCodeInput = ref('');
const communeInput = ref('');
const showDropdown = ref(false);
const filteredCommunes = ref([]);

const search = () => {
  if ((postalCodeInput.value.length < 2 && communeInput.value.length < 2) || !insee.value.length) {
    showDropdown.value = false;
    return;
  }

  filteredCommunes.value = insee.value.filter(item => {
    if (!item) return false;

    const commune = item.COMMUNE ? item.COMMUNE.toLowerCase() : '';
    const postalCode = item['CODE POSTAL'] ? item['CODE POSTAL'].toString() : '';

    const postalCodeMatch = postalCode.startsWith(postalCodeInput.value);
    const communeMatch = commune.includes(communeInput.value.toLowerCase());

    return postalCodeMatch && communeMatch;
  }).slice(0, 100);

  showDropdown.value = filteredCommunes.value.length > 0;

  // Emit the current inputs as the selected values
  emit('update:modelValue', `${communeInput.value}`);
  emit('update:postalCodePrefix', postalCodeInput.value);
};

const selectCommune = (item) => {
  if (item && item.COMMUNE && item['CODE INSEE']) {
    communeInput.value = item.COMMUNE;
    postalCodeInput.value = item['CODE POSTAL'] ? item['CODE POSTAL'].toString() : '';
    
    emit('update:modelValue', `${item.COMMUNE} - ${item['CODE INSEE']}`);
    emit('update:postalCodePrefix', postalCodeInput.value);
    
    showDropdown.value = false;
  }
};

watch(() => props.modelValue, (newVal) => {
  if (newVal && typeof newVal === 'string') {
    const parts = newVal.split(' - ');
    communeInput.value = parts[0] || '';
    if (parts.length > 1 && !postalCodeInput.value) {
        const matchedCommune = insee.value.find(i => i['CODE INSEE'] === parts[1]);
        if (matchedCommune && matchedCommune['CODE POSTAL']) {
            postalCodeInput.value = matchedCommune['CODE POSTAL'].toString();
        }
    }

  } else if (!newVal) {
    communeInput.value = '';
  }
});

watch(() => props.postalCodePrefix, (newVal) => {
  if (newVal && newVal !== postalCodeInput.value) {
    postalCodeInput.value = newVal;
  } else if (!newVal) {
    postalCodeInput.value = '';
  }
});
</script>

<style scoped>
.form-group {
  position: relative; /* Needed for absolute positioning of the dropdown */
}

.commune-dropdown {
  position: absolute;
  width: 100%; /* Make dropdown same width as input */
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid white;
  background-color: #333; /* Match input background */
  color: white; /* Match input text color */
  z-index: 1000; /* Ensure it's above other elements */
  border-top: none; /* Remove top border if it directly touches the input above */
  border-radius: 0 0 5px 5px; /* Rounded bottom corners */
  /* Adjust top position to be right under the second input field */
  /* This might need fine-tuning depending on exact input heights and margins */
  top: calc(100% - 10px); /* Attempt to position below the last input, adjust 10px as needed */
  left: 0;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1); /* Optional: add a subtle shadow */
}

.commune-option {
  padding: 10px; /* Increased padding */
  cursor: pointer;
  color: white; /* Ensure text is white */
  border-bottom: 1px solid #444; /* Subtle separator for options */
}

.commune-option:last-child {
  border-bottom: none; /* No border for the last item */
}

.commune-option:hover {
  background-color: #4a5a83; /* A dark blue hover, consistent with SurveyTemplate */
}

.form-control {
  margin-bottom: 10px;
}
</style>
